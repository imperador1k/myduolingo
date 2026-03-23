"use client";

import { useState, useTransition } from "react";
import { NotificationList } from "@/components/shared/notification-list";
import { markNotificationsAsRead, deleteAllNotifications } from "@/actions/user-actions";
import { NotificationSettingsModal } from "@/components/modals/notification-settings-modal";
import { Button } from "@/components/ui/button";
import { CheckCheck, Trash, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

export const NotificationInbox = ({ initialNotifications, initialEnabled }: Props) => {
    const [activeTab, setActiveTab] = useState<TabStatus>("all");
    const [isPending, startTransition] = useTransition();

    // Filter notifications based on active tab
    const filteredNotifications = initialNotifications.filter((n) => {
        if (activeTab === "all") return true;
        if (activeTab === "messages") return n.type === "message";
        if (activeTab === "social") return n.type === "follow" || n.type === "streak";
        return true;
    });

    const hasUnread = filteredNotifications.some(n => !n.read);
    const hasAny = filteredNotifications.length > 0;

    const handleMarkAllRead = () => {
        if (!hasUnread) return;
        startTransition(() => {
            markNotificationsAsRead(activeTab === "all" ? undefined : activeTab)
                .then(() => toast.success("Notificações lidas!"))
                .catch(() => toast.error("Erro ao atualizar base de dados."));
        });
    };

    const handleClearAll = () => {
        if (!hasAny) return;
        startTransition(() => {
            deleteAllNotifications(activeTab === "all" ? undefined : activeTab)
                .then(() => toast.success("Notificações apagadas!"))
                .catch(() => toast.error("Erro ao apagar."));
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-700">A tua Inbox</h1>
                <NotificationSettingsModal initialEnabled={initialEnabled}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                        <Settings className="h-5 w-5" />
                    </Button>
                </NotificationSettingsModal>
            </div>

            {/* Top Bar Navigation / Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-2 rounded-2xl border-2 border-slate-200">
                
                {/* Tabs */}
                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                    <TabButton 
                        label="Tudo" 
                        active={activeTab === "all"} 
                        onClick={() => setActiveTab("all")} 
                    />
                    <TabButton 
                        label="Mensagens" 
                        active={activeTab === "messages"} 
                        onClick={() => setActiveTab("messages")} 
                    />
                    <TabButton 
                        label="Social" 
                        active={activeTab === "social"} 
                        onClick={() => setActiveTab("social")} 
                    />
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end px-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!hasUnread || isPending}
                        onClick={handleMarkAllRead}
                        className={cn(
                            "text-sky-500 hover:text-sky-600 hover:bg-sky-50 transition-colors",
                            (!hasUnread || isPending) && "opacity-50 cursor-not-allowed"
                        )}
                        title="Marcar lidas"
                    >
                        <CheckCheck className="h-4 w-4 mr-0 sm:mr-2" />
                        <span className="hidden sm:inline">Lidas</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!hasAny || isPending}
                        onClick={handleClearAll}
                        className={cn(
                            "text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors",
                            (!hasAny || isPending) && "opacity-50 cursor-not-allowed"
                        )}
                        title="Limpar separador"
                    >
                        <Trash className="h-4 w-4 mr-0 sm:mr-2" />
                        <span className="hidden sm:inline">Limpar</span>
                    </Button>
                </div>
            </div>

            {/* List Renderer */}
            <div className={cn("transition-opacity duration-200", isPending && "opacity-50 pointer-events-none")}>
                <NotificationList notifications={filteredNotifications} />
            </div>
        </div>
    );
};

// Internal Helper for aesthetic Tabs
const TabButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-2 text-sm font-bold tracking-wide rounded-xl whitespace-nowrap transition-all",
                active 
                    ? "bg-sky-100 text-sky-600 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            )}
        >
            {label}
        </button>
    );
};
