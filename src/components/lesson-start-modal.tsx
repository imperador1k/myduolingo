"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    X,
    Star,
    Zap,
    Clock,
    BookOpen,
    Target,
    Sparkles
} from "lucide-react";

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

export const LessonStartModal = ({ lesson, isOpen, onClose }: Props) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !lesson) return null;

    const handleStart = () => {
        setIsLoading(true);
        router.push(`/lesson?id=${lesson.id}`);
    };

    const isResume = lesson.completedCount > 0;
    const progress = lesson.challengeCount > 0
        ? Math.round((lesson.completedCount / lesson.challengeCount) * 100)
        : 0;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]">
                <div className="relative overflow-hidden rounded-[2rem] border-2 border-white/20 bg-white shadow-2xl shadow-black/20">
                    {/* Decorative vibrant header */}
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 opacity-90 mix-blend-multiply" />
                    <div className="absolute inset-x-0 top-0 h-32 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-white/90 backdrop-blur-md transition-all hover:bg-black/20 hover:scale-105 active:scale-95"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Content */}
                    <div className="relative px-6 pb-6 pt-20">
                        {/* Lesson Icon */}
                        <div className="absolute left-1/2 top-8 -translate-x-1/2">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl">
                                <Target className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        {/* Lesson Info */}
                        <div className="mt-8 text-center">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                {lesson.unitTitle}
                            </p>
                            <h2 className="mt-1 text-2xl font-bold text-slate-800">
                                {lesson.title}
                            </h2>
                        </div>

                        {/* Stats Grid */}
                        <div className="mt-8 grid grid-cols-3 gap-3">
                            {/* Questions */}
                            <div className="flex flex-col items-center rounded-2xl bg-gray-50 border-2 border-gray-100 p-3 shadow-sm">
                                <BookOpen className="h-6 w-6 text-blue-500 mb-1" />
                                <span className="text-lg font-black text-slate-700">
                                    {lesson.challengeCount}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">questões</span>
                            </div>

                            {/* XP */}
                            <div className="flex flex-col items-center rounded-2xl bg-gray-50 border-2 border-gray-100 p-3 shadow-sm">
                                <Zap className="h-6 w-6 text-amber-500 mb-1" />
                                <span className="text-lg font-black text-amber-600">
                                    +{lesson.xpReward}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">XP</span>
                            </div>

                            {/* Time */}
                            <div className="flex flex-col items-center rounded-2xl bg-gray-50 border-2 border-gray-100 p-3 shadow-sm">
                                <Clock className="h-6 w-6 text-emerald-500 mb-1" />
                                <span className="text-lg font-black text-slate-700">
                                    ~{Math.max(1, Math.ceil(lesson.challengeCount * 0.5))}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">min</span>
                            </div>
                        </div>

                        {/* Progress (if resuming) */}
                        {isResume && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Progresso</span>
                                    <span className="font-bold text-green-600">{progress}%</span>
                                </div>
                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                className="flex-1 order-2 sm:order-1 text-gray-400 font-bold hover:bg-gray-100 rounded-xl py-6 border-0"
                                disabled={isLoading}
                            >
                                CANCELAR
                            </Button>
                            <Button
                                onClick={handleStart}
                                className={cn(
                                    "flex-[2] order-1 sm:order-2 gap-2 bg-green-500 border-2 border-green-600 border-b-4 text-white font-extrabold text-lg rounded-xl py-6 transition-all",
                                    "hover:bg-green-400 active:border-b-0 active:translate-y-[4px] hover:-translate-y-[2px]",
                                    isLoading && "opacity-70 cursor-not-allowed"
                                )}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                                ) : (
                                    <>
                                        {isResume ? (
                                            <>
                                                <Sparkles className="h-6 w-6" />
                                                CONTINUAR
                                            </>
                                        ) : (
                                            <>
                                                <Star className="h-6 w-6 fill-white" />
                                                COMEÇAR
                                            </>
                                        )}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
