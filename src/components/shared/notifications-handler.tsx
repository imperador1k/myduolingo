"use client";

import { useEffect } from "react";
import { markNotificationsAsRead } from "@/actions/user-actions";

export const NotificationsHandler = () => {
    useEffect(() => {
        markNotificationsAsRead();
    }, []);

    return null;
};
