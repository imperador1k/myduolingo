"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Zap, CopyMinus, Sparkles, X, Gamepad2, Dices } from "lucide-react";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ArcadeInfoModal = ({ isOpen, onOpenChange }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none [&>button]:hidden z-[100]">
        <div className="relative bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-8 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col items-center">
          {/* Custom Close Button */}
          <DialogClose className="absolute right-4 top-4 h-10 w-10 flex items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/30 hover:scale-105 transition-all active:scale-95 z-50">
            <X className="w-5 h-5 font-black" />
          </DialogClose>

          {/* Header Area */}
          <DialogHeader className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 p-8 pt-10 pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10 mix-blend-overlay"></div>

            <div className="w-20 h-20 bg-white/20 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center mb-4 rotate-[-5deg] border-4 border-white/30 shadow-lg relative z-10">
              <Gamepad2 className="w-10 h-10" />
            </div>

            <DialogTitle className="text-3xl font-black text-white text-center tracking-tight drop-shadow-md relative z-10 uppercase">
              Bem-vindo ao Arcade!
            </DialogTitle>
          </DialogHeader>

          {/* Content Area */}
          <div className="flex flex-col items-center justify-center gap-6 p-8 w-full -mt-6 bg-white dark:bg-slate-900 rounded-t-[2.5rem] relative z-20">
            <p className="text-[15px] font-bold text-stone-500 dark:text-slate-400 text-center leading-relaxed">
              Aqui podes treinar os teus reflexos e ganhar{" "}
              <span className="text-amber-500 font-black">XP extra</span>!
              Descobre os nossos minijogos:
            </p>

            <div className="flex flex-col gap-3 w-full">
              {/* Sprint */}
              <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-2xl border-2 border-purple-100">
                <div className="h-12 w-12 bg-white dark:bg-slate-900 rounded-xl border-2 border-purple-200 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-purple-500 fill-purple-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-purple-700 uppercase tracking-wider text-sm">
                    Sprint
                  </span>
                  <span className="text-xs font-bold text-purple-600/70">
                    Traduz rápido e ganha combos!
                  </span>
                </div>
              </div>

              {/* Swipe */}
              <div className="flex items-center gap-4 bg-rose-50 p-4 rounded-2xl border-2 border-rose-100">
                <div className="h-12 w-12 bg-white dark:bg-slate-900 rounded-xl border-2 border-rose-200 flex items-center justify-center shrink-0">
                  <CopyMinus className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-rose-700 uppercase tracking-wider text-sm">
                    O Deslize
                  </span>
                  <span className="text-xs font-bold text-rose-600/70">
                    Arrasta para decidir: Verdade ou Mentira.
                  </span>
                </div>
              </div>

              {/* Meteoros */}
              <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border-2 border-amber-100">
                <div className="h-12 w-12 bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200 flex items-center justify-center shrink-0 relative overflow-hidden">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-amber-700 uppercase tracking-wider text-sm">
                    Meteoros
                  </span>
                  <span className="text-xs font-bold text-amber-600/70">
                    Destrói as palavras antes que caiam!
                  </span>
                </div>
              </div>

              {/* Casino */}
              <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 mt-2">
                <div className="h-12 w-12 bg-slate-900 rounded-xl border-2 border-cyan-500 flex items-center justify-center shrink-0">
                  <Dices className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                    Casino 8-Bit
                    <span className="bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full border border-yellow-300 leading-none">
                      PRO
                    </span>
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Aposta coins em minijogos de risco.
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full mt-2">
              <button
                onClick={() => onOpenChange(false)}
                className="w-full py-4 bg-[#1CB0F6] hover:bg-[#1899D6] text-white font-black text-[15px] uppercase tracking-widest rounded-2xl border-b-4 border-[#1899D6] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
              >
                VAMOS A ISTO!
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
