"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from "lucide-react";

export const SoundToggle = () => {
  const t = useTranslations("settings_components");
  const { isMuted, toggleMute } = useUISounds();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const enabled = !isMuted; // "enabled" means "Sound is ON"

  const handleToggle = () => {
    toggleMute();
  };

  return (
    <div className="flex justify-between items-center p-2 group">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all shadow-sm group-hover:scale-105 shrink-0",
            enabled
              ? "bg-stone-50 dark:bg-slate-950 text-[#1cb0f6] border-stone-200 dark:border-slate-800 border-b-4"
              : "bg-stone-50 dark:bg-slate-950 text-stone-400 dark:text-slate-500 dark:text-slate-400 border-stone-200 dark:border-slate-800 border-b-4",
          )}
        >
          {enabled ? (
            <Volume2 className="h-7 w-7" />
          ) : (
            <VolumeX className="h-7 w-7" />
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="font-black text-stone-700 dark:text-slate-200 text-lg uppercase tracking-tight leading-tight">
            {t("sound_title", { defaultValue: "Sons e Efeitos" })}
          </h3>
          <p className="text-sm text-stone-400 dark:text-slate-500 dark:text-slate-400 font-bold mt-1 max-w-[200px] leading-tight">
            {t("sound_description", {
              defaultValue: "Ativa ou desativa os efeitos sonoros da app.",
            })}
          </p>
        </div>
      </div>

      {/* Custom Switch Pill */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus:outline-none",
          enabled
            ? "bg-[#1cb0f6] border-2 border-[#1899d6] border-b-4 translate-y-[-2px] active:translate-y-0 active:border-b-2"
            : "bg-stone-200 dark:bg-slate-700 border-2 border-stone-300 dark:border-slate-700 border-b-4 translate-y-[-2px] active:translate-y-0 active:border-b-2",
        )}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">Toggle Sound</span>
        <span
          className={cn(
            "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-300 ease-in-out border-b-2 border-stone-100",
            enabled ? "translate-x-7" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
};
