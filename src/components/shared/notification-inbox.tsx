"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { NotificationList } from "@/components/shared/notification-list";
import {
  markNotificationsAsRead,
  deleteAllNotifications,
} from "@/actions/user-actions";
import { NotificationSettingsModal } from "@/components/modals/notification-settings-modal";
import {
  CheckCheck,
  Trash,
  Settings,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TedyLottie } from "@/components/ui/lottie-animation";

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
  initialNotifications: Notification[];
  initialEnabled: boolean;
};

type TabStatus = "all" | "messages" | "social";

export const NotificationInbox = ({
  initialNotifications,
  initialEnabled,
}: Props) => {
  const t = useTranslations("shared");
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [isPending, startTransition] = useTransition();

  const filteredNotifications = initialNotifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "messages") return n.type === "message";
    if (activeTab === "social")
      return n.type === "follow" || n.type === "streak";
    return true;
  });

  const hasUnread = filteredNotifications.some((n) => !n.read);
  const hasAny = filteredNotifications.length > 0;

  const handleMarkAllRead = () => {
    if (!hasUnread) return;
    startTransition(() => {
      markNotificationsAsRead(activeTab === "all" ? undefined : activeTab)
        .then(() => toast.success(t("notifications_marked_read")))
        .catch(() => toast.error(t("error_updating_database")));
    });
  };

  const handleClearAll = () => {
    if (!hasAny) return;
    startTransition(() => {
      deleteAllNotifications(activeTab === "all" ? undefined : activeTab)
        .then(() => toast.success(t("notifications_deleted")))
        .catch(() => toast.error(t("error_clearing")));
    });
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 min-h-screen sm:min-h-0 sm:border sm:border-stone-200 sm:dark:border-slate-800 sm:rounded-2xl overflow-hidden shadow-sm">
      {/* Sleek Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-stone-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-slate-100 tracking-tight">
            {t("notifications_title")}
          </h1>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {hasUnread && (
              <button
                disabled={isPending}
                onClick={handleMarkAllRead}
                title={t("mark_read")}
                className="p-2 text-stone-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCheck className="h-5 w-5" />
                )}
              </button>
            )}

            {hasAny && (
              <button
                disabled={isPending}
                onClick={handleClearAll}
                title={t("clear_tab")}
                className="p-2 text-stone-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
              >
                <Trash className="h-5 w-5" />
              </button>
            )}

            <NotificationSettingsModal initialEnabled={initialEnabled}>
              <button
                title={t("settings")}
                className="p-2 text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </NotificationSettingsModal>
          </div>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex px-4 w-full">
          <Tab
            label={t("all_tab")}
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          />
          <Tab
            label={t("messages_tab")}
            active={activeTab === "messages"}
            onClick={() => setActiveTab("messages")}
          />
          <Tab
            label={t("social_tab")}
            active={activeTab === "social"}
            onClick={() => setActiveTab("social")}
          />
        </div>
      </header>

      {/* Notifications List Content */}
      <section
        className={cn(
          "flex-1 transition-opacity duration-200 min-h-[50vh]",
          isPending && "opacity-50 pointer-events-none"
        )}
      >
        {hasAny ? (
          <NotificationList notifications={filteredNotifications} />
        ) : (
          <EmptyState activeTab={activeTab} />
        )}
      </section>
    </div>
  );
};

const Tab = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-3 text-sm font-semibold tracking-wide transition-colors relative",
        active
          ? "text-stone-900 dark:text-slate-100"
          : "text-stone-500 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300"
      )}
    >
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-stone-900 dark:bg-slate-100" />
      )}
    </button>
  );
};

const EmptyState = ({ activeTab }: { activeTab: TabStatus }) => {
  const t = useTranslations("shared");
  const messages: Record<TabStatus, { title: string; body: string }> = {
    all: { title: t("empty_all_title"), body: t("empty_all_body") },
    messages: {
      title: t("empty_messages_title"),
      body: t("empty_messages_body"),
    },
    social: { title: t("empty_social_title"), body: t("empty_social_body") },
  };

  const { title, body } = messages[activeTab];

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 px-4 text-center h-full">
      <div className="relative">
        <div className="w-24 h-24 md:w-32 md:h-32 opacity-70">
          <TedyLottie className="w-full h-full grayscale-[50%]" />
        </div>
      </div>
      <div className="flex flex-col gap-2 max-w-sm">
        <h2 className="text-xl font-bold text-stone-800 dark:text-slate-200">
          {title}
        </h2>
        <p className="text-stone-500 dark:text-slate-400 text-sm md:text-base">
          {body}
        </p>
      </div>
    </div>
  );
};
