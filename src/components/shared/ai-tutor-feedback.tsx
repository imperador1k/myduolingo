"use client";

import { useState } from "react";
import { getErrorExplanation } from "@/actions/ai-tutor";
import { Loader2, Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveText } from "@/components/ui/interactive-text";

type AITutorFeedbackProps = {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    targetLanguage: string;
    className?: string;
};

export const AITutorFeedback = ({
    question,
    userAnswer,
    correctAnswer,
    targetLanguage,
    className
}: AITutorFeedbackProps) => {
    const [status, setStatus] = useState<"idle" | "loading" | "resolved">("idle");
    const [explanation, setExplanation] = useState<string | null>(null);

    const handleExplain = async () => {
        if (status !== "idle") return;
        setStatus("loading");
        
        try {
            const explanationText = await getErrorExplanation(
                question,
                userAnswer,
                correctAnswer,
                targetLanguage
            );
            setExplanation(explanationText);
            setStatus("resolved");
        } catch (error) {
            setExplanation("Aconteceu um erro ao tentar contactar o tutor. Tenta novamente mais tarde.");
            setStatus("resolved");
        }
    };

    if (status === "idle") {
        return (
            <button
                onClick={handleExplain}
                className={cn(
                    "flex items-center gap-2 bg-purple-100 text-purple-600 hover:bg-purple-200 border-2 border-purple-200 border-b-[4px] rounded-xl px-4 py-3 font-extrabold transition-all active:translate-y-[2px] active:border-b-2",
                    className
                )}
            >
                <Bot className="h-5 w-5" />
                Explica-me o erro 🪄
            </button>
        );
    }

    if (status === "loading") {
        return (
            <div className={cn("flex flex-col items-center justify-center p-4 bg-purple-50 rounded-2xl border-2 border-purple-100", className)}>
                <div className="flex items-center gap-2 font-bold text-slate-500 animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                    O Marco está a analisar...
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden bg-white/80 border-2 border-pink-200/50 rounded-2xl p-4 shadow-sm flex-1 min-w-0", className)}>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-300 rounded-full blur-[60px] opacity-30 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-fuchsia-300 rounded-full blur-[60px] opacity-30 pointer-events-none" />
            
            <h4 className="font-extrabold text-purple-600 flex items-center gap-2 mb-2 relative z-10 w-full shrink-0">
                <Sparkles className="h-4 w-4 shrink-0" /> 
                <span className="truncate">Aviso do Marco</span>
            </h4>
            
            <div className="text-stone-700 font-medium leading-relaxed relative z-10 text-sm whitespace-normal break-words">
                <InteractiveText text={explanation || ""} language="pt-PT" />
            </div>
        </div>
    );
};
