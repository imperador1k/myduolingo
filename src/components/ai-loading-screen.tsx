"use client";

import { useEffect, useState } from "react";
import { BroomLottie } from "@/components/lottie-animation";
import { Sparkles, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES = [
    "Sintetizando a linguagem...",
    "Calibrando os modelos de IA...",
    "A ler o manual virtual...",
    "A afiar os verbos...",
    "A analisar o teu nível...",
    "A criar um cenário perfeito...",
];

interface Props {
    title?: string;
    className?: string;
}

export function AILoadingScreen({ title = "A gerar prática AI...", className }: Props) {
    const [messageIndex, setMessageIndex] = useState(0);

    // Rotate messages every few seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn(
            "flex flex-col items-center justify-center min-h-[60vh] w-full bg-white rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100",
            className
        )}>
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-400/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sky-400/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center max-w-sm w-full animate-in fade-in zoom-in duration-700">
                {/* Lottie Animation */}
                <div className="w-56 h-56 mb-8 drop-shadow-2xl">
                    <BroomLottie className="w-full h-full" />
                </div>

                {/* Processing Title */}
                <div className="flex items-center gap-3 text-violet-600 mb-6 bg-violet-50 px-5 py-2.5 rounded-2xl border border-violet-100 shadow-sm animate-bounce-subtle">
                    <BrainCircuit className="h-5 w-5 animate-pulse" />
                    <h2 className="text-lg font-black tracking-wide uppercase">{title}</h2>
                    <Sparkles className="h-5 w-5 animate-spin-slow" />
                </div>

                {/* Rotating Messages Container */}
                <div className="h-8 relative w-full flex justify-center overflow-hidden">
                    {LOADING_MESSAGES.map((msg, idx) => (
                        <p
                            key={idx}
                            className={cn(
                                "absolute text-sm font-bold text-slate-400 text-center transition-all duration-500 w-full",
                                idx === messageIndex 
                                    ? "opacity-100 translate-y-0" 
                                    : idx < messageIndex 
                                        ? "opacity-0 -translate-y-8" 
                                        : "opacity-0 translate-y-8"
                            )}
                        >
                            {msg}
                        </p>
                    ))}
                </div>

                {/* Custom glowing progress bar */}
                <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-6 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500 w-[50%] rounded-full animate-progress-indeterminate shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
                </div>
            </div>
        </div>
    );
}
