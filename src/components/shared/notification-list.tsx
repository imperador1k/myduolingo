"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Flame, UserPlus, MessageCircle, Bell } from "lucide-react";
import { onMarkNotificationAsRead } from "@/actions/user-actions";
import { LottieBlock } from "@/components/ui/lottie-block";
import useSound from "use-sound";

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
    const [mounted, setMounted] = useState(false);
    const [playSuccess] = useSound("/sounds/success.mp3", { volume: 0.3 });

    useEffect(() => {
        setMounted(true);
    }, []);

    const getIconBlock = (type: string) => {
        switch (type) {
            case "streak":
                return (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border-2 border-orange-200 border-b-4 shadow-sm group-active:translate-y-1 transition-transform">
                        <Flame className="h-7 w-7 text-orange-500 fill-orange-200" />
                    </div>
                );
            case "follow":
                return (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-50 border-2 border-purple-200 border-b-4 shadow-sm group-active:translate-y-1 transition-transform">
                        <UserPlus className="h-7 w-7 text-purple-500" />
                    </div>
                );
            case "message":
                return (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 border-2 border-sky-200 border-b-4 shadow-sm group-active:translate-y-1 transition-transform">
                        <MessageCircle className="h-7 w-7 text-sky-500 fill-sky-200" />
                    </div>
                );
            default:
                return (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border-2 border-slate-200 border-b-4 shadow-sm group-active:translate-y-1 transition-transform">
                        <Bell className="h-7 w-7 text-slate-500" />
                    </div>
                );
        }
    };

    const handleClick = async (id: number, read: boolean) => {
        if (!read) {
            try { playSuccess(); } catch { /* sound may not exist */ }
            await onMarkNotificationAsRead(id);
        }
    };

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center font-sans">
                {/* Sleeping mascot Lottie */}
                <LottieBlock className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-6 opacity-80" />
                <h2 className="text-2xl font-black text-stone-700 tracking-tight mb-2">Sem notificações novas</h2>
                <p className="text-stone-400 font-bold text-lg">Tudo calmo por aqui.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {notifications.map((n, index) => {
                const Wrapper = n.link ? Link : ("div" as any);
                const props = n.link ? { href: n.link } : {};

                return (
                    <Wrapper
                        key={n.id}
                        {...props}
                        onClick={() => handleClick(n.id, n.read)}
                        className={cn(
                            "w-full relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                            "animate-in slide-in-from-right fade-in duration-300",
                            n.read 
                                ? "bg-white border-stone-200 border-b-4 hover:bg-stone-50 active:translate-y-1 active:border-b-0 active:mb-[4px]" 
                                : "bg-sky-50 border-sky-200 border-b-4 hover:bg-sky-100 active:translate-y-1 active:border-b-0 active:mb-[4px]",
                            n.link && "cursor-pointer"
                        )}
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
                    >
                        {/* Unread Indicator Pulse Dot */}
                        {!n.read && (
                            <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-sky-500 animate-pulse shadow-sm" />
                        )}

                        {getIconBlock(n.type)}
                        
                        <div className="flex flex-col pr-8">
                            <p className={cn("text-lg sm:text-xl leading-tight tracking-tight", !n.read ? "font-black text-stone-800" : "font-bold text-stone-600")}>
                                {n.message}
                            </p>
                            <p className="text-sm rounded-lg font-bold text-stone-400 uppercase tracking-widest mt-2">
                                {mounted && n.createdAt ? new Date(n.createdAt).toLocaleDateString("pt-PT", {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : (mounted ? "" : "")}
                            </p>
                        </div>
                    </Wrapper>
                );
            })}
        </div>
    );
};
