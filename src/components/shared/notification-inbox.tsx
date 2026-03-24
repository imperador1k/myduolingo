"use client";

import { useState, useTransition } from "react";
import { NotificationList } from "@/components/shared/notification-list";
import { markNotificationsAsRead, deleteAllNotifications } from "@/actions/user-actions";
import { NotificationSettingsModal } from "@/components/modals/notification-settings-modal";
import { Button } from "@/components/ui/button";
import { CheckCheck, Trash, Settings, Trophy, UserPlus } from "lucide-react";
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
        <div className="flex flex-col gap-6 w-full">
            <header className="flex items-center justify-between bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <TedyLottie className="h-16 w-16" />
                    <h1 className="text-3xl font-black text-stone-700 tracking-tight">Notificações</h1>
                </div>
                <NotificationSettingsModal initialEnabled={initialEnabled}>
                    <Button variant="ghost" size="icon" className="text-stone-400 hover:text-stone-600 bg-stone-50 hover:bg-stone-100 rounded-xl h-12 w-12 transition-all active:scale-95 border-2 border-transparent hover:border-stone-200 hover:border-b-4">
                        <Settings className="h-6 w-6" />
                    </Button>
                </NotificationSettingsModal>
            </header>

            {/* Top Bar Navigation / Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                
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
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!hasUnread || isPending}
                        onClick={handleMarkAllRead}
                        className={cn(
                            "text-sky-500 font-bold hover:text-sky-600 hover:bg-sky-50 transition-colors rounded-xl px-4 py-2 border-2 border-transparent hover:border-sky-200",
                            (!hasUnread || isPending) && "opacity-50 cursor-not-allowed"
                        )}
                        title="Marcar lidas"
                    >
                        <CheckCheck className="h-5 w-5 mr-0 sm:mr-2" />
                        <span className="hidden sm:inline">Lidas</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!hasAny || isPending}
                        onClick={handleClearAll}
                        className={cn(
                            "text-rose-500 font-bold hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-xl px-4 py-2 border-2 border-transparent hover:border-rose-200",
                            (!hasAny || isPending) && "opacity-50 cursor-not-allowed"
                        )}
                        title="Limpar separador"
                    >
                        <Trash className="h-5 w-5 mr-0 sm:mr-2" />
                        <span className="hidden sm:inline">Limpar</span>
                    </Button>
                </div>
            </div>

            {/* Main Bento Box Container for the List */}
            <section className={cn(
                "bg-white rounded-[3rem] border-2 border-stone-200 border-b-8 shadow-sm p-4 sm:p-6 transition-opacity duration-200", 
                isPending && "opacity-50 pointer-events-none"
            )}>
                <NotificationList notifications={filteredNotifications} />
            </section>

            {/* Footer Banner */}
            <footer className="bg-stone-50 rounded-[2rem] border-2 border-stone-200 border-b-4 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mt-2">
                <div className="bg-amber-100 rounded-2xl p-3 border-2 border-amber-200 border-b-4 shrink-0 shadow-sm">
                    <CheckCheck className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                    <h3 className="text-lg md:text-xl font-black text-stone-700 tracking-tight">Fica a par de tudo!</h3>
                    <p className="text-stone-500 font-bold text-sm mt-1">As tuas notificações mantêm-te em foco na ofensiva e nas tuas amizades.</p>
                </div>
            </footer>

            {/* Extra Contextual Bento Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* Ranking Semanal */}
                <div className="bg-white rounded-[2.5rem] border-2 border-stone-200 border-b-8 p-6 flex items-center gap-6 shadow-sm group hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200 border-b-4 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <Trophy className="h-8 w-8 text-purple-500 fill-purple-100" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-stone-700 tracking-tight">Ranking Semanal</h3>
                        <p className="text-stone-400 font-bold text-sm mt-1 leading-snug">Vê como estás a sair na Liga Diamante hoje.</p>
                    </div>
                </div>

                {/* Convidar Amigos */}
                <div className="bg-white rounded-[2.5rem] border-2 border-stone-200 border-b-8 p-6 flex items-center gap-6 shadow-sm group hover:-translate-y-1 transition-all cursor-pointer">
                    <div className="bg-sky-50 rounded-2xl p-4 border-2 border-sky-200 border-b-4 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        <UserPlus className="h-8 w-8 text-sky-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-stone-700 tracking-tight">Convidar Amigos</h3>
                        <p className="text-stone-400 font-bold text-sm mt-1 leading-snug">Aprender com amigos dá 20% mais XP!</p>
                    </div>
                </div>
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
                "px-5 py-3 text-sm font-black tracking-widest uppercase rounded-2xl whitespace-nowrap transition-all border-2",
                active 
                    ? "bg-sky-50 text-sky-500 border-sky-200 border-b-4 translate-y-0" 
                    : "bg-white text-stone-400 border-transparent border-b-transparent hover:bg-stone-50 hover:text-stone-500 translate-y-[2px]"
            )}
        >
            {label}
        </button>
    );
};
