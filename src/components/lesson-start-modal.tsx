"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DrunkenOwlLottie } from "@/components/lottie-animation";
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
            <div className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-90 duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]">
                <div className="relative overflow-visible rounded-3xl bg-white shadow-2xl shadow-black/30">

                    {/* ── Coloured header band ── */}
                    <div className="h-36 rounded-t-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
                        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />

                        {/* Unit label */}
                        <div className="absolute bottom-3 left-0 right-0 text-center">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
                                {lesson.unitTitle}
                            </span>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* ── Owl Lottie — floating above the fold ── */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-2" style={{ top: '52px' }}>
                        <div className="relative">
                            {/* Glow ring */}
                            <div className="absolute inset-0 rounded-full bg-violet-400/30 blur-xl scale-150" />
                            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 border-4 border-white shadow-2xl shadow-violet-500/30 flex items-center justify-center overflow-hidden">
                                <DrunkenOwlLottie className="w-28 h-28" />
                            </div>
                            {/* Star badge */}
                            {isResume && (
                                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-lg">
                                    <Trophy className="h-4 w-4 text-white fill-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Content area ── */}
                    <div className="px-5 pb-6 pt-20">

                        {/* Lesson title */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-black text-slate-800 leading-tight">
                                {lesson.title}
                            </h2>
                            {isResume && (
                                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-600">
                                    <Sparkles className="h-3 w-3" /> A continuar
                                </span>
                            )}
                        </div>

                        {/* ── Stats row ── */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {/* Questions */}
                            <div className="flex flex-col items-center gap-1 rounded-2xl bg-blue-50 border-2 border-blue-100 py-3 px-2">
                                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="text-xl font-black text-blue-700">{lesson.challengeCount}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Questões</span>
                            </div>

                            {/* XP — centre highlight */}
                            <div className="flex flex-col items-center gap-1 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-400 border-2 border-orange-300 py-3 px-2 shadow-lg shadow-amber-400/30 -translate-y-1">
                                <div className="w-8 h-8 rounded-xl bg-white/30 flex items-center justify-center">
                                    <Zap className="h-4 w-4 text-white fill-white" />
                                </div>
                                <span className="text-xl font-black text-white">+{lesson.xpReward}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">XP</span>
                            </div>

                            {/* Time */}
                            <div className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-50 border-2 border-emerald-100 py-3 px-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-emerald-600" />
                                </div>
                                <span className="text-xl font-black text-emerald-700">~{estimatedMin}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Minutos</span>
                            </div>
                        </div>

                        {/* Progress bar (if resuming) */}
                        {isResume && (
                            <div className="mb-5 rounded-2xl bg-slate-50 border border-slate-100 p-3">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="font-bold text-slate-500">Progresso anterior</span>
                                    <span className="font-black text-violet-600">{progress}%</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all duration-700"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    {lesson.completedCount}/{lesson.challengeCount} questões feitas
                                </p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-400 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleStart}
                                disabled={isLoading}
                                className={cn(
                                    "flex-[2] py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold text-base text-white transition-all",
                                    "bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/40",
                                    "hover:from-violet-400 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-violet-400/50",
                                    "active:translate-y-0.5 active:shadow-none",
                                    isLoading && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {isLoading ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                                ) : isResume ? (
                                    <><Sparkles className="h-5 w-5" /> CONTINUAR</>
                                ) : (
                                    <><Star className="h-5 w-5 fill-white" /> COMEÇAR</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
