"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Target, Signal, Languages, Sparkles, Wand2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { getActiveLanguage, getUserLevelForLanguage } from "@/actions/evaluation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CatLottie } from "@/components/ui/lottie-animation";

type PracticeConfig = {
    language: string;
    level: string;
    mode: "random" | "focus";
};

type Props = {
    type: "writing" | "speaking" | "reading" | "listening";
    onStart: (config: PracticeConfig) => void;
};

export function PracticeSetup({ type, onStart }: Props) {
    const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
    const [level, setLevel] = useState("B1");
    const [mode, setMode] = useState<"random" | "focus">("random");
    const [recommendedLevel, setRecommendedLevel] = useState<{ level: string; isEvaluated: boolean } | null>(null);
    const router = useRouter();

    // Initial load: Fetch active language
    useEffect(() => {
        getActiveLanguage().then((lang) => {
            if (lang) {
                const match = SUPPORTED_LANGUAGES.find(
                    (l) => l.value.toLowerCase() === lang.toLowerCase()
                );
                if (match) setLanguage(match.value);
            }
        });
    }, []);

    // Check user's evaluated level
    useEffect(() => {
        if (!language) return;
        getUserLevelForLanguage(language).then((res) => {
            setRecommendedLevel(res);
        });
    }, [language]);

    const getTitle = () => {
        switch (type) {
            case "writing": return "Módulo de Escrita AI";
            case "speaking": return "Sintetizador de Voz";
            case "reading": return "Análise de Texto AI";
            case "listening": return "Treino Auditivo AI";
        }
    };

    const getDescription = () => {
        switch (type) {
            case "writing": return "Gera cenários imersivos para escreveres ensaios ou respostas.";
            case "speaking": return "Simula conversas nativas para testar a tua fluência.";
            case "reading": return "Processa textos complexos criados sob medida para o teu nível.";
            case "listening": return "Cria áudios nativos dinâmicos gerados em tempo real.";
        }
    };
     return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-10 px-4 md:px-6 animate-in fade-in zoom-in-95 duration-500 w-full mb-20 relative">
            
            {/* ── Back Button ── */}
            <button 
                onClick={() => router.push('/practice')}
                className="absolute top-4 left-4 md:top-8 md:left-8 px-4 py-2 bg-white rounded-2xl border-2 border-stone-200 border-b-4 text-stone-400 font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-stone-50 hover:text-stone-600 active:border-b-0 active:translate-y-1 active:mb-1 transition-all flex items-center gap-2 shadow-sm z-50"
            >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Voltar</span>
            </button>

            {/* ── Header ── */}
            <div className="text-center mb-10 md:mb-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 shadow-sm mb-6">
                    <CatLottie className="w-20 h-20 scale-[1.35]" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-stone-700 tracking-tight mb-4">
                    {getTitle()}
                </h1>
                <p className="text-stone-500 font-medium text-lg md:text-xl max-w-2xl mx-auto">
                    {getDescription()}
                </p>
            </div>

            {/* ── Main Layout: 3 Columns on Large Screens ── */}
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start relative z-10">
                
                {/* ── Left/Middle: Setup Controls (Spans 2 columns) ── */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    
                    {/* Language Selector */}
                    <div className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col gap-4">
                        <label className="text-sm font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <Languages className="h-5 w-5 text-indigo-400" />
                            Idioma de Treino
                        </label>
                        <div className="relative">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full rounded-2xl border-2 border-stone-200 bg-stone-50 p-5 md:p-6 text-stone-700 font-bold text-xl md:text-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all outline-none cursor-pointer appearance-none hover:bg-stone-100"
                            >
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <option key={lang.value} value={lang.value}>
                                        {lang.label}
                                    </option>
                                ))}
                            </select>
                            {/* Custom caret */}
                            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                    </div>

                    {/* Difficulty Grid */}
                    <div className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col gap-4">
                        <label className="text-sm font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <Signal className="h-5 w-5 text-amber-500" />
                            Nível de Dificuldade
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
                            {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => {
                                const isSelected = level === l;
                                const isEvaluated = recommendedLevel?.isEvaluated && recommendedLevel.level === l;
                                const isSuggested = recommendedLevel?.level === l && !isEvaluated;

                                return (
                                    <button
                                        key={l}
                                        onClick={() => setLevel(l)}
                                        className={cn(
                                            "relative p-4 md:p-5 rounded-2xl text-xl md:text-3xl font-black transition-all flex flex-col items-center justify-center border-2 h-20 md:h-24 outline-none",
                                            isSelected
                                                ? "border-amber-400 bg-amber-50 text-amber-600 border-b-4 translate-y-1 shadow-inner"
                                                : "border-stone-200 bg-white text-stone-400 border-b-6 md:border-b-8 hover:bg-stone-50 hover:border-b-4 hover:translate-y-1"
                                        )}
                                    >
                                        {l}
                                        {(isEvaluated || isSuggested) && (
                                            <span className={cn(
                                                "absolute -top-3 md:-top-4 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest shadow-sm border",
                                                isEvaluated
                                                    ? "bg-amber-400 text-white border-amber-500"
                                                    : "bg-indigo-100 text-indigo-600 border-indigo-200"
                                            )}>
                                                {isEvaluated ? "O TEU NÍVEL" : "SUGESTÃO"}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Right Column: Goal & Launch (Spans 1 column) ── */}
                <div className="lg:col-span-1 space-y-6 md:space-y-8 h-full flex flex-col">
                    
                    {/* Mode Toggle */}
                    <div className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col gap-4 flex-1">
                        <label className="text-sm font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                            <Target className="h-5 w-5 text-sky-500" />
                            Modo de Foco
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 md:gap-5 flex-1">
                            <button
                                onClick={() => setMode("random")}
                                className={cn(
                                    "p-4 md:p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 md:gap-3 transition-all text-center h-full min-h-[100px]",
                                    mode === "random"
                                        ? "border-sky-400 bg-sky-50 text-sky-600 border-b-4 translate-y-1 shadow-inner"
                                        : "border-stone-200 bg-white text-stone-400 border-b-6 md:border-b-8 hover:bg-stone-50 hover:border-b-4 hover:translate-y-1"
                                )}
                            >
                                <Shuffle className="h-7 w-7 md:h-8 md:w-8" />
                                <span className="text-sm font-black uppercase tracking-wider">Aleatório</span>
                            </button>
                            <button
                                onClick={() => setMode("focus")}
                                className={cn(
                                    "p-4 md:p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 md:gap-3 transition-all text-center h-full min-h-[100px]",
                                    mode === "focus"
                                        ? "border-indigo-400 bg-indigo-50 text-indigo-600 border-b-4 translate-y-1 shadow-inner"
                                        : "border-stone-200 bg-white text-stone-400 border-b-6 md:border-b-8 hover:bg-stone-50 hover:border-b-4 hover:translate-y-1"
                                )}
                            >
                                <Target className="h-7 w-7 md:h-8 md:w-8" />
                                <span className="text-sm font-black uppercase tracking-wider">Foco na Unidade</span>
                            </button>
                        </div>
                    </div>

                    {/* Launch Button Area */}
                    <div className="flex flex-col gap-4 mt-auto pt-2">
                        <button
                            onClick={() => onStart({ language, level, mode })}
                            className="w-full h-20 md:h-24 rounded-2xl bg-[#58cc02] text-white border-2 border-transparent border-b-8 border-b-[#46a302] flex items-center justify-center gap-3 text-xl md:text-2xl font-black uppercase tracking-widest transition-all active:border-b-0 active:mt-2 active:mb-[-8px] hover:bg-[#61da02]"
                        >
                            <Sparkles className="h-6 w-6 md:h-8 md:w-8 fill-white" /> INICIAR SESSÃO
                        </button>
                        <p className="text-center text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center justify-center gap-2 mb-2">
                            <Zap className="h-4 w-4 fill-amber-400 text-amber-400" /> 1 Crédito AI
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Just importing Zap locally since it's used in the footer
import { Zap } from "lucide-react";
