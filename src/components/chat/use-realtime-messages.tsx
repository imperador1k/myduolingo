"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useUISounds } from "@/hooks/use-ui-sounds";

export const useRealtimeMessages = (initialMessages: any[], userId: string, conversationId: string) => {
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
        if (!conversationId) return;

        const channel = supabase
            .channel(`realtime:messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload: any) => {
                    const newMsg = payload.new;
                    setMessages((prev) => {
                        // Prevent duplicates
                        if (prev.some((m) => m.id === newMsg.id)) return prev;

                        // Play sound if received from someone else
                        if (newMsg.sender_id !== userId) {
                            playPop();
                        }

                        // Clear temp optimistic messages when real ones arrive
                        const filtered = prev.filter(m => !m.id?.toString().startsWith('temp-'));

                        return [...filtered, {
                            ...newMsg,
                            senderId: newMsg.sender_id,
                            conversationId: newMsg.conversation_id,
                            createdAt: new Date(newMsg.created_at),
                            imageUrl: newMsg.image_url,
                            fileName: newMsg.file_name,
                        }];
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload: any) => {
                    const updatedMsg = payload.new;
                    setMessages((prev) => prev.map((msg) => 
                        msg.id === updatedMsg.id 
                            ? { ...msg, read: updatedMsg.read } 
                            : msg
                    ));
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'message_reactions',
                },
                (payload: any) => {
                    const reaction = payload.new || payload.old;
                    if (!reaction) return;

                    setMessages((prev) => prev.map((msg) => {
                        if (msg.id === reaction.message_id) {
                            const currentReactions = msg.reactions || [];
                            if (payload.eventType === 'INSERT') {
                                // Add reaction if not already present
                                if (currentReactions.some((r: any) => r.id === reaction.id)) return msg;
                                return {
                                    ...msg,
                                    reactions: [...currentReactions, {
                                        id: reaction.id,
                                        messageId: reaction.message_id,
                                        userId: reaction.user_id,
                                        emoji: reaction.emoji,
                                        createdAt: reaction.created_at
                                    }]
                                };
                            } else if (payload.eventType === 'DELETE') {
                                return {
                                    ...msg,
                                    reactions: currentReactions.filter((r: any) => r.id !== reaction.id)
                                };
                            }
                        }
                        return msg;
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, conversationId]);

    // Presence Effect (Using conversationId as the room)
    useEffect(() => {
        if (!userId || !conversationId) return;

        const roomId = `presence_${conversationId}`;
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
                
                // For groups, we might want to check all users. 
                // For now, let's keep it simple: if there's > 1 user, someone else is here.
                const otherUsers = Object.keys(newState).filter(id => id !== userId);
                setIsPartnerOnline(otherUsers.length > 0);

                const someoneIsTyping = otherUsers.some(uid => {
                    const presence = newState[uid] as any;
                    return presence && presence[0] && presence[0].isTyping;
                });
                setIsPartnerTyping(someoneIsTyping);
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
    }, [userId, conversationId]);

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
