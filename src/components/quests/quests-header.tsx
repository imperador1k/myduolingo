"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Crown, Target } from "lucide-react";
import { QuestsInfoModal } from "@/components/modals/quests-info-modal";

export const QuestsHeader = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Auto-open modal on first visit
    const hasSeenModal = localStorage.getItem("hasSeenQuestsModal");
    if (!hasSeenModal) {
      setIsModalOpen(true);
      localStorage.setItem("hasSeenQuestsModal", "true");
    }
  }, []);

  return (
    <div className="relative mb-12">
      {isMounted && (
        <QuestsInfoModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      )}

      {/* Hero Header with 3D Duolingo Style */}
      <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-[2.5rem] p-8 md:p-12 shadow-xl overflow-hidden border-4 border-amber-300 border-b-8 flex flex-col items-center text-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10 mix-blend-overlay"></div>

        {/* Floating Icons Background */}
        <Target className="absolute top-8 left-12 w-16 h-16 text-white/20 -rotate-12 animate-pulse" />
        <Crown className="absolute bottom-8 right-12 w-20 h-20 text-white/20 rotate-12 animate-pulse delay-300" />

        {/* Help Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-6 right-6 h-12 w-12 bg-white/20 hover:bg-white/30 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 z-20 border-2 border-white/20 backdrop-blur-sm shadow-sm"
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        <div className="w-20 h-20 bg-white/20 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center mb-6 rotate-[-5deg] border-4 border-white/30 shadow-lg relative z-10 animate-bounce">
          <Crown className="w-10 h-10 fill-white/50" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] relative z-10">
          Missões e Troféus
        </h1>
        <p className="text-white/90 font-bold text-lg md:text-xl mt-4 max-w-lg relative z-10 drop-shadow-sm">
          Completa desafios diários para ganhar baús e imortaliza as tuas
          conquistas na Sala de Troféus.
        </p>
      </div>
    </div>
  );
};
