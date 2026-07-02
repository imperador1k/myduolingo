"use client";

import { usePreferencesStore } from "@/store/use-preferences-store";
import { cn } from "@/lib/utils";
import { MessageSquare, MessageSquareOff } from "lucide-react";

export const InAppNotificationToggle = () => {
  const { inAppNotificationsEnabled, setPreference } = usePreferencesStore();

  const toggle = () => {
    setPreference("inAppNotificationsEnabled", !inAppNotificationsEnabled);
  };

  return (
    <div className="flex justify-between items-center p-2 group">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all shadow-sm group-hover:scale-105 shrink-0",
            inAppNotificationsEnabled
              ? "bg-stone-50 dark:bg-slate-950 text-[#1cb0f6] border-stone-200 dark:border-slate-800 border-b-4"
              : "bg-stone-50 dark:bg-slate-950 text-stone-400 dark:text-slate-500 border-stone-200 dark:border-slate-800 border-b-4",
          )}
        >
          {inAppNotificationsEnabled ? (
            <MessageSquare className="h-7 w-7" />
          ) : (
            <MessageSquareOff className="h-7 w-7" />
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="font-black text-stone-700 dark:text-slate-200 text-lg uppercase tracking-tight leading-tight">
            Notificações na App
          </h3>
          <p className="text-sm text-stone-400 dark:text-slate-500 font-bold mt-1">
            Pop-ups interativos
          </p>
        </div>
      </div>

      <button
        onClick={toggle}
        className={cn(
          "relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus:outline-none",
          inAppNotificationsEnabled
            ? "bg-[#1cb0f6] border-2 border-[#1899d6] border-b-4 translate-y-[-2px] active:translate-y-0 active:border-b-2"
            : "bg-stone-200 dark:bg-slate-700 border-2 border-stone-300 dark:border-slate-700 border-b-4 translate-y-[-2px] active:translate-y-0 active:border-b-2",
        )}
        role="switch"
        aria-checked={inAppNotificationsEnabled}
      >
        <span className="sr-only">Toggle in-app notifications</span>
        <span
          className={cn(
            "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-300 ease-in-out border-b-2 border-stone-100",
            inAppNotificationsEnabled ? "translate-x-7" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
};
