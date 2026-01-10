"use client";

import { useEffect, useTransition } from "react";
import { onSyncUserInfo } from "@/actions/user-progress";

export const UserSync = () => {
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        // Sync user info on mount (once per session)
        const synced = sessionStorage.getItem("userSynced");

        if (!synced) {
            startTransition(() => {
                onSyncUserInfo()
                    .then(() => {
                        sessionStorage.setItem("userSynced", "true");
                    })
                    .catch(console.error);
            });
        }
    }, []);

    // This component renders nothing
    return null;
};
