"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { syncNativeLanguage } from "@/actions/user-progress";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { DuoAnimationLottie } from "@/components/ui/lottie-animation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const LANGUAGES = [
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
];

export const LanguageToggle = () => {
  const t = useTranslations("settings_components");
  const locale = useLocale();
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState(locale);
  const [isPending, startTransition] = useTransition();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);

  const handleLanguageClick = (code: string) => {
    if (code === currentLang) return;
    setPendingLanguage(code);
    setConfirmModalOpen(true);
  };

  const handleConfirmLanguageChange = () => {
    if (!pendingLanguage) return;
    const code = pendingLanguage;
    setConfirmModalOpen(false);
    setCurrentLang(code);

    startTransition(() => {
      syncNativeLanguage(code)
        .then((res) => {
          if (res.success) {
            toast.success(
              t("language_updated", {
                defaultValue: "Language updated successfully!",
              }),
            );
            router.refresh();
          } else {
            toast.error(
              t("language_error", {
                defaultValue: "Failed to update language",
              }),
            );
            setCurrentLang(locale);
          }
        })
        .catch(() => {
          toast.error(
            t("language_error", { defaultValue: "Failed to update language" }),
          );
          setCurrentLang(locale);
        });
    });
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-4 border-2 border-stone-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 mt-6">
        <div>
          <h3 className="font-bold text-stone-700 dark:text-slate-200 text-lg">
            {t("app_language_title")}
          </h3>
          <p className="text-stone-500 dark:text-slate-400 text-sm">
            {t("app_language_description")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <Button
                key={lang.code}
                onClick={() => handleLanguageClick(lang.code)}
                variant={isActive ? "secondary" : "ghost"}
                className={`h-auto py-3 flex flex-col gap-1 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#1CB0F6]/10 text-[#1CB0F6] hover:bg-[#1CB0F6]/20 border-2 border-[#1CB0F6]/30 border-b-4 dark:bg-sky-900/40 dark:text-sky-400 dark:border-sky-700"
                    : "border-2 border-stone-200 dark:border-slate-800 border-b-4 dark:text-slate-400 dark:hover:bg-slate-800 hover:bg-stone-100"
                }`}
              >
                <span className="text-2xl drop-shadow-sm">{lang.flag}</span>
                <span className="text-xs font-bold tracking-wide">
                  {lang.name}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-sm rounded-3xl p-6 gap-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center mb-2">
              {t("confirm_language_change")}
            </DialogTitle>
            <DialogDescription className="text-center text-stone-500 font-medium">
              {pendingLanguage
                ? LANGUAGES.find((l) => l.code === pendingLanguage)?.name
                : ""}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-col gap-3 mt-2">
            <Button
              onClick={handleConfirmLanguageChange}
              disabled={isPending}
              className="w-full h-12 text-base font-bold uppercase tracking-wider rounded-2xl bg-[#1CB0F6] hover:bg-[#1899D6] border-b-4 border-[#1899D6] active:border-b-0 active:translate-y-1 text-white transition-all"
            >
              {t("confirm")}
            </Button>
            <Button
              onClick={() => setConfirmModalOpen(false)}
              variant="ghost"
              className="w-full h-12 text-base font-bold uppercase tracking-wider rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              {t("cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isPending &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-900 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-40 h-40">
              <DuoAnimationLottie className="w-full h-full" />
            </div>
            <h2 className="mt-8 text-2xl font-black text-stone-700 dark:text-slate-200 tracking-tight animate-pulse">
              {t("changing_language", { defaultValue: "Changing language..." })}
            </h2>
          </div>,
          document.body
        )}
    </>
  );
};
