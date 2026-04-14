import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { supabase, setSupabaseAuth, createClerkSupabaseClient } from "@/lib/supabaseClient";

export const useRealtimeMessages = (initialMessages: any[], userId: string, conversationId: string) => {
    const [messages, setMessages] = useState(initialMessages);
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const channelRef = useRef<any>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { playPop } = useUISounds();
    const { getToken } = useAuth();

    // 🔄 EFFECT 1: Sync initial messages
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // 🔄 REFACTORED: Bionic Listener (Final Test)
    useEffect(() => {
        if (!conversationId || !userId) return;

        let isStopped = false;
        
        const initChat = async () => {
            if (channelRef.current?.state === 'joined' && channelRef.current.topic.includes(conversationId)) {
                return;
            }

            try {
                const token = await getToken({ template: 'supabase' });
                if (!token || isStopped) return;

                await setSupabaseAuth(token);
                supabase.realtime.setAuth(token);

                // Criamos o canal
                const channel = supabase.channel(`chat_${conversationId}`, {
                    config: { presence: { key: userId } },
                });

                // 🕵️ ESCUTA TOTAL: Ouve TUDO o que acontece na tabela messages
                channel.on(
                    'postgres_changes' as any,
                    { event: '*', schema: 'public', table: 'messages' }, // Explicit schema for TS sanity
                    (payload: any) => {
                        console.log("[RealtimeChat] 📡 EVENTO DETETADO NA TABELA!", payload.event, payload);
                        
                        const newMsg = payload.new;
                        if (!newMsg) {
                            console.warn("[RealtimeChat] ⚠️ Evento recebido mas SEM DADOS (Payload vazio). Pode ser RLS!");
                            return;
                        }

                        // Comparação ultra-permissiva
                        const msgConvId = String(newMsg.conversation_id || "").toLowerCase();
                        const currentConvId = String(conversationId).toLowerCase();

                        if (msgConvId === currentConvId) {
                            console.log("[RealtimeChat] ✅ Mensagem válida! Atualizando...");
                            setMessages((prev) => {
                                if (prev.some((m) => m.id === newMsg.id)) return prev;
                                if (newMsg.sender_id !== userId) playPop();
                                return [...prev.filter(m => !m.id?.toString().startsWith('temp-')), {
                                    ...newMsg,
                                    senderId: newMsg.sender_id,
                                    conversationId: newMsg.conversation_id,
                                    createdAt: new Date(newMsg.created_at || Date.now()),
                                }];
                            });
                        } else {
                            console.log(`[RealtimeChat] ⏭️ Ignorada: Conv ${msgConvId} != ${currentConvId}`);
                        }
                    }
                );

                channel.on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState();
                    const others = Object.keys(state).filter(k => k !== userId);
                    setIsPartnerTyping(others.some(uid => (state[uid] as any[])[0]?.isTyping));
                });

                channel.subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log(`[RealtimeChat] 🟢 CANAL ATIVO: ${conversationId}`);
                        await channel.track({ isTyping: false });
                    }
                });

                channelRef.current = channel;
            } catch (err) {
                console.error("[RealtimeChat] Erro fatal:", err);
            }
        };

        initChat();

        return () => {
            isStopped = true;
            if (channelRef.current) {
                console.log(`[RealtimeChat] 🔴 Fechando canal ${conversationId}`);
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [conversationId, userId]); // Dependências mínimas para evitar jitter // Removed getToken and isInternalAuthReady to stabilize the effect

    const trackTyping = useCallback((isTyping: boolean) => {
        if (channelRef.current && channelRef.current.state === "joined") {
            console.log(`[RealtimeChat] ⌨️ Tracking typing: ${isTyping}`);
            channelRef.current.track({ isTyping, online_at: new Date().toISOString() }).catch((err: any) => {
                console.error("[RealtimeChat] ❌ Falha no trackTyping", err);
            });
        } else {
            console.warn(`[RealtimeChat] ⚠️ trackTyping ignorado. Canal estado: ${channelRef.current?.state}`);
        }
    }, []);

    const addOptimisticMessage = (msg: any) => {
        setMessages((prev) => [...prev, msg]);
    };

    // isPartnerOnline was removed. We return isPartnerTyping.
    return { messages, addOptimisticMessage, isPartnerTyping, trackTyping };
};
