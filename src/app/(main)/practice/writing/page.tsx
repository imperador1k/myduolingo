"use client";

import { useEffect, useState, useTransition } from "react";
import { generatePracticePrompt, analyzeWriting } from "@/actions/gemini";
import { savePracticeSession } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { AILoadingScreen } from "@/components/ui/ai-loading-screen";
import { Textarea } from "../../../../components/ui/textarea"; // Correct relative path
import { Loader2, RefreshCw, Send, Sparkles, Shuffle, Target, CheckCircle2 } from "lucide-react";
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

    // ... state variables ...
    // const [language, setLanguage] = useState("Active Course");
    // const [level, setLevel] = useState("B1");
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [config, setConfig] = useState<{ language: string; level: string; mode: "random" | "focus" } | null>(null);

    const handleStartSession = (newConfig: { language: string; level: string; mode: "random" | "focus" }) => {
        setConfig(newConfig);
        setIsSetupComplete(true);
        // Trigger generation immediately
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

    // useEffect(() => {
    //     handleGeneratePrompt();
    // }, [isFocusMode, level, language]); // Re-generate when settings change

    if (!isSetupComplete) {
        return <PracticeSetup type="writing" onStart={handleStartSession} />;
    }

    if (isGeneratingPrompt) {
        return <AILoadingScreen message="A criar Módulo de Escrita..." submessage="A IA está a preparar o teu desafio" />;
    }

    return (
        <div className="mx-auto max-w-[900px] px-6 py-8 pb-20">
            <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-700">Writing Practice</h1>
                <div className="flex gap-2">
                    {/* <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="rounded-md border-slate-200 p-2 text-sm font-medium text-slate-700 shadow-sm focus:border-sky-500 focus:ring-sky-500 bg-white"
                    >
                        <option value="Active Course">Active Course</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Italian">Italian</option>
                        <option value="German">German</option>
                        <option value="English">English</option>
                        <option value="Portuguese">Portuguese</option>
                    </select>

                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="rounded-md border-slate-200 p-2 text-sm font-medium text-slate-700 shadow-sm focus:border-sky-500 focus:ring-sky-500 bg-white"
                    >
                        <option value="A1">A1 (Iniciante)</option>
                        <option value="A2">A2 (Básico)</option>
                        <option value="B1">B1 (Intermédio)</option>
                        <option value="B2">B2 (Intermédio Alto)</option>
                        <option value="C1">C1 (Avançado)</option>
                        <option value="C2">C2 (Mestre)</option>
                    </select> */}

                    <Button
                        variant="sidebar"
                        size="sm"
                        onClick={() => handleGeneratePrompt()}
                        disabled={isGeneratingPrompt}
                    >
                        {isGeneratingPrompt ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        New Topic
                    </Button>
                </div>

                {config && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        <span className="font-bold text-slate-700">{config.language}</span>
                        <span>⭐</span>
                        <span className="font-bold text-slate-700">{config.level}</span>
                        <span>⭐</span>
                        <span className="font-bold text-slate-700 uppercase">{config.mode}</span>
                    </div>
                )}
            </div>

            {/* Mode Selection Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div
                    onClick={() => {
                        if (isFocusMode) setIsFocusMode(false);
                    }}
                    className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 transition-all hover:scale-[1.02] flex items-center gap-4",
                        !isFocusMode
                            ? "bg-sky-50 border-sky-400 shadow-md"
                            : "bg-white border-slate-200 hover:border-sky-200"
                    )}
                >
                    <div className={cn("p-3 rounded-full", !isFocusMode ? "bg-sky-100 text-sky-600" : "bg-slate-100 text-slate-400")}>
                        <Shuffle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className={cn("font-bold text-lg", !isFocusMode ? "text-sky-700" : "text-slate-600")}>Random Mode</h3>
                        <p className="text-sm text-slate-500">Varied creative topics.</p>
                    </div>
                    {!isFocusMode && <CheckCircle2 className="h-6 w-6 text-sky-500 ml-auto" />}
                </div>

                <div
                    onClick={() => {
                        if (!isFocusMode) setIsFocusMode(true);
                    }}
                    className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 transition-all hover:scale-[1.02] flex items-center gap-4",
                        isFocusMode
                            ? "bg-indigo-50 border-indigo-400 shadow-md"
                            : "bg-white border-slate-200 hover:border-indigo-200"
                    )}
                >
                    <div className={cn("p-3 rounded-full", isFocusMode ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400")}>
                        <Target className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className={cn("font-bold text-lg", isFocusMode ? "text-indigo-700" : "text-slate-600")}>
                            Course Focus
                        </h3>
                        <div className="flex items-center gap-1">
                            <p className="text-sm text-slate-500">Based on your current unit.</p>
                            {isFocusMode && <span className="text-xs bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded font-bold">ACTIVE</span>}
                        </div>
                    </div>
                    {isFocusMode && <CheckCircle2 className="h-6 w-6 text-indigo-500 ml-auto" />}
                </div>
            </div> */}

            {/* Prompt Card */}
            <div className="mb-8 rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-sky-500">
                    <Sparkles className="h-5 w-5" />
                    <h2 className="font-bold uppercase tracking-wide">Tópico Sugerido</h2>
                </div>
                <div>
                    <div className="text-xl font-medium text-slate-800">
                        <InteractiveText text={promptData?.scenario} language={config?.language} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{promptData?.translation}</p>

                    {promptData?.rules && promptData.rules.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold uppercase text-amber-500 flex items-center gap-1 mb-2">
                                <Target className="h-4 w-4" /> REGRAS DO EXERCÍCIO:
                            </p>
                            <ul className="space-y-2">
                                {promptData.rules.map((rule, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                                        <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                                        <span>{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {promptData?.hints && promptData.hints.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold uppercase text-slate-400 mb-2">Ideias para explorar:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                {promptData.hints.map((hint, i) => (
                                    <li key={i} className="text-sm text-slate-600">{hint}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="mb-8">
                <Textarea
                    placeholder="Escreve a tua resposta aqui em Inglês..."
                    className="min-h-[200px] resize-none rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-lg focus-visible:ring-offset-0"
                    value={userResponse}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserResponse(e.target.value)}
                    disabled={isGeneratingPrompt || isAnalyzing}
                />
                <div className="mt-4 flex justify-end">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto"
                        onClick={handleSubmit}
                        disabled={!userResponse.trim() || isGeneratingPrompt || isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Analisando...
                            </>
                        ) : (
                            <>
                                Enviar Resposta
                                <Send className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Feedback Section */}
            {feedback && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={cn(
                        "rounded-xl border-2 p-6 mb-6",
                        feedback.score >= 80 ? "border-green-200 bg-green-50" :
                            feedback.score >= 50 ? "border-amber-200 bg-amber-50" :
                                "border-red-200 bg-red-50"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <CheckCircle2 className={cn(
                                    "h-6 w-6",
                                    feedback.score >= 80 ? "text-green-600" :
                                        feedback.score >= 50 ? "text-amber-600" :
                                            "text-red-600"
                                )} />
                                Análise da AI
                            </h2>
                            <div className={cn(
                                "px-4 py-1 rounded-full font-bold text-lg",
                                feedback.score >= 80 ? "bg-green-200 text-green-700" :
                                    feedback.score >= 50 ? "bg-amber-200 text-amber-700" :
                                        "bg-red-200 text-red-700"
                            )}>
                                Score: {feedback.score}
                            </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-6">{feedback.feedback}</p>

                        {feedback.corrections.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-700 border-b pb-2">Correções Sugeridas</h3>
                                {feedback.corrections.map((correction, idx) => (
                                    <div key={idx} className="rounded-lg bg-white/60 p-4 border border-slate-100">
                                        <div className="flex flex-col sm:flex-row gap-2 sm:items-baseline mb-2">
                                            <span className="text-red-500 line-through decoration-2 decoration-red-500/50 bg-red-50 px-2 rounded">
                                                {correction.original}
                                            </span>
                                            <span className="text-slate-400 text-sm hidden sm:inline">â†’</span>
                                            <span className="text-green-600 font-medium bg-green-50 px-2 rounded">
                                                {correction.correction}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 italic">
                                            💡 {correction.explication}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {feedback.corrections.length === 0 && (
                            <div className="text-center p-4 bg-white/50 rounded-lg text-green-700 font-medium">
                                🎉 Nenhuma correção necessária! Excelente trabalho!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

