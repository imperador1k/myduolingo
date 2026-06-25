"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CopyMinus,
  Zap,
  Sparkles,
  HelpCircle,
  Gamepad2,
  Dices,
} from "lucide-react";
import { ArcadeInfoModal } from "@/components/modals/arcade-info-modal";

export default function ArcadeHub() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Auto-open modal on first visit
    const hasSeenModal = localStorage.getItem("hasSeenArcadeModal");
    if (!hasSeenModal) {
      setIsModalOpen(true);
      localStorage.setItem("hasSeenArcadeModal", "true");
    }
  }, []);

  // Avoid hydration mismatch by not rendering modal until mounted
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12 pb-32">
      {isMounted && (
        <ArcadeInfoModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      )}

      {/* Hero Header with 3D Duolingo Style */}
      <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-[2.5rem] p-8 md:p-12 shadow-xl overflow-hidden border-4 border-indigo-400 border-b-8 flex flex-col items-center text-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10 mix-blend-overlay"></div>

        {/* Help Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-6 right-6 h-12 w-12 bg-white/20 hover:bg-white/30 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 z-10 border-2 border-white/20 backdrop-blur-sm"
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        <div className="w-20 h-20 bg-white/20 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center mb-6 rotate-[-5deg] border-4 border-white/30 shadow-lg relative z-10 animate-bounce">
          <Gamepad2 className="w-10 h-10" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] relative z-10">
          Arcade{" "}
          <span className="inline-block hover:scale-110 hover:rotate-12 transition-transform cursor-pointer">
            🕹️
          </span>
        </h1>
        <p className="text-white/90 font-bold text-lg md:text-xl mt-4 max-w-lg relative z-10 drop-shadow-sm">
          Treina os teus reflexos e a memória muscular em minijogos imersivos e
          divertidos.
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vocabulary Sprint Card */}
        <div className="bg-gradient-to-b from-purple-50 to-purple-100 border-4 border-purple-200 border-b-[12px] rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-xl group relative overflow-hidden">
          {/* Decorative floating shapes */}
          <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>

          {/* Badge */}
          <div className="absolute top-6 left-6 bg-purple-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10 rotate-[-10deg]">
            Popular
          </div>

          <div className="h-28 w-28 bg-white dark:bg-slate-900 rounded-[2rem] border-4 border-purple-200 border-b-[6px] flex items-center justify-center text-purple-500 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-md relative z-10">
            <Zap className="h-12 w-12 fill-purple-500" />
          </div>

          <h2 className="text-3xl font-black text-purple-800 mb-3 uppercase tracking-wide relative z-10 drop-shadow-sm">
            Sprint
          </h2>

          <p className="text-purple-600 font-bold mb-10 relative z-10 leading-relaxed px-4">
            Treina a tua memória muscular. Traduz rápido e ganha pontos de bónus
            incríveis!
          </p>

          <Link href="/arcade/sprint" className="w-full mt-auto relative z-10">
            <button className="w-full py-5 bg-purple-500 hover:bg-purple-600 text-white font-black text-lg uppercase tracking-widest rounded-[1.5rem] border-b-8 border-purple-700 active:border-b-0 active:translate-y-[8px] transition-all shadow-sm flex items-center justify-center gap-2">
              JOGAR AGORA
            </button>
          </Link>
        </div>

        {/* Swipe Card */}
        <div className="bg-gradient-to-b from-rose-50 to-rose-100 border-4 border-rose-200 border-b-[12px] rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-xl group relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>

          <div className="h-28 w-28 bg-white dark:bg-slate-900 rounded-[2rem] border-4 border-rose-200 border-b-[6px] flex items-center justify-center text-rose-500 mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform shadow-md relative z-10">
            <CopyMinus className="h-12 w-12 text-rose-500" strokeWidth={3} />
          </div>

          <h2 className="text-3xl font-black text-rose-800 mb-3 uppercase tracking-wide relative z-10 drop-shadow-sm">
            O Deslize
          </h2>

          <p className="text-rose-600 font-bold mb-10 relative z-10 leading-relaxed px-4">
            Verdade ou Mentira? Arrasta cartas velozmente à la Tinder para
            aprender.
          </p>

          <Link href="/arcade/swipe" className="w-full mt-auto relative z-10">
            <button className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white font-black text-lg uppercase tracking-widest rounded-[1.5rem] border-b-8 border-rose-700 active:border-b-0 active:translate-y-[8px] transition-all shadow-sm flex items-center justify-center gap-2">
              JOGAR AGORA
            </button>
          </Link>
        </div>

        {/* Meteoros Card */}
        <div className="bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-200 border-b-[12px] rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-xl group relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>

          {/* Badge */}
          <div className="absolute top-6 right-6 bg-amber-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10 rotate-[10deg]">
            Hardcore
          </div>

          <div className="h-28 w-28 bg-white dark:bg-slate-900 rounded-[2rem] border-4 border-amber-200 border-b-[6px] flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform shadow-md relative z-10">
            <span className="absolute inset-0 bg-amber-400 opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-[2rem]" />
            <Sparkles
              className="h-12 w-12 text-amber-500 relative z-10"
              strokeWidth={3}
            />
          </div>

          <h2 className="text-3xl font-black text-amber-800 mb-3 uppercase tracking-wide relative z-10 drop-shadow-sm">
            Meteoros
          </h2>

          <p className="text-amber-600 font-bold mb-10 relative z-10 leading-relaxed px-4 max-w-xl">
            Física realista! Destrói as palavras enquanto elas caem. Testa os
            teus reflexos ao limite e não as deixes bater no chão.
          </p>

          <Link
            href="/arcade/meteoros"
            className="w-full mt-auto relative z-10"
          >
            <button className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white font-black text-lg uppercase tracking-widest rounded-[1.5rem] border-b-8 border-amber-700 active:border-b-0 active:translate-y-[8px] transition-all shadow-sm flex items-center justify-center gap-2 relative overflow-hidden">
              <span className="absolute inset-0 bg-white/20 w-12 h-full skew-x-12 -ml-20 group-hover:animate-[shimmer_1.5s_infinite]" />
              JOGAR AGORA
            </button>
          </Link>
        </div>

        {/* Casino Card (PRO) */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-4 border-slate-700 border-b-[12px] rounded-[2.5rem] p-8 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-xl group relative overflow-hidden">
          {/* Pacman/Neon aesthetics */}
          <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-cyan-500 rounded-full mix-blend-screen filter blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 bg-pink-500 rounded-full mix-blend-screen filter blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity"></div>

          {/* PRO Badge */}
          <div className="absolute top-6 left-6 bg-yellow-500 text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-10 rotate-[-10deg] border-2 border-yellow-300">
            PRO
          </div>

          <div className="h-28 w-28 bg-slate-950 rounded-[2rem] border-4 border-cyan-500 border-b-[6px] flex items-center justify-center text-cyan-400 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.5)] relative z-10">
            <Dices className="h-12 w-12 text-cyan-400" strokeWidth={2.5} />
          </div>

          <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-wide relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Casino 8-Bit
          </h2>

          <p className="text-slate-300 font-bold mb-10 relative z-10 leading-relaxed px-4">
            Aposta no teu conhecimento! Double or Nothing, Word Sniper e muita
            adrenalina.
          </p>

          <Link href="/arcade/casino" className="w-full mt-auto relative z-10">
            <button className="w-full py-5 bg-pink-500 hover:bg-pink-600 text-white font-black text-lg uppercase tracking-widest rounded-[1.5rem] border-b-8 border-pink-700 active:border-b-0 active:translate-y-[8px] transition-all shadow-sm flex items-center justify-center gap-2">
              ENTRAR NO CASINO
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
