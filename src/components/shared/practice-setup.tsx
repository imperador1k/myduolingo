"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Target, Signal, Languages, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { getActiveLanguage, getUserLevelForLanguage } from "@/actions/evaluation";
import Link from "next/link";
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
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 md:p-8 animate-in fade-in zoom-in duration-700 relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-[15%] w-[40%] h-[40%] bg-fuchsia-400/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[10%] left-[15%] w-[50%] h-[30%] bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative z-10">
                
                {/* â”€â”€ Left Column: Hero/Context â”€â”€ */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-sky-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative h-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-sky-500 p-10 md:p-12 rounded-[2.5rem] text-center flex flex-col items-center justify-center overflow-hidden shadow-2xl border border-white/20">
                        {/* Glass Overlay */}
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-32 h-32 md:w-40 md:h-40 mb-6 drop-shadow-2xl bg-white/20 p-2 rounded-full border border-white/30 shadow-[0_0_50px_rgba(255,255,255,0.2)] backdrop-blur-md">
                                <CatLottie className="w-full h-full scale-[1.3]" />
                            </div>
                            
                            <div className="inline-flex items-center gap-1.5 bg-white/20 px-4 py-1.5 rounded-full border border-white/40 mb-5 shadow-inner backdrop-blur-md">
                                <Sparkles className="h-4 w-4 text-white animate-pulse" />
                                <span className="text-xs uppercase font-black tracking-widest text-white">AI Engine v2.5</span>
                            </div>
                            
                            <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg mb-4">
                                {getTitle()}
                            </h1>
                            <p className="text-white/80 text-base md:text-lg font-medium leading-relaxed max-w-[85%] mx-auto">
                                {getDescription()}
                            </p>
                        </div>

                        {/* Animated background shapes */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                </div>

                {/* â”€â”€ Right Column: Controls â”€â”€ */}
                <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white/50 p-8 md:p-10 flex flex-col justify-between">
                    <div className="space-y-8">
                        {/* Language Selector */}
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-violet-500 flex items-center gap-3">
                                <div className="p-1.5 bg-violet-100 rounded-lg"><Languages className="h-4 w-4" /></div>
                                Idioma de Treino
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full rounded-2xl border-2 border-slate-100 p-5 text-slate-700 font-bold text-lg focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 bg-white shadow-sm transition-all outline-none appearance-none cursor-pointer hover:border-violet-200"
                                style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%238b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 20px center' }}
                            >
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <option key={lang.value} value={lang.value}>
                                        {lang.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Level Selector */}
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-fuchsia-500 flex items-center gap-3">
                                <div className="p-1.5 bg-fuchsia-100 rounded-lg"><Signal className="h-4 w-4" /></div>
                                Nível de Dificuldade
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => {
                                    const isRecommended = recommendedLevel?.level === l;
                                    const isEvaluated = recommendedLevel?.isEvaluated;
                                    const showBadge = isRecommended;

                                    return (
                                        <button
                                            key={l}
                                            onClick={() => setLevel(l)}
                                            className={cn(
                                                "relative p-4 rounded-2xl text-base font-black border-2 transition-all flex flex-col items-center justify-center h-16",
                                                level === l
                                                    ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 shadow-lg scale-[1.05] z-10"
                                                    : "border-slate-100 bg-white text-slate-400 hover:border-fuchsia-200 hover:text-fuchsia-500",
                                                showBadge && level !== l && "border-amber-200 bg-amber-50/50 text-amber-600",
                                                showBadge && level === l && "border-amber-400 bg-amber-50 shadow-amber-200/50"
                                            )}
                                        >
                                            {l}
                                            {showBadge && (
                                                <span className={cn(
                                                    "absolute -top-3 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md border animate-bounce-subtle",
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
                        </div>

                        {/* Mode Toggle */}
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-sky-500 flex items-center gap-3">
                                <div className="p-1.5 bg-sky-100 rounded-lg"><Wand2 className="h-4 w-4" /></div>
                                Objetivo da Sessão
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setMode("random")}
                                    className={cn(
                                        "p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group",
                                        mode === "random"
                                            ? "border-sky-500 bg-sky-50 text-sky-700 shadow-md scale-[1.02]"
                                            : "border-slate-100 bg-white text-slate-400 hover:border-sky-200 hover:bg-sky-50/30"
                                    )}
                                >
                                    <Shuffle className={cn("h-6 w-6 transition-transform", mode === "random" && "scale-110 text-sky-500")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Aleatório</span>
                                </button>
                                <button
                                    onClick={() => setMode("focus")}
                                    className={cn(
                                        "p-5 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group",
                                        mode === "focus"
                                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md scale-[1.02]"
                                            : "border-slate-100 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50/30"
                                    )}
                                >
                                    <Target className={cn("h-6 w-6 transition-transform", mode === "focus" && "scale-110 text-indigo-500")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Focado no Curso</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Submit */}
                    <div className="mt-10">
                        <Button
                            size="lg"
                            className="w-full h-20 text-xl font-black tracking-wider rounded-[1.5rem] shadow-[0_15px_40px_-5px_rgba(139,92,246,0.5)] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-sky-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-sky-400 hover:-translate-y-1 border-t-2 border-white/20 transition-all text-white relative group overflow-hidden"
                            onClick={() => onStart({ language, level, mode })}
                        >
                            <Sparkles className="mr-3 h-6 w-6 animate-pulse" /> INICIAR SESSÃO IA
                            
                            {/* Shiny overlay */}
                            <div className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] skew-x-[45deg] group-hover:animate-progress-indeterminate transition-all" />
                        </Button>
                        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-5 flex items-center justify-center gap-2 opacity-70">
                            <Zap className="h-3 w-3 fill-amber-400 text-amber-400" /> Custo: 1 Crédito AI por geração
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Just importing Zap locally since it's used in the footer
import { Zap } from "lucide-react";

