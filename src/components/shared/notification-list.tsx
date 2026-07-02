"use client";

import { useTranslations } from "next-intl";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Heart, UserPlus, MessageCircle, Bell } from "lucide-react";
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
  senderImage?: string | null;
};

type Props = {
  notifications: Notification[];
};

export const NotificationList = ({ notifications }: Props) => {
  const t = useTranslations("shared");
  const [mounted, setMounted] = useState(false);
  const [playSuccess] = useSound("/sounds/success.mp3", { volume: 0.3 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const getIconBlock = (type: string, senderImage?: string | null) => {
    if (senderImage) {
      return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-100 dark:bg-slate-800 overflow-hidden border border-stone-200 dark:border-slate-700">
          <img src={senderImage} alt="User Avatar" className="h-full w-full object-cover" />
        </div>
      );
    }

    switch (type) {
      case "streak":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
            <Heart className="h-6 w-6 text-orange-500" />
          </div>
        );
      case "follow":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
            <UserPlus className="h-6 w-6 text-purple-500" />
          </div>
        );
      case "message":
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/30">
            <MessageCircle className="h-6 w-6 text-sky-500" />
          </div>
        );
      default:
        return (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
            <Bell className="h-6 w-6 text-stone-500 dark:text-slate-400" />
          </div>
        );
    }
  };

  const handleClick = async (id: number, read: boolean) => {
    if (!read) {
      try {
        playSuccess();
      } catch {
        /* sound may not exist */
      }
      await onMarkNotificationAsRead(id);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center font-sans">
        <LottieBlock className="w-24 h-24 mx-auto mb-4 opacity-50 grayscale" />
        <h2 className="text-lg font-bold text-stone-800 dark:text-slate-200 tracking-tight">
          {t("empty_title")}
        </h2>
        <p className="text-stone-500 dark:text-slate-400 text-sm mt-1">
          {t("empty_message")}
        </p>
      </div>
    );
  }

  const formatRelativeTime = (date: Date) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' });
    const daysDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
      const hoursDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
      if (hoursDifference === 0) {
        const minsDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60));
        return rtf.format(minsDifference, 'minute');
      }
      return rtf.format(hoursDifference, 'hour');
    }
    return rtf.format(daysDifference, 'day');
  };

  return (
    <div className="flex flex-col">
      {notifications.map((n, index) => {
        const Wrapper = n.link ? Link : ("div" as any);
        const props = n.link ? { href: n.link } : {};

        return (
          <Wrapper
            key={n.id}
            {...props}
            onClick={() => handleClick(n.id, n.read)}
            className={cn(
              "w-full relative flex items-start gap-3 py-3 px-1 sm:px-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer",
              "animate-in fade-in duration-300",
            )}
            style={{
              animationDelay: `${index * 30}ms`,
              animationFillMode: "backwards",
            }}
          >
            {getIconBlock(n.type, n.senderImage)}

            <div className="flex flex-col flex-1 pt-1">
              <p
                className={cn(
                  "text-sm leading-snug",
                  !n.read
                    ? "font-semibold text-stone-900 dark:text-slate-100"
                    : "text-stone-700 dark:text-slate-300"
                )}
              >
                {n.message}
                <span className="text-stone-400 dark:text-slate-500 font-normal ml-2 text-[13px]">
                  {mounted && n.createdAt ? formatRelativeTime(new Date(n.createdAt)) : ""}
                </span>
              </p>
            </div>
            
            {/* Action / Indicator Area */}
            <div className="flex flex-col items-center justify-center h-full px-2 pt-3">
               {!n.read && (
                 <div className="h-2 w-2 rounded-full bg-blue-500" />
               )}
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
};
