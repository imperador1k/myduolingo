"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Bot,
  Mic,
  PenTool,
  BookOpen,
  Headphones,
  Sparkles,
  X,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PracticeInfoModal = ({ isOpen, onOpenChange }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none [&>button]:hidden z-[100]">
        <div className="relative bg-white border-2 border-stone-200 border-b-8 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col items-center">
          {/* Custom Close Button */}
          <DialogClose className="absolute right-4 top-4 h-10 w-10 flex items-center justify-center rounded-2xl bg-white/20 text-white hover:bg-white/30 hover:scale-105 transition-all active:scale-95 z-50">
            <X className="w-5 h-5 font-black" />
          </DialogClose>

          {/* Header Area */}
          <DialogHeader className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 p-8 pt-10 pb-12 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-10 mix-blend-overlay"></div>

            <div className="w-20 h-20 bg-white/20 backdrop-blur-md text-white rounded-[2rem] flex items-center justify-center mb-4 rotate-[-5deg] border-4 border-white/30 shadow-lg relative z-10">
              <Bot className="w-10 h-10" />
            </div>

            <DialogTitle className="text-3xl font-black text-white text-center tracking-tight drop-shadow-md relative z-10 uppercase">
              Área de Prática
            </DialogTitle>
          </DialogHeader>

          {/* Content Area */}
          <div className="flex flex-col items-center justify-center gap-6 p-8 w-full -mt-6 bg-white rounded-t-[2.5rem] relative z-20">
            <p className="text-[15px] font-bold text-stone-500 text-center leading-relaxed">
              Descobre o poder da nossa{" "}
              <span className="text-indigo-500 font-black">
                Inteligência Artificial
              </span>{" "}
              e acelera a tua fluência com exercícios direcionados:
            </p>

            <div className="flex flex-col gap-3 w-full">
              {/* Escrita & Leitura */}
              <div className="flex items-center gap-4 bg-sky-50 p-4 rounded-2xl border-2 border-sky-100">
                <div className="h-12 w-12 bg-white rounded-xl border-2 border-sky-200 flex items-center justify-center shrink-0">
                  <PenTool className="w-6 h-6 text-sky-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sky-700 uppercase tracking-wider text-sm">
                    Escrita & Leitura
                  </span>
                  <span className="text-xs font-bold text-sky-600/70">
                    A IA corrige os teus textos e analisa a tua compreensão.
                  </span>
                </div>
              </div>

              {/* Escuta & Fala */}
              <div className="flex items-center gap-4 bg-rose-50 p-4 rounded-2xl border-2 border-rose-100">
                <div className="h-12 w-12 bg-white rounded-xl border-2 border-rose-200 flex items-center justify-center shrink-0">
                  <Mic className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-rose-700 uppercase tracking-wider text-sm">
                    Fala & Escuta
                  </span>
                  <span className="text-xs font-bold text-rose-600/70">
                    Treina o ouvido e recebe dicas de pronúncia.
                  </span>
                </div>
              </div>

              {/* Conversação Fluída */}
              <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-100">
                <div className="h-12 w-12 bg-white rounded-xl border-2 border-indigo-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-indigo-700 uppercase tracking-wider text-sm">
                    Conversação Fluída
                  </span>
                  <span className="text-xs font-bold text-indigo-600/70">
                    Fala em tempo real como se estivesses com um nativo!
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full mt-2">
              <button
                onClick={() => onOpenChange(false)}
                className="w-full py-4 bg-[#1CB0F6] hover:bg-[#1899D6] text-white font-black text-[15px] uppercase tracking-widest rounded-2xl border-b-4 border-[#1899D6] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center"
              >
                VAMOS PRATICAR!
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
