"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Flame, UserPlus, MessageCircle, Bell } from "lucide-react";
import { onMarkNotificationAsRead } from "@/actions/user-actions";

type Notification = {
    id: number;
    userId: string;
    type: string;
    message: string;
    link: string | null;
    read: boolean;
    createdAt: Date | null;
};

type Props = {
    notifications: Notification[];
};

export const NotificationList = ({ notifications }: Props) => {
    
    const getIcon = (type: string) => {
        switch (type) {
            case "streak":
                return <Flame className="h-6 w-6 text-orange-500" />;
            case "follow":
                return <UserPlus className="h-6 w-6 text-purple-500" />;
            case "message":
                return <MessageCircle className="h-6 w-6 text-sky-500" />;
            default:
                return <Bell className="h-6 w-6 text-slate-500" />;
        }
    };

    const handleClick = async (id: number, read: boolean) => {
        if (!read) {
            await onMarkNotificationAsRead(id);
        }
    };

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <p className="text-4xl mb-4">🔔</p>
                <p className="font-bold">Sem notificações novas</p>
                <p className="text-slate-400">Tudo calmo por aqui.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {notifications.map((n) => {
                // If there's a link, we navigate. Otherwise it's just a div.
                const Wrapper = n.link ? Link : ("div" as any);
                const props = n.link ? { href: n.link } : {};

                return (
                    <Wrapper
                        key={n.id}
                        {...props}
                        onClick={() => handleClick(n.id, n.read)}
                        className={cn(
                            "relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all hover:bg-slate-50",
                            !n.read ? "bg-sky-50/50 border-sky-200" : "bg-white border-slate-200",
                            n.link && "cursor-pointer"
                        )}
                    >
                        {/* Unread Indicator Pulse Dot */}
                        {!n.read && (
                            <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
                        )}

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border-2 border-slate-100 shadow-sm">
                            {getIcon(n.type)}
                        </div>
                        <div className="flex flex-col pr-6">
                            <p className={cn("text-slate-700", !n.read ? "font-bold" : "font-medium")}>
                                {n.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {new Date(n.createdAt!).toLocaleDateString("pt-PT", {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </Wrapper>
                );
            })}
        </div>
    );
};
