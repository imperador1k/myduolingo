"use client";

import { useTranslations } from "next-intl";

import { useState, useEffect } from "react";
import { HelpCircle, Bot, History } from "lucide-react";
import Link from "next/link";
import { PracticeInfoModal } from "@/components/modals/practice-info-modal";
import { usePreferencesStore } from "@/store/use-preferences-store";

export const PracticeHeader = () => {
  const t = useTranslations("practice");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const hasSeenModal = usePreferencesStore(
    (state) => state.hasSeenPracticeModal,
  );
  const setPreference = usePreferencesStore((state) => state.setPreference);

  useEffect(() => {
    setIsMounted(true);
    // Auto-open modal on first visit
    if (!hasSeenModal) {
      setIsModalOpen(true);
      setPreference("hasSeenPracticeModal", true);
    }
  }, [hasSeenModal, setPreference]);

  return (
    <div className="relative mb-8">
      {isMounted && (
        <PracticeInfoModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      )}

      {/* Hero Header with 3D Duolingo Style */}
      <div className="relative bg-gradient-to-br from-emerald-400 via-green-500 to-lime-500 rounded-[2.5rem] p-8 md:p-12 shadow-xl overflow-hidden border-4 border-green-400 border-b-8 flex flex-col items-center text-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10 mix-blend-overlay"></div>

        {/* Help Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-6 right-6 h-12 w-12 bg-white/20 hover:bg-white/30 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 z-20 border-2 border-white/20 backdrop-blur-sm shadow-sm"
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        {/* History Button (moved to top left) */}
        <Link
          href="/practice/history"
          className="absolute top-6 left-6 hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 z-20 border-2 border-white/20 backdrop-blur-sm shadow-sm"
        >
          <History className="w-4 h-4" />
          {t("history_button")}
        </Link>

        {/* Mobile History Button (icon only) */}
        <Link
          href="/practice/history"
          className="absolute top-6 left-6 sm:hidden flex items-center justify-center h-12 w-12 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all active:scale-95 z-20 border-2 border-white/20 backdrop-blur-sm shadow-sm"
        >
          <History className="w-6 h-6" />
        </Link>

        <div className="w-20 h-20 bg-white/20 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center mb-6 rotate-[-5deg] border-4 border-white/30 shadow-lg relative z-10 animate-bounce">
          <Bot className="w-10 h-10 fill-white/20" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] relative z-10">
          {t("title")}
        </h1>
        <p className="text-white/90 font-bold text-lg md:text-xl mt-4 max-w-lg relative z-10 drop-shadow-sm">
          {t("description")}
        </p>
      </div>
    </div>
  );
};
