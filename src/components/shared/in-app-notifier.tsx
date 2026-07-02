"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { usePreferencesStore } from "@/store/use-preferences-store";
import { onGetLatestUnreadNotification, onMarkNotificationAsRead } from "@/actions/user-actions";
import { Bell, X, MessageSquare, UserPlus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = {
  id: number;
  type: string;
  message: string;
  link: string | null;
  senderImage?: string;
};

export const InAppNotifier = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { inAppNotificationsEnabled } = usePreferencesStore();
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  // Do not show on lessons or survival practice
  const isExcludedRoute = 
    pathname?.startsWith("/lesson") || 
    pathname?.startsWith("/practice/survival");

  useEffect(() => {
    if (!inAppNotificationsEnabled || isExcludedRoute) {
      setNotification(null);
      return;
    }

    const fetchLatest = async () => {
      try {
        const latest = await onGetLatestUnreadNotification();
        if (latest && !dismissedIds.has(latest.id)) {
          setNotification(latest as NotificationType);
        } else {
          setNotification(null);
        }
      } catch (error) {
        console.error("Failed to fetch latest notification:", error);
      }
    };

    // Initial fetch
    fetchLatest();

    // Poll every 15 seconds
    const interval = setInterval(fetchLatest, 15000);
    return () => clearInterval(interval);
  }, [inAppNotificationsEnabled, isExcludedRoute, dismissedIds]);

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent clicking the notification body
    if (notification) {
      setDismissedIds((prev) => new Set(prev).add(notification.id));
      const currentId = notification.id;
      setNotification(null);
      // Mark as read in DB so it doesn't pop up again on page refresh
      await onMarkNotificationAsRead(currentId).catch(console.error);
    }
  };

  const handleClick = async () => {
    if (!notification) return;
    
    // Optimistic hide
    setDismissedIds((prev) => new Set(prev).add(notification.id));
    setNotification(null);

    // Mark as read in DB
    await onMarkNotificationAsRead(notification.id);

    // Redirect
    if (notification.link) {
      router.push(notification.link);
    } else {
      router.push("/notifications");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-emerald-500" />;
      case "streak":
        return <Zap className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
        >
          <div 
            onClick={handleClick}
            className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-4 rounded-3xl shadow-lg border-2 border-slate-100 border-b-4 min-w-[320px] cursor-pointer hover:-translate-y-1 transition-transform group"
          >
            {notification.senderImage ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={notification.senderImage} alt="Avatar" className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="bg-stone-100 dark:bg-slate-800 p-3 rounded-2xl shrink-0">
                {getIcon(notification.type)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-700 dark:text-slate-200 truncate">
                {notification.type === "message" ? "Nova Mensagem!" : "Notificação!"}
              </p>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400 truncate">
                {notification.message}
              </p>
            </div>

            <button 
              onClick={handleDismiss}
              className="p-1.5 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-slate-200 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
