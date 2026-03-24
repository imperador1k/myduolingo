"use client";

import { useEffect, useState, useTransition } from "react";
import { generateReadingText, analyzeReading } from "@/actions/gemini";
import { savePracticeSession } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Send, BookOpen, CheckCircle2, Shuffle, Target, AlertCircle, FileText, HelpCircle, PenTool, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

// Types for the new C2 Exam Structure
interface Question {
    question: string;
    options: { text: string; correct: boolean }[];
    explanation: string;
}

interface ExamData {
    article_title: string;
    article_body: string;
    questions: Question[];
    essay_prompt: string;
    languageCode?: string;
}

import { PracticeSetup } from "@/components/shared/practice-setup";
import { AILoadingScreen } from "@/components/ui/ai-loading-screen";

// ... Types ...

export default function ReadingPracticePage() {
    const [examData, setExamData] = useState<ExamData | null>(null);
    // Setup State
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [config, setConfig] = useState<{ language: string; level: string; mode: "random" | "focus" } | null>(null);

    // Exam State
    const [currentStep, setCurrentStep] = useState<"mcq" | "review" | "essay" | "analysis">("mcq");
    const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);
    const [showMcqResults, setShowMcqResults] = useState(false);
    const [userEssay, setUserEssay] = useState("");

    const [essayFeedback, setEssayFeedback] = useState<{
        feedback: string;
        score: number;
        strengths: string[];
        improvements: string[];
    } | null>(null);

    const [isGenerating, startGenerationTransition] = useTransition();
    const [isAnalyzing, startAnalysisTransition] = useTransition();

    const handleStartSession = (newConfig: { language: string; level: string; mode: "random" | "focus" }) => {
        setConfig(newConfig);
        setIsSetupComplete(true);
        handleGenerateExam(newConfig);
    };

    const handleGenerateExam = (cfg = config) => {
        if (!cfg) return;
        startGenerationTransition(async () => {
            // Reset State
            setExamData(null);
            setCurrentStep("mcq");
            setMcqAnswers([]);
            setShowMcqResults(false);
            setUserEssay("");
            setEssayFeedback(null);

            const data = await generateReadingText(cfg.level, cfg.language, cfg.mode === "focus");
            setExamData(data as any);
            if (data && data.questions) {
                setMcqAnswers(new Array(data.questions.length).fill(-1));
            }
        });
    };

    const handleMcqSelect = (questionIndex: number, optionIndex: number) => {
        if (showMcqResults) return;
        const newAnswers = [...mcqAnswers];
        newAnswers[questionIndex] = optionIndex;
        setMcqAnswers(newAnswers);
    };

    const handleSubmitMcq = () => {
        if (mcqAnswers.includes(-1)) {
            alert("Please answer all questions before submitting.");
            return;
        }
        setShowMcqResults(true);
        setCurrentStep("review");
    };

    const handleProceedToEssay = () => {
        setCurrentStep("essay");
    };

    const handleSubmitEssay = () => {
        if (!userEssay.trim() || !examData || !config) return;

        startAnalysisTransition(async () => {
            const result = await analyzeReading(userEssay, examData.essay_prompt, config.level, config.language);
            setEssayFeedback(result);
            setCurrentStep("analysis");

            try {
                await savePracticeSession({
                    type: "reading",
                    language: config.language,
                    cefrLevel: config.level,
                    prompt: examData.article_title,
                    promptData: examData,
                    userInput: JSON.stringify({ mcqAnswers, userEssay }),
                    feedback: result,
                    score: result.score,
                });
            } catch (err) {
                console.error("Failed to save session:", err);
            }
        });
    };

    if (!isSetupComplete) {
        return <PracticeSetup type="reading" onStart={handleStartSession} />;
    }

    if (isGenerating) {
        return <AILoadingScreen message="A Gerar Exame de Leitura..." submessage="A compilar o artigo e os desafios correspondentes..." />;
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
                        <div className="h-full bg-emerald-500 w-[75%] rounded-full opacity-50 relative overflow-hidden">
                           <div className="absolute inset-0 bg-white/20 w-full rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-black text-stone-400 uppercase tracking-widest text-xs md:text-sm bg-stone-100 px-4 py-2 rounded-2xl border-2 border-stone-200">
                    <span className="text-emerald-500">{config?.language}</span> 
                    <span className="text-stone-300">•</span> 
                    <span className="text-fuchsia-500">{config?.level}</span>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                {/* ── Left Column: The Article ── */}
                <div className="flex flex-col gap-6 w-full lg:sticky lg:top-24 h-max lg:max-h-[calc(100vh-140px)]">
                    {!examData ? (
                        <div className="bg-white rounded-[2rem] border-2 border-stone-200 p-12 flex items-center justify-center text-stone-400 font-bold uppercase tracking-widest shadow-sm border-b-8">
                            A carregar artigo...
                        </div>
                    ) : (
                        <section className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-10 flex flex-col h-full shadow-sm relative transition-all hover:border-b-[10px] hover:-translate-y-1 hover:mb-[-2px]">
                            <div className="absolute -top-4 left-8 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-xl shadow border-2 border-emerald-600 z-10 flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" /> LEITURA NATIVA
                            </div>
                            
                            <div className="overflow-y-auto pr-2 md:pr-4 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent h-full pb-4 pt-2">
                                <article className="prose prose-stone lg:prose-lg max-w-none">
                                    <h1 className="text-3xl md:text-4xl font-black text-stone-800 mb-8 leading-tight tracking-tight">
                                        {examData.article_title}
                                    </h1>
                                    <div className="text-justify font-serif text-stone-700 leading-relaxed md:leading-loose text-lg">
                                        <ReactMarkdown>{examData.article_body}</ReactMarkdown>
                                    </div>
                                </article>
                            </div>
                        </section>
                    )}
                </div>

                {/* ── Right Column: The Exam Tasks ── */}
                <div className="flex flex-col gap-6 w-full lg:pb-12 h-max">
                    {/* Steps Indicator Dojo Style */}
                    <div className="bg-stone-100/80 p-2 rounded-[1.5rem] border-2 border-stone-200 flex items-center justify-between shadow-inner">
                        {[
                            { id: "mcq", label: "Parte 1", icon: HelpCircle },
                            { id: "essay", label: "Redação", icon: PenTool },
                            { id: "analysis", label: "Resultados", icon: FileText },
                        ].map((step, idx) => {
                            const isActive = currentStep === step.id || (step.id === "mcq" && currentStep === "review");
                            const isCompleted = (step.id === "mcq" && (currentStep === "essay" || currentStep === "analysis")) || (step.id === "essay" && currentStep === "analysis");

                            return (
                                <div key={step.id} className={cn(
                                    "flex-1 justify-center flex items-center gap-2 px-4 py-3 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all text-center",
                                    isActive ? "bg-white text-emerald-500 shadow-sm border-2 border-stone-200 border-b-4 translate-y-[-2px]" : 
                                    isCompleted ? "text-emerald-400 bg-emerald-50/50" : "text-stone-400"
                                )}>
                                    <step.icon className={cn("h-4 w-4 md:h-5 md:w-5", isActive ? "animate-pulse" : "")} />
                                    <span className="hidden sm:inline">{step.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* PHASE 1: MCQs */}
                    {(currentStep === "mcq" || currentStep === "review") && examData && (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            <div className="bg-sky-50 border-2 border-sky-100 border-b-4 p-5 rounded-[1.5rem] flex items-center gap-4 text-sky-700 font-bold">
                                <div className="p-2 bg-sky-200 text-sky-600 rounded-full shrink-0">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <p className="text-sm md:text-base leading-snug">
                                    <b>Tarefa 1:</b> Lê o texto com atenção e responde às questões de inferência. Cuidado com as armadilhas!
                                </p>
                            </div>

                            {examData.questions?.map((q, qIdx) => (
                                <div key={qIdx} className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-stone-200 shadow-sm space-y-6 shrink-0 transition-all hover:border-b-4 hover:-translate-y-0.5">
                                    <h3 className="font-black text-stone-700 text-lg md:text-xl flex items-start gap-4">
                                        <span className="flex items-center justify-center min-w-[2.5rem] min-h-[2.5rem] bg-emerald-100 text-emerald-600 rounded-full border-2 border-emerald-200 shrink-0 select-none">
                                            {qIdx + 1}
                                        </span>
                                        <span className="mt-1">{q.question}</span>
                                    </h3>
                                    
                                    <div className="space-y-3 pl-0 md:pl-14">
                                        {q.options.map((opt, oIdx) => {
                                            const isSelected = mcqAnswers[qIdx] === oIdx;
                                            const isCorrect = opt.correct;

                                            let style = "border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-stone-600 active:bg-stone-100 cursor-pointer hover:border-b-4 border-b-4";

                                            if (showMcqResults) {
                                                if (isCorrect) style = "border-emerald-500 bg-emerald-100/50 border-b-emerald-600 text-emerald-800 font-bold border-b-4 translate-y-[-2px]";
                                                else if (isSelected && !isCorrect) style = "border-red-400 bg-red-50 border-b-red-500 text-red-800 font-bold border-b-2 translate-y-0";
                                                else style = "border-stone-200 bg-stone-50 border-b-2 text-stone-400 opacity-60 translate-y-0";
                                                style += " pointer-events-none"; // lock edits
                                            } else if (isSelected) {
                                                style = "border-emerald-500 bg-emerald-50 border-b-emerald-600 text-emerald-700 font-bold border-b-4 translate-y-[-2px] shadow-sm";
                                            }

                                            return (
                                                <div
                                                    key={oIdx}
                                                    onClick={() => handleMcqSelect(qIdx, oIdx)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 transition-all text-sm md:text-base break-words",
                                                        style
                                                    )}
                                                >
                                                    {opt.text}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {showMcqResults && (
                                        <div className="ml-0 md:ml-14 mt-4 p-4 md:p-5 bg-indigo-50/50 rounded-2xl border-2 border-indigo-100 text-sm md:text-base text-indigo-800 leading-relaxed shadow-inner">
                                            <span className="font-black uppercase tracking-widest text-xs flex items-center gap-2 mb-2 text-indigo-500"><Info className="w-4 h-4"/> Explicação</span>
                                            {q.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="pt-4 sticky bottom-4 z-20 pb-4 w-full">
                                {!showMcqResults ? (
                                    <button 
                                        onClick={handleSubmitMcq}
                                        disabled={mcqAnswers.includes(-1)}
                                        className="w-full h-16 md:h-20 bg-sky-400 text-white text-xl font-black rounded-[2rem] border-2 border-transparent border-b-8 border-b-sky-500 hover:bg-sky-500 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:grayscale"
                                    >
                                        VERIFICAR RESPOSTAS
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleProceedToEssay}
                                        className="w-full h-16 md:h-20 bg-emerald-500 text-white text-xl font-black rounded-[2rem] border-2 border-transparent border-b-8 border-b-emerald-600 hover:bg-emerald-400 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm"
                                    >
                                        AVANÇAR PARA REDAÇÃO <Send className="w-6 h-6" strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PHASE 2: ESSAY */}
                    {(currentStep === "essay" || currentStep === "analysis") && examData && (
                        <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                            <div className="bg-indigo-50 border-2 border-indigo-100 border-b-4 p-5 rounded-[1.5rem] flex items-center gap-4 text-indigo-700 font-bold">
                                <div className="p-2 bg-indigo-200 text-indigo-600 rounded-full shrink-0">
                                    <PenTool className="h-6 w-6" />
                                </div>
                                <p className="text-sm md:text-base leading-snug">
                                    <b>Tarefa 2:</b> Redação Crítica. Argumenta a tua oposição ou concordância baseada no artigo.
                                </p>
                            </div>

                            <section className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                                <div className="flex flex-col gap-2">
                                     <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 flex items-center gap-3">
                                        <div className="p-2 bg-stone-100 text-stone-500 rounded-xl"><HelpCircle className="w-5 h-5" /></div>
                                        Desafio Criativo
                                    </h3>
                                    <p className="text-lg md:text-xl text-stone-700 font-medium italic border-l-4 border-emerald-500 pl-4 py-2 mt-2 bg-stone-50/50 rounded-r-2xl">
                                        "{examData.essay_prompt}"
                                    </p>
                                </div>

                                {currentStep === "essay" ? (
                                    <>
                                        <div className="relative">
                                            <div className="absolute -top-3 left-6 bg-stone-200 text-stone-500 text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border-2 border-stone-300 z-10 flex items-center gap-2">
                                                <PenTool className="w-3 h-3" /> A TUA TRIBUNA
                                            </div>
                                            <Textarea
                                                placeholder="Escreve a tua redação aqui (mínimo de 150 palavras recomendado)..."
                                                value={userEssay}
                                                onChange={(e) => setUserEssay(e.target.value)}
                                                className="min-h-[300px] text-lg font-medium text-stone-700 p-6 md:p-8 pt-10 resize-none rounded-[1.5rem] border-2 border-stone-200 bg-stone-50 focus-visible:ring-indigo-500 focus-visible:bg-white shadow-inner placeholder:text-stone-300 placeholder:italic transition-all"
                                            />
                                             {userEssay.trim().length > 0 && (
                                                <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-[1rem] border-2 border-stone-200 font-black text-stone-500 text-xs tracking-widest uppercase shadow-sm">
                                                    <span className="text-lg text-emerald-500">
                                                        {userEssay.trim() ? userEssay.trim().split(/\s+/).length : 0}
                                                    </span> 
                                                    PALAVRAS
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            disabled={isAnalyzing || !userEssay.trim()}
                                            onClick={handleSubmitEssay}
                                            className="w-full h-20 md:h-24 bg-[#58cc02] text-white text-xl md:text-2xl font-black rounded-[2rem] border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 mt-4"
                                        >
                                            {isAnalyzing ? (
                                                <span className="animate-pulse">A AVALIAR PROEFICIÊNCIA...</span>
                                            ) : (
                                                <>AVALIAR REDAÇÃO <FileText className="w-7 h-7" strokeWidth={3} /></>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        <div className="relative">
                                             <div className="absolute -top-3 left-6 bg-stone-200 text-stone-500 text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border-2 border-stone-300 z-10 flex items-center gap-2">
                                                <Target className="w-3 h-3" /> A TUA REDAÇÃO
                                            </div>
                                            <div className="p-6 md:p-8 pt-10 bg-white rounded-[1.5rem] border-2 border-stone-200 text-stone-500 font-medium text-base max-h-48 overflow-y-auto italic shadow-inner">
                                                {userEssay}
                                            </div>
                                        </div>

                                        {essayFeedback && (
                                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mt-4 space-y-6">
                                                <div className={cn(
                                                    "rounded-[2rem] border-2 border-b-8 p-6 md:p-10",
                                                    essayFeedback.score >= 80 ? "border-green-300 bg-green-50" :
                                                        essayFeedback.score >= 50 ? "border-amber-300 bg-amber-50" :
                                                            "border-red-300 bg-red-50"
                                                )}>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                                        <h2 className={cn(
                                                            "text-2xl md:text-3xl font-black flex items-center gap-3",
                                                            essayFeedback.score >= 80 ? "text-green-700" :
                                                                essayFeedback.score >= 50 ? "text-amber-700" :
                                                                    "text-red-700"
                                                        )}>
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-full flex items-center justify-center border-b-4",
                                                                essayFeedback.score >= 80 ? "bg-green-200 border-green-300" :
                                                                    essayFeedback.score >= 50 ? "bg-amber-200 border-amber-300" :
                                                                        "bg-red-200 border-red-300"
                                                            )}>
                                                                <CheckCircle2 className="h-7 w-7" strokeWidth={3} />
                                                            </div>
                                                            Análise da Redação C2
                                                        </h2>
                                                        <div className={cn(
                                                            "px-6 py-2 md:py-3 rounded-[1.5rem] font-black text-xl md:text-2xl border-2 border-b-4",
                                                            essayFeedback.score >= 80 ? "bg-green-100/50 border-green-300 text-green-700" :
                                                                essayFeedback.score >= 50 ? "bg-amber-100/50 border-amber-300 text-amber-700" :
                                                                    "bg-red-100/50 border-red-300 text-red-700"
                                                        )}>
                                                            SCORE: {essayFeedback.score}%
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-stone-700 font-medium text-lg leading-relaxed mb-8 bg-white/50 p-6 rounded-2xl border border-stone-200/50">
                                                        {essayFeedback.feedback}
                                                    </p>

                                                    <div className="grid gap-6 md:grid-cols-2 mt-8">
                                                        <div className="rounded-[1.5rem] bg-white border-2 border-stone-200 p-6 shadow-sm">
                                                            <h3 className="flex items-center gap-2 mb-4 text-sm font-black uppercase tracking-widest text-emerald-500">
                                                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                                                Pontos Fortes
                                                            </h3>
                                                            <ul className="flex flex-col gap-3">
                                                                {essayFeedback.strengths.map((s, i) => (
                                                                    <li key={i} className="text-stone-600 font-medium text-sm md:text-base flex items-start gap-2">
                                                                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>{s}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="rounded-[1.5rem] bg-white border-2 border-stone-200 p-6 shadow-sm">
                                                            <h3 className="flex items-center gap-2 mb-4 text-sm font-black uppercase tracking-widest text-amber-500">
                                                                <Target className="h-5 w-5 shrink-0" />
                                                                A Melhorar
                                                            </h3>
                                                            <ul className="flex flex-col gap-3">
                                                                {essayFeedback.improvements.map((s, i) => (
                                                                      <li key={i} className="text-stone-600 font-medium text-sm md:text-base flex items-start gap-2">
                                                                         <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>{s}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleGenerateExam()}
                                                        className="w-full mt-8 h-16 md:h-20 bg-sky-400 text-white text-xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-sky-500 hover:bg-sky-500 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm"
                                                    >
                                                        NOVO EXAME
                                                        <RefreshCw className="w-6 h-6" strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

