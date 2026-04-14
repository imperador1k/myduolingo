"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";
import { useAuth } from "@clerk/nextjs";

export const OneSignalProvider = () => {
    const { userId } = useAuth();
    const isInitialized = useRef(false);

    useEffect(() => {
        const initOneSignal = async () => {
            if (isInitialized.current) return;
            
            try {
                // OneSignal needs to be initialized only once per session
                isInitialized.current = true;

                await OneSignal.init({
                    appId: "23b0fe4f-661c-4726-91ad-92f20d9c6ac0",
                    safari_web_id: "web.onesignal.auto.3db514d6-c75f-4a27-ad99-adae19a9a814",
                    allowLocalhostAsSecureOrigin: true
                });

                console.log("OneSignal App ID Initialized");
            } catch (error) {
                console.error("OneSignal initialization failed:", error);
            }
        };

        // Ensure we're in the browser environment before initializing
        if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
            initOneSignal();
        }
    }, []);

    useEffect(() => {
        // Link the Supabase (Clerk) userId to the OneSignal External ID
        const loginOneSignal = async () => {
             if (userId && isInitialized.current) {
                try {
                    await OneSignal.login(userId);
                    console.log("Logged into OneSignal with user:", userId);
                } catch (error) {
                    console.error("OneSignal login failed:", error);
                }
             }
        };

        if (typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
            loginOneSignal();
        }
    }, [userId]);

    return null;
};
