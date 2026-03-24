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
        <div className="flex items-center justify-between p-5 bg-white border-2 border-stone-200 border-b-4 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all shadow-sm group-hover:scale-105",
                    enabled 
                        ? "bg-sky-50 text-sky-500 border-sky-100 border-b-4" 
                        : "bg-stone-50 text-stone-300 border-stone-100 border-b-4"
                )}>
                    {enabled ? <Bell className="h-7 w-7" /> : <BellOff className="h-7 w-7" />}
                </div>
                <div>
                    <h3 className="font-black text-stone-700 text-lg uppercase tracking-tight leading-tight">Notificações Push</h3>
                    <p className="text-sm text-stone-400 font-bold mt-1">Recebe alertas sobre mensagens e seguidores.</p>
                </div>
            </div>

            {/* Dojo Custom Switch Pill */}
            <button 
                onClick={toggle}
                disabled={isPending}
                className={cn(
                    "relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-300 focus:outline-none disabled:opacity-50 shadow-inner",
                    enabled ? "bg-[#58cc02] border-[#46a302]" : "bg-stone-200 border-stone-300"
                )}
                role="switch"
                aria-checked={enabled}
            >
                <span className="sr-only">Ativar notificações</span>
                <span 
                    className={cn(
                        "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-xl ring-0 transition duration-300 ease-in-out border-b-2 border-stone-100",
                        enabled ? "translate-x-7" : "translate-x-1"
                    )}
                />
            </button>
        </div>
    );
};
