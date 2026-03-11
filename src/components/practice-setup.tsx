"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Target, Signal, Languages, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { getActiveLanguage, getUserLevelForLanguage } from "@/actions/evaluation";
import Link from "next/link";
import { CatLottie } from "@/components/lottie-animation";

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
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 animate-in fade-in zoom-in duration-700 relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-[20%] w-[30%] h-[40%] bg-fuchsia-400/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[30%] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden relative z-10 transition-all hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.3)]">
                
                {/* Header with Float Lottie */}
                <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-sky-500 p-8 pb-10 text-center overflow-hidden">
                    {/* Glass Overlay over gradient */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-28 h-28 mb-2 drop-shadow-xl bg-white/20 p-2 rounded-full border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.3)] backdrop-blur-sm">
                            <CatLottie className="w-full h-full scale-[1.3]" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full border border-white/40 mb-3 shadow-inner backdrop-blur-md">
                            <Sparkles className="h-3.5 w-3.5 text-white" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-white">AI Engine</span>
                        </div>
                        <h1 className="text-2xl font-black text-white drop-shadow-md">{getTitle()}</h1>
                        <p className="text-white/80 text-sm mt-2 font-medium leading-relaxed max-w-[90%] mx-auto">{getDescription()}</p>
                    </div>
                </div>

                {/* Glassy Body */}
                <div className="p-7 space-y-7 bg-white/50">
                    
                    {/* Language Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-wider text-violet-400 flex items-center gap-2">
                            <Languages className="h-4 w-4" /> Qual idioma queres treinar?
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full rounded-2xl border-2 border-violet-100 p-4 text-violet-900 font-bold focus:ring-4 focus:ring-violet-500/20 focus:border-violet-400 bg-white shadow-sm transition-all outline-none appearance-none cursor-pointer"
                            style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%238b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                        >
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Level Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-wider text-fuchsia-400 flex items-center gap-2">
                            <Signal className="h-4 w-4" /> Nível AI (Dificuldade)
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => {
                                const isRecommended = recommendedLevel?.level === l;
                                const isEvaluated = recommendedLevel?.isEvaluated;
                                const showBadge = isRecommended;

                                return (
                                    <button
                                        key={l}
                                        onClick={() => setLevel(l)}
                                        className={cn(
                                            "relative p-3 rounded-xl text-sm font-black border-2 transition-all flex flex-col items-center justify-center h-14 overflow-visible",
                                            level === l
                                                ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 shadow-[0_0_15px_rgba(217,70,239,0.3)] scale-[1.03] z-10"
                                                : "border-slate-100 bg-white text-slate-400 hover:border-fuchsia-200 hover:text-fuchsia-500",
                                            showBadge && level !== l && "border-amber-200 bg-amber-50/50 text-amber-600",
                                            showBadge && level === l && "border-amber-400 bg-amber-50 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                                        )}
                                    >
                                        {l}
                                        {showBadge && (
                                            <span className={cn(
                                                "absolute -top-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md border animate-bounce-subtle whitespace-nowrap",
                                                isEvaluated
                                                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-orange-300"
                                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                            )}>
                                                {isEvaluated ? "O TEU NÍVEL" : "SUGESTÃO"}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {recommendedLevel && !recommendedLevel.isEvaluated && (
                            <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm">
                                <Sparkles className="h-5 w-5 text-fuchsia-500 shrink-0 mt-0.5 animate-pulse" />
                                <p className="text-xs text-violet-800 leading-relaxed font-semibold">
                                    Não sabes o teu nível? Faz o <Link href="/evaluation" className="underline font-black text-fuchsia-600 hover:text-fuchsia-800 transition-colors">Teste de Nível AI</Link> para obteres uma avaliação exata do modelo!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Mode Toggle */}
                    <div className="space-y-3 pt-2">
                        <label className="text-xs font-black uppercase tracking-wider text-sky-500 flex items-center gap-2">
                            <Wand2 className="h-4 w-4" /> Qual a diretriz da AI?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setMode("random")}
                                className={cn(
                                    "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group",
                                    mode === "random"
                                        ? "border-sky-500 bg-sky-50 text-sky-700 shadow-[0_0_20px_rgba(14,165,233,0.3)] scale-[1.02]"
                                        : "border-slate-100 bg-white text-slate-400 hover:border-sky-200 hover:bg-sky-50/30"
                                )}
                            >
                                <Shuffle className={cn("h-7 w-7 transition-transform", mode === "random" && "scale-110 text-sky-500")} />
                                <span className="text-xs font-black uppercase tracking-wide">Tópico AI Rando</span>
                            </button>
                            <button
                                onClick={() => setMode("focus")}
                                className={cn(
                                    "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group",
                                    mode === "focus"
                                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02]"
                                        : "border-slate-100 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50/30"
                                )}
                            >
                                <Target className={cn("h-7 w-7 transition-transform", mode === "focus" && "scale-110 text-indigo-500")} />
                                <span className="text-xs font-black uppercase tracking-wide">Foco do Curso</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Submit */}
                <div className="p-7 pt-4 bg-white/50 pb-8">
                    <Button
                        size="lg"
                        className="w-full h-16 text-lg font-black tracking-wide rounded-2xl shadow-[0_10px_40px_-10px_rgba(139,92,246,0.6)] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-sky-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-sky-400 hover:scale-[1.02] border border-white/20 transition-all text-white overflow-hidden relative group"
                        onClick={() => onStart({ language, level, mode })}
                    >
                        <div className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[200%] skew-x-[45deg] group-hover:animate-progress-indeterminate transition-all" />
                        <Sparkles className="mr-2 h-5 w-5 animate-pulse" /> INICIAR GERAÇÃO IA
                    </Button>
                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-4 flex items-center justify-center gap-1.5 opacity-80">
                        <Zap className="h-3 w-3 fill-amber-400 text-amber-400" /> Custo: 1 Crédito AI
                    </p>
                </div>
            </div>
        </div>
    );
}

// Just importing Zap locally since it's used in the footer
import { Zap } from "lucide-react";
