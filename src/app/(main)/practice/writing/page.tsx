"use client";

import { useEffect, useState, useTransition } from "react";
import { generatePracticePrompt, analyzeWriting } from "@/actions/gemini";
import { savePracticeSession } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { AILoadingScreen } from "@/components/ui/ai-loading-screen";
import { Textarea } from "../../../../components/ui/textarea"; // Correct relative path
import { Loader2, RefreshCw, Send, Sparkles, Shuffle, Target, CheckCircle2, X, BookOpen, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { PracticeSetup } from "@/components/shared/practice-setup";
import { InteractiveText } from "@/components/ui/interactive-text";

export default function WritingPracticePage() {
    const [promptData, setPromptData] = useState<{ scenario: string; translation: string; rules: string[]; hints?: string[]; languageCode?: string } | null>(null);
    const [userResponse, setUserResponse] = useState("");
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [feedback, setFeedback] = useState<{
        feedback: string;
        corrections: { original: string; correction: string; explication: string }[];
        score: number;
    } | null>(null);

    const [isGeneratingPrompt, startPromptTransition] = useTransition();
    const [isAnalyzing, startAnalysisTransition] = useTransition();

    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [config, setConfig] = useState<{ language: string; level: string; mode: "random" | "focus" } | null>(null);

    const handleStartSession = (newConfig: { language: string; level: string; mode: "random" | "focus" }) => {
        setConfig(newConfig);
        setIsSetupComplete(true);
        handleGeneratePrompt(newConfig);
    };

    const handleGeneratePrompt = (cfg = config) => {
        if (!cfg) return;
        startPromptTransition(async () => {
            setFeedback(null);
            setUserResponse("");
            const data = await generatePracticePrompt("writing", cfg.level, cfg.language, cfg.mode === "focus");
            setPromptData(data);
        });
    };

    const handleSubmit = () => {
        if (!userResponse.trim() || !promptData || !config) return;

        startAnalysisTransition(async () => {
            const result = await analyzeWriting(userResponse, promptData.scenario, config.level, config.language);
            setFeedback(result);

            try {
                await savePracticeSession({
                    type: "writing",
                    language: config.language,
                    cefrLevel: config.level,
                    prompt: promptData.scenario,
                    promptData: promptData,
                    userInput: userResponse,
                    feedback: result,
                    score: result.score,
                });
            } catch (err) {
                console.error("Failed to save session:", err);
            }
        });
    };


    if (!isSetupComplete) {
        return <PracticeSetup type="writing" onStart={handleStartSession} />;
    }

    if (isGeneratingPrompt) {
        return <AILoadingScreen message="A criar Módulo de Escrita..." submessage="A IA está a preparar o teu desafio" />;
    }

    return (
        <div className="flex flex-col min-h-screen bg-stone-50 w-full overflow-x-hidden pb-10">
            {/* ── Top Progress Header ── */}
            <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-stone-200 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors" onClick={() => setIsSetupComplete(false)}>
                        <X className="w-7 h-7" strokeWidth={3} />
                    </Button>
                    <div className="hidden sm:block h-4 w-48 md:w-64 bg-stone-100 rounded-full overflow-hidden border-2 border-stone-200">
                        {/* Fake progress for Dojo feel */}
                        <div className="h-full bg-[#58cc02] w-[35%] rounded-full opacity-50 relative overflow-hidden">
                           <div className="absolute inset-0 bg-white/20 w-full rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-black text-stone-400 uppercase tracking-widest text-xs md:text-sm bg-stone-100 px-4 py-2 rounded-2xl border-2 border-stone-200">
                    <span className="text-indigo-500">{config?.language}</span> 
                    <span className="text-stone-300">•</span> 
                    <span className="text-fuchsia-500">{config?.level}</span>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                
                {/* ── Left Column: Challenge & Editor (Spans 8 cols) ── */}
                <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
                    
                    {/* The Challenge Area */}
                    <section className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col sm:flex-row items-start gap-4 md:gap-6 relative overflow-visible z-10 transition-all hover:-translate-y-1 hover:border-b-[10px] hover:mb-[-2px]">
                        <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 bg-sky-100 rounded-[1.5rem] border-b-4 border-sky-200 flex items-center justify-center shadow-inner">
                            <Sparkles className="w-7 h-7 md:w-10 md:h-10 text-sky-500" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-3 relative z-10 w-full">
                            <h2 className="text-xl md:text-3xl font-black text-stone-700 tracking-tight leading-tight">
                                <InteractiveText text={promptData?.scenario} language={config?.language} />
                            </h2>
                            <p className="text-stone-500 font-medium text-sm md:text-lg leading-relaxed max-w-2xl">
                                {promptData?.translation}
                            </p>
                            
                            {/* Rules / Constraints */}
                            {promptData?.rules && promptData.rules.length > 0 && (
                                <div className="mt-2 pt-4 border-t-2 border-stone-100 w-full flex flex-col gap-3">
                                    <span className="text-xs font-black tracking-widest uppercase text-amber-500 flex items-center gap-2">
                                        <Target className="w-4 h-4 md:w-5 md:h-5" /> Regras do Dojo
                                    </span>
                                    <ul className="flex flex-wrap gap-2 md:gap-3">
                                        {promptData.rules.map((rule, i) => (
                                            <li key={i} className="inline-flex items-center gap-2 bg-amber-50 border-2 border-amber-100 text-amber-700 font-bold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm">
                                                <CheckCircle2 className="w-4 h-4 fill-amber-400 text-white shrink-0" />
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                    
                    {/* The Draft Pad */}
                    <section className="relative group z-0">
                        {/* Label */}
                        <div className="absolute -top-4 left-6 bg-indigo-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-xl shadow border-2 border-indigo-600 z-10 flex items-center gap-2">
                            <MessageSquareText className="w-3.5 h-3.5" /> A TUA TAREFA
                        </div>
                        <Textarea
                            placeholder="Escreve a tua resposta aqui no idioma de destino..."
                            className={cn(
                                "w-full min-h-[350px] md:min-h-[450px] bg-white border-2 border-b-8 rounded-[2rem] p-6 md:p-8 pt-10 text-lg md:text-xl font-medium focus-visible:ring-0 transition-all resize-y shadow-sm outline-none",
                                feedback
                                    ? "border-stone-200 text-stone-400 bg-stone-50"
                                    : "border-stone-200 text-stone-700 focus-visible:border-indigo-400 focus-visible:bg-indigo-50/10"
                            )}
                            value={userResponse}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserResponse(e.target.value)}
                            disabled={isAnalyzing || !!feedback}
                            style={{ lineHeight: '1.8' }}
                        />
                        {/* Dynamic Word Count - Dojo Style */}
                        {(!feedback && !isAnalyzing) && (
                            <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-[1rem] border-2 border-stone-200 font-black text-stone-500 text-xs tracking-widest uppercase shadow-sm">
                                <span className={cn("text-lg", userResponse.trim().length > 0 ? "text-indigo-500" : "")}>
                                    {userResponse.trim() ? userResponse.trim().split(/\s+/).length : 0}
                                </span> 
                                PALAVRAS
                            </div>
                        )}
                    </section>
                    
                    {/* Feedback Area */}
                    {feedback && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mt-4">
                            <div className={cn(
                                "rounded-[2rem] border-2 border-b-8 p-6 md:p-10",
                                feedback.score >= 80 ? "border-green-300 bg-green-50" :
                                    feedback.score >= 50 ? "border-amber-300 bg-amber-50" :
                                        "border-red-300 bg-red-50"
                            )}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                    <h2 className={cn(
                                        "text-2xl md:text-3xl font-black flex items-center gap-3",
                                        feedback.score >= 80 ? "text-green-700" :
                                            feedback.score >= 50 ? "text-amber-700" :
                                                "text-red-700"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border-b-4",
                                            feedback.score >= 80 ? "bg-green-200 border-green-300" :
                                                feedback.score >= 50 ? "bg-amber-200 border-amber-300" :
                                                    "bg-red-200 border-red-300"
                                        )}>
                                            <CheckCircle2 className="h-7 w-7" strokeWidth={3} />
                                        </div>
                                        Análise da AI
                                    </h2>
                                    <div className={cn(
                                        "px-6 py-2 md:py-3 rounded-[1.5rem] font-black text-xl md:text-2xl border-2 border-b-4",
                                        feedback.score >= 80 ? "bg-green-100/50 border-green-300 text-green-700" :
                                            feedback.score >= 50 ? "bg-amber-100/50 border-amber-300 text-amber-700" :
                                                "bg-red-100/50 border-red-300 text-red-700"
                                    )}>
                                        SCORE: {feedback.score}%
                                    </div>
                                </div>
                                
                                <p className="text-stone-700 font-medium text-lg leading-relaxed mb-8 bg-white/50 p-6 rounded-2xl border border-stone-200/50">
                                    {feedback.feedback}
                                </p>

                                {feedback.corrections.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-black text-stone-400 uppercase tracking-widest text-sm mb-4">
                                            Correções Sugeridas
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {feedback.corrections.map((correction, idx) => (
                                                <div key={idx} className="rounded-[1.5rem] bg-white p-5 md:p-6 border-2 border-stone-200 hover:border-indigo-200 transition-colors shadow-sm">
                                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-3">
                                                        <div className="flex-1 bg-red-50 text-red-700 font-bold px-4 py-3 rounded-xl border border-red-100 w-full line-through decoration-red-300 decoration-2">
                                                            {correction.original}
                                                        </div>
                                                        <div className="hidden md:flex shrink-0 w-8 h-8 rounded-full bg-stone-100 items-center justify-center font-bold text-stone-400">
                                                            →
                                                        </div>
                                                        <div className="flex-1 bg-green-50 text-green-700 font-black px-4 py-3 rounded-xl border border-green-200 w-full shadow-inner">
                                                            {correction.correction}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-stone-500 bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-100">
                                                        <span className="font-bold text-indigo-500">Motivo:</span> {correction.explication}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {feedback.corrections.length === 0 && (
                                    <div className="text-center p-8 bg-white rounded-[2rem] border-2 border-green-200 text-green-700 font-black text-xl shadow-sm">
                                        🎉 Trabalho Perfeito! Não há correções a fazer.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Column: Toolbelt & Submit (Spans 4 cols) ── */}
                <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
                    
                    {/* Vocabulary Card */}
                    {promptData?.hints && promptData.hints.length > 0 && (
                        <div className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col gap-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl"><BookOpen className="w-5 h-5" /></div>
                                Arsenal de Palavras
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {promptData.hints.map((hint, i) => (
                                    <span key={i} className="px-3 md:px-4 py-2 bg-stone-50 border-2 border-stone-200 rounded-xl font-bold text-stone-600 text-sm md:text-base hover:bg-stone-100 hover:-translate-y-0.5 transition-all cursor-default">
                                        {hint}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Submit Area */}
                    <div className="mt-8 lg:mt-0 flex flex-col gap-4 w-full">
                        {!feedback ? (
                            <button
                                onClick={handleSubmit}
                                disabled={!userResponse.trim() || isAnalyzing}
                                className="w-full h-20 md:h-24 bg-[#58cc02] text-white text-xl md:text-2xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <span className="animate-pulse">A AVALIAR...</span>
                                    </>
                                ) : (
                                    <>
                                        ENVIAR 
                                    </>
                                )}
                            </button>
                        ) : (
                             <button
                                onClick={() => handleGeneratePrompt()}
                                className="w-full h-20 md:h-24 bg-sky-400 text-white text-xl md:text-2xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-sky-500 hover:bg-sky-500 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm"
                            >
                                NOVO DESAFIO
                                <RefreshCw className="w-7 h-7" strokeWidth={3} />
                            </button>
                        )}
                        
                        <p className="text-center font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-400 flex items-center justify-center gap-2">
                            A AI vai avaliar a tua gramática e fluxo
                        </p>
                    </div>
                </aside>

            </main>
        </div>
    );
}

