"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { supabase, setSupabaseAuth, createClerkSupabaseClient } from "@/lib/supabaseClient";

interface GlobalPresenceContextType {
    onlineUserIds: string[];
    isPartnerOnline: (partnerId: string) => boolean;
}

const GlobalPresenceContext = createContext<GlobalPresenceContextType>({
    onlineUserIds: [],
    isPartnerOnline: () => false,
});

export const useGlobalPresence = () => useContext(GlobalPresenceContext);

export const GlobalPresenceProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, getToken, isLoaded: isAuthLoaded } = useAuth();
    const { user } = useUser();
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const channelRef = useRef<any>(null);

    // 🌍 CONSOLIDATED EFFECT: Global Presence Lifecycle
    useEffect(() => {
        if (!isAuthLoaded || !userId || !user) return;

        let activeChannel: any;
        let isStopped = false;

        const connectAndSync = async () => {
            try {
                const token = await getToken({ template: 'supabase' });
                if (!token || isStopped) return;

                // Sync global auth
                await setSupabaseAuth(token);

                // Use the global multiplexed supabase client
                const channel = supabase.channel('global_presence', {
                    config: {
                        presence: { key: userId },
                    },
                });

                channel.on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState();
                    const onlineIds = Object.keys(state);
                    setOnlineUserIds(onlineIds);
                });

                channel.subscribe(async (status, err) => {
                    const timestamp = new Date().toLocaleTimeString();
                    if (status === 'SUBSCRIBED') {
                        console.log(`[GlobalPresence] 🟢 [${timestamp}] Conectado ao Presence.`);
                        await channel.track({ 
                            online_at: new Date().toISOString(),
                            username: user.username || user.firstName 
                        });
                    } else if (status === 'CLOSED') {
                        if (!isStopped) {
                            console.warn(`[GlobalPresence] 📡 [${timestamp}] Connection CLOSED unexpected.`);
                            // Attempt to recover channel
                            setTimeout(() => {
                                if (!isStopped && activeChannel) {
                                    activeChannel.subscribe();
                                }
                            }, 3000);
                        }
                    } else if (status === 'TIMED_OUT') {
                        console.error(`[GlobalPresence] ⏱️ [${timestamp}] Timeout ao conectar.`);
                    }
                });

                activeChannel = channel;
                channelRef.current = channel;
            } catch (err) {
                console.error("[GlobalPresence] Connection error:", err);
            }
        };

        connectAndSync();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && activeChannel?.state !== "joined") {
                connectAndSync();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            isStopped = true;
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (activeChannel) {
                console.log("[GlobalPresence] 🔌 Cleanup: Disconnecting presence");
                supabase.removeChannel(activeChannel);
            }
        };
    }, [isAuthLoaded, userId, user]); // Removed volatile getToken and isInternalAuthReady

    const isPartnerOnline = (partnerId: string) => {
        return onlineUserIds.includes(partnerId);
    };

    return (
        <GlobalPresenceContext.Provider value={{ onlineUserIds, isPartnerOnline }}>
            {children}
        </GlobalPresenceContext.Provider>
    );
};
