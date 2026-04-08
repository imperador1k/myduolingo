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
                className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 z-[100] w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]">
                <div className="relative bg-white border-2 border-[#e5e7eb] border-b-8 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col">
                    
                    {/* ── Top decorative bar ── */}
                    <div className="h-32 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(circle_at_20%_35%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
                        
                        {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-white transition-all hover:bg-black/20 active:scale-95"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                    {/* ── Owl Lottie — floating ── */}
                    <div className="relative -mt-16 flex justify-center z-10 shrink-0">
                        <div className="relative">
                            <div className="absolute inset-x-0 bottom-2 h-8 bg-black/10 blur-md rounded-full scale-x-75" />
                            <div className="relative w-32 h-32 rounded-full bg-white border-8 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50 opacity-50" />
                                <DrunkenOwlLottie className="w-28 h-28 relative z-10" />
                            </div>
                            {isResume && (
                                <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 border-4 border-white flex items-center justify-center shadow-lg animate-bounce-subtle">
                                    <Sparkles className="h-4 w-4 text-white fill-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Content ── */}
                    <div className="px-6 pt-6 pb-6 text-center flex-1 flex flex-col">
                        <div className="mb-2">
                            <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">
                                {lesson.unitTitle}
                            </span>
                        </div>
                        <h2 className="text-stone-800 font-black text-2xl md:text-3xl leading-snug px-2">
                            {lesson.title}
                        </h2>

                            {/* ── Elite Tactile Bento Stats ── */}
                            <div className="mt-8 mb-6 grid grid-cols-3 gap-2">
                                {/* Questões - Blue */}
                                <div className="bg-[#e6f4ff] border-2 border-[#b3deff] border-b-4 rounded-xl p-2 flex flex-col items-center justify-center gap-1 text-center min-w-0">
                                    <div className="p-1.5 rounded-full bg-blue-100 text-blue-500 shrink-0">
                                        <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                                    </div>
                                    <div className="flex flex-col items-center overflow-hidden">
                                        <span className="text-[#3b82f6] font-black text-lg md:text-xl tracking-tight leading-none">{lesson.challengeCount}</span>
                                        <span className="text-[#3b82f6]/80 font-bold text-[9px] uppercase tracking-tighter truncate w-full">Questões</span>
                                    </div>
                                </div>

                                {/* XP - Yellow */}
                                <div className="bg-[#fff9e6] border-2 border-[#ffecb3] border-b-4 rounded-xl p-2 flex flex-col items-center justify-center gap-1 text-center min-w-0">
                                    <div className="p-1.5 rounded-full bg-amber-100 text-amber-500 shrink-0">
                                        <Zap className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                                    </div>
                                    <div className="flex flex-col items-center overflow-hidden">
                                        <span className="text-[#f59e0b] font-black text-lg md:text-xl tracking-tight leading-none">+{lesson.xpReward}</span>
                                        <span className="text-[#f59e0b]/80 font-bold text-[9px] uppercase tracking-tighter truncate w-full">XP</span>
                                    </div>
                                </div>

                                {/* Tempo - Green */}
                                <div className="bg-[#e6ffed] border-2 border-[#b3ffc7] border-b-4 rounded-xl p-2 flex flex-col items-center justify-center gap-1 text-center min-w-0">
                                    <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-500 shrink-0">
                                        <Clock className="h-4 w-4 md:h-5 md:w-5" />
                                    </div>
                                    <div className="flex flex-col items-center overflow-hidden">
                                        <span className="text-[#10b981] font-black text-lg md:text-xl tracking-tight leading-none">{estimatedMin}m</span>
                                        <span className="text-[#10b981]/80 font-bold text-[9px] uppercase tracking-tighter truncate w-full">Tempo</span>
                                    </div>
                                </div>
                            </div>

                        {/* ── Action Buttons ── */}
                        <div className="mt-auto flex flex-col gap-3">
                            <button
                                onClick={handleStart}
                                disabled={isLoading}
                                className={cn(
                                    "w-full bg-[#58CC02] text-white rounded-2xl py-4 text-xl font-black uppercase tracking-wider border-b-8 border-[#46a302] hover:bg-[#4eb801] active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-3",
                                    isLoading && "opacity-70 cursor-not-allowed pointer-events-none"
                                )}
                            >
                                {isLoading ? (
                                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                                ) : (
                                    <>COMEÇAR</>
                                )}
                            </button>
                            
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="text-stone-400 font-bold text-center mt-3 hover:text-stone-600 transition-colors cursor-pointer w-full uppercase py-2 active:scale-95 disabled:opacity-50 tracking-wide text-sm"
                            >
                                TALVEZ MAIS TARDE
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

