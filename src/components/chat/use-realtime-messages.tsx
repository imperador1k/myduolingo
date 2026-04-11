import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { supabase, setSupabaseAuth } from "@/lib/supabaseClient";

export const useRealtimeMessages = (initialMessages: any[], userId: string, conversationId: string) => {
    const [messages, setMessages] = useState(initialMessages);
    const [isPartnerOnline, setIsPartnerOnline] = useState(false);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const channelRef = useRef<any>(null);
    const { playPop } = useUISounds();
    const { getToken } = useAuth();

    // 🔄 EFFECT 1: Sync initial messages
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // 🔄 EFFECT 2: Main Subscription Lifecycle
    useEffect(() => {
        if (!conversationId || !userId) return;

        let activeChannel: any;

        const initChat = async () => {
            // 1. Authenticate the singleton client for this session
            const token = await getToken({ template: 'supabase' });
            if (token) setSupabaseAuth(token);

            // 2. Setup the single channel
            const channel = supabase.channel(`chat_room:${conversationId}`, {
                config: {
                    presence: { key: userId },
                },
            });

            // 3. postgres_changes: New Messages
            channel.on(
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
                        if (prev.some((m) => m.id === newMsg.id)) return prev;
                        if (newMsg.sender_id !== userId) playPop();
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
            );

            // 4. postgres_changes: Read receipts
            channel.on(
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
            );

            // 5. postgres_changes: Reactions (Global for now, filters can be added)
            channel.on(
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
            );

            // 6. Presence: Online Status & Typing
            channel.on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const others = Object.keys(state).filter(k => k !== userId);
                
                setIsPartnerOnline(others.length > 0);
                
                const someoneTyping = others.some(uid => {
                    const userState = state[uid] as any;
                    return userState && userState[0]?.isTyping;
                });
                setIsPartnerTyping(someoneTyping);
            });

            // 7. Subscribe and Track
            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Realtime] 🚀 Conectado ao chat: ${conversationId}`);
                    await channel.track({ online_at: new Date().toISOString(), isTyping: false });
                } else if (status === 'CHANNEL_ERROR') {
                    console.error(`[Realtime] ❌ Erro de subscrição no canal ${conversationId}`);
                }
            });

            activeChannel = channel;
            channelRef.current = channel;
        };

        initChat();

        // Cleanup
        return () => {
            if (activeChannel) {
                console.log(`[Realtime] 🔌 Desconectando do chat: ${conversationId}`);
                supabase.removeChannel(activeChannel);
            }
        };
    }, [conversationId, userId, getToken]);

    // 🔄 EFFECT 3: Proactive Token Refresh (Stays ahead of Clerk's 60s expiry)
    useEffect(() => {
        const interval = setInterval(async () => {
            const token = await getToken({ template: 'supabase' });
            if (token) {
                setSupabaseAuth(token);
            }
        }, 50000); // 50s refresh
        return () => clearInterval(interval);
    }, [getToken]);

    const addOptimisticMessage = (msg: any) => {
        setMessages((prev) => [...prev, msg]);
    };

    const trackTyping = (isTyping: boolean) => {
        if (channelRef.current) {
            channelRef.current.track({ isTyping, online_at: new Date().toISOString() });
        }
    };

    return { messages, addOptimisticMessage, isPartnerOnline, isPartnerTyping, trackTyping };
};
