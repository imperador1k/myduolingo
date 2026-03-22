"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useUISounds } from "@/hooks/use-ui-sounds";

export const useRealtimeMessages = (initialMessages: any[], userId: string, otherUserId: string) => {
    const [messages, setMessages] = useState(initialMessages);
    const [isPartnerOnline, setIsPartnerOnline] = useState(false);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const presenceChannelRef = useRef<any>(null);
    const { playPop } = useUISounds();
    const { getToken } = useAuth();

    // Dynamically create the Supabase client to inject the Clerk JWT securely
    const supabase = useMemo(() => {
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    fetch: async (url, options = {}) => {
                        const clerkToken = await getToken({ template: 'supabase' });
                        const headers = new Headers(options?.headers);
                        if (clerkToken) {
                            headers.set('Authorization', `Bearer ${clerkToken}`);
                        }
                        return fetch(url, { ...options, headers });
                    },
                },
            }
        );
    }, [getToken]);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        const channel = supabase
            .channel('realtime:messages') // Unique tag
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const newMsg = payload.new as any;
                    
                    if (payload.eventType === 'INSERT') {
                        // Filter: Only relevant messages
                        if (
                            (newMsg.sender_id === userId && newMsg.receiver_id === otherUserId) ||
                            (newMsg.sender_id === otherUserId && newMsg.receiver_id === userId)
                        ) {
                            setMessages((prev) => {
                                // Prevent duplicates
                                if (prev.some((m) => m.id === newMsg.id)) return prev;

                                // Play sound if received from partner
                                if (newMsg.sender_id === otherUserId) {
                                    playPop();
                                }

                                // Clear temp optimistic messages when real ones arrive
                                const filtered = prev.filter(m => !m.id?.toString().startsWith('temp-'));

                                return [...filtered, {
                                    ...newMsg,
                                    senderId: newMsg.sender_id, // Map snake_case to camelCase
                                    receiverId: newMsg.receiver_id,
                                    createdAt: new Date(newMsg.created_at),
                                    content: newMsg.content,
                                    type: newMsg.type,
                                    fileName: newMsg.file_name,
                                }];
                            });
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        // Update existing message (e.g., read status changed)
                        setMessages((prev) => prev.map((msg) => 
                            msg.id === newMsg.id 
                                ? { ...msg, read: newMsg.read } 
                                : msg
                        ));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, otherUserId]);

    // Presence Effect
    useEffect(() => {
        if (!userId || !otherUserId) return;

        const roomId = `presence_${[userId, otherUserId].sort().join('_')}`;
        const channel = supabase.channel(roomId, {
            config: {
                presence: {
                    key: userId,
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const partnerPresence = newState[otherUserId];
                
                setIsPartnerOnline(!!partnerPresence);

                if (partnerPresence && partnerPresence[0]) {
                    setIsPartnerTyping((partnerPresence[0] as any).isTyping || false);
                } else {
                    setIsPartnerTyping(false);
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString(), isTyping: false });
                }
            });

        presenceChannelRef.current = channel;

        return () => {
            channel.unsubscribe();
        };
    }, [userId, otherUserId]);

    const addOptimisticMessage = (msg: any) => {
        setMessages((prev) => [...prev, msg]);
    };

    const trackTyping = (isTyping: boolean) => {
        if (presenceChannelRef.current) {
            presenceChannelRef.current.track({ isTyping, online_at: new Date().toISOString() });
        }
    };

    return { messages, addOptimisticMessage, isPartnerOnline, isPartnerTyping, trackTyping };
};
