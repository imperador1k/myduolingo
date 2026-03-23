"use client";

import { useTransition, useState } from "react";
import { updateNotificationPreference } from "@/actions/user-progress";
import { useCustomToast } from "@/components/ui/custom-toast";
import { toast as sonnerToast } from "sonner"; // keep sonner for errors
import { cn } from "@/lib/utils";
import { Bell, BellOff } from "lucide-react";

type Props = {
    initialEnabled: boolean;
};

export const NotificationToggle = ({ initialEnabled }: Props) => {
    const { toast: customToast } = useCustomToast();
    const [isPending, startTransition] = useTransition();
    const [enabled, setEnabled] = useState(initialEnabled);

    const toggle = () => {
        if (isPending) return;
        
        const newValue = !enabled;
        setEnabled(newValue); // Optimistic UI

        startTransition(() => {
            updateNotificationPreference(newValue)
                .then(() => {
                    customToast(newValue ? "As tuas preferências foram guardadas com sucesso!" : "As notificações foram desativadas.");
                })
                .catch(() => {
                    sonnerToast.error("Erro ao atualizar definições.");
                    setEnabled(!newValue); // Revert on error
                });
        });
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
                    enabled ? "bg-sky-100 text-sky-500" : "bg-slate-100 text-slate-400"
                )}>
                    {enabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
                </div>
                <div>
                    <h3 className="font-bold text-slate-700 text-lg">Notificações Push</h3>
                    <p className="text-sm text-slate-500">Recebe alertas sobre mensagens e seguidores.</p>
                </div>
            </div>

            {/* Tailwind Custom Switch Pill */}
            <button 
                onClick={toggle}
                disabled={isPending}
                className={cn(
                    "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:opacity-50",
                    enabled ? "bg-sky-500" : "bg-slate-300"
                )}
                role="switch"
                aria-checked={enabled}
            >
                <span className="sr-only">Ativar notificações</span>
                <span 
                    className={cn(
                        "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                        enabled ? "translate-x-6" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
};
