"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DrunkenOwlLottie } from "@/components/ui/lottie-animation";
import { X, Star, Zap, Clock, BookOpen, Sparkles, Trophy } from "lucide-react";

type LessonInfo = {
    id: number;
    title: string;
    unitTitle: string;
    challengeCount: number;
    completedCount: number;
    xpReward: number;
};

type Props = {
    lesson: LessonInfo | null;
    isOpen: boolean;
    onClose: () => void;
};

import { useUISounds } from "@/hooks/use-ui-sounds";

export const LessonStartModal = ({ lesson, isOpen, onClose }: Props) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { playStart } = useUISounds();

    if (!isOpen || !lesson) return null;

    const handleStart = () => {
        playStart();
        setIsLoading(true);
        router.push(`/lesson?id=${lesson.id}`);
    };

    const isResume = lesson.completedCount > 0;
    const progress = lesson.challengeCount > 0
        ? Math.round((lesson.completedCount / lesson.challengeCount) * 100)
        : 0;
    const estimatedMin = Math.max(1, Math.ceil(lesson.challengeCount * 0.5));

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]">
                <div className="relative overflow-visible rounded-[2.5rem] bg-white p-2 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3),0_0_50px_rgba(139,92,246,0.1)] border-b-8 border-slate-100">
                    
                    {/* Inner Content Wrapper */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-white pb-8">
                        
                        {/* â”€â”€ Top decorative bar â”€â”€ */}
                        <div className="h-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(circle_at_20%_35%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
                            
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-white transition-all hover:bg-black/20 active:scale-95"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* â”€â”€ Owl Lottie â€” floating â”€â”€ */}
                        <div className="relative -mt-16 flex justify-center z-10">
                            <div className="relative">
                                {/* Glow ring */}
                                <div className="absolute inset-x-0 bottom-2 h-8 bg-black/10 blur-md rounded-full scale-x-75" />
                                <div className="relative w-32 h-32 rounded-full bg-white border-8 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50 opacity-50" />
                                    <DrunkenOwlLottie className="w-28 h-28 relative z-10" />
                                </div>
                                {/* Badge */}
                                {isResume && (
                                    <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 border-4 border-white flex items-center justify-center shadow-lg animate-bounce-subtle">
                                        <Sparkles className="h-4 w-4 text-white fill-white" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* â”€â”€ Content â”€â”€ */}
                        <div className="px-6 pt-4 text-center">
                            <div className="mb-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {lesson.unitTitle}
                                </span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 leading-tight mb-6 px-2">
                                {lesson.title}
                            </h2>

                            {/* â”€â”€ Elegant Stats Row â”€â”€ */}
                            <div className="flex items-center justify-center gap-6 mb-8 py-4 border-y border-slate-50">
                                {/* Questions */}
                                <div className="flex items-center gap-2 group">
                                    <div className="p-2 rounded-xl bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-sm font-black text-slate-700">{lesson.challengeCount}</span>
                                        <span className="text-[9px] font-bold uppercase text-slate-400">Questões</span>
                                    </div>
                                </div>

                                {/* XP */}
                                <div className="flex items-center gap-2 group">
                                    <div className="p-2 rounded-xl bg-amber-50 text-amber-500 group-hover:scale-110 transition-transform">
                                        <Zap className="h-4 w-4 fill-current" />
                                    </div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-sm font-black text-slate-700">+{lesson.xpReward}</span>
                                        <span className="text-[9px] font-bold uppercase text-slate-400">XP</span>
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-2 group">
                                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 group-hover:scale-110 transition-transform">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-sm font-black text-slate-700">{estimatedMin}m</span>
                                        <span className="text-[9px] font-bold uppercase text-slate-400">Tempo</span>
                                    </div>
                                </div>
                            </div>

                            {/* â”€â”€ Action Buttons â”€â”€ */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleStart}
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all",
                                        "bg-[#58cc02] text-white border-b-8 border-[#46a302] hover:bg-[#61da02] hover:border-[#52bc02]",
                                        "active:border-b-0 active:translate-y-2",
                                        isLoading && "opacity-70 cursor-not-allowed pointer-events-none"
                                    )}
                                >
                                    {isLoading ? (
                                        <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                                    ) : isResume ? (
                                        <><Sparkles className="h-6 w-6 fill-white" /> CONTINUAR</>
                                    ) : (
                                        <><Star className="h-6 w-6 fill-white" /> COMEÇAR</>
                                    )}
                                </button>
                                
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl font-black text-sm text-slate-400 hover:text-slate-500 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    TALVEZ MAIS TARDE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

