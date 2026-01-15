"use client";

import { useEffect, useState, useTransition } from "react";
import { generatePracticePrompt, analyzeWriting } from "@/actions/gemini";
import { savePracticeSession } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../../../components/ui/textarea"; // Correct relative path
import { Loader2, RefreshCw, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WritingPracticePage() {
    const [promptData, setPromptData] = useState<{ text: string; translation: string; hints?: string[] } | null>(null);
    const [userResponse, setUserResponse] = useState("");
    const [feedback, setFeedback] = useState<{
        feedback: string;
        corrections: { original: string; correction: string; explication: string }[];
        score: number;
    } | null>(null);

    const [isGeneratingPrompt, startPromptTransition] = useTransition();
    const [isAnalyzing, startAnalysisTransition] = useTransition();

    const handleGeneratePrompt = () => {
        startPromptTransition(async () => {
            setFeedback(null);
            setUserResponse("");
            const data = await generatePracticePrompt("writing");
            setPromptData(data);
        });
    };

    const handleSubmit = () => {
        if (!userResponse.trim() || !promptData) return;

        startAnalysisTransition(async () => {
            const result = await analyzeWriting(userResponse, promptData.text);
            setFeedback(result);

            try {
                await savePracticeSession({
                    type: "writing",
                    prompt: promptData.text,
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

    useEffect(() => {
        handleGeneratePrompt();
    }, []);

    return (
        <div className="mx-auto max-w-[900px] px-6 py-8 pb-20">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-700">Prática de Escrita</h1>
                <Button
                    variant="sidebar"
                    size="sm"
                    onClick={handleGeneratePrompt}
                    disabled={isGeneratingPrompt}
                >
                    {isGeneratingPrompt ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Novo Tópico
                </Button>
            </div>

            {/* Prompt Card */}
            <div className="mb-8 rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-sky-500">
                    <Sparkles className="h-5 w-5" />
                    <h2 className="font-bold uppercase tracking-wide">Tópico Sugerido</h2>
                </div>
                {isGeneratingPrompt ? (
                    <div className="flex h-20 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                    </div>
                ) : (
                    <div>
                        <p className="text-xl font-medium text-slate-800">{promptData?.text}</p>
                        <p className="mt-1 text-sm text-slate-500">{promptData?.translation}</p>

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
                )}
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
                                            <span className="text-slate-400 text-sm hidden sm:inline">→</span>
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
