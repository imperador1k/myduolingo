"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Star, Check, Lock, Heart, Crown } from "lucide-react";
import { LessonStartModal } from "@/components/modals/lesson-start-modal";

type Challenge = {
    id: number;
    challengeProgress?: { completed: boolean }[];
};

type Lesson = {
    id: number;
    title: string;
    completed: boolean;
    challenges?: Challenge[];
};

type Unit = {
    id: number;
    title: string;
    description: string;
    lessons: Lesson[];
};

type LessonInfo = {
    id: number;
    title: string;
    unitTitle: string;
    challengeCount: number;
    completedCount: number;
    xpReward: number;
};

type LessonNodeProps = {
    lesson: Lesson;
    unitTitle: string;
    index: number;
    isCurrent: boolean;
    isLocked: boolean;
    noHearts: boolean;
    onLessonClick: (info: LessonInfo) => void;
};

const LessonNode = ({
    lesson,
    unitTitle,
    index,
    isCurrent,
    isLocked,
    noHearts,
    onLessonClick
}: LessonNodeProps) => {
    // Exact Winding Snake Pattern Offsets
    const cycleLength = 8;
    const offsets = [0, 40, 60, 40, 0, -40, -60, -40];
    const xOffset = offsets[index % cycleLength];

    const getNodeStyles = () => {
        if (noHearts && (isCurrent || lesson.completed)) {
            return "bg-rose-400 border-rose-500 border-b-4 text-white";
        }
        if (isCurrent) {
            return "bg-green-500 border-green-600 border-b-[6px] text-white active:border-b-0 active:translate-y-1.5 focus:outline-none";
        }
        if (lesson.completed) {
            return "bg-yellow-400 border-yellow-500 border-b-[6px] text-white active:border-b-0 active:translate-y-1.5 focus:outline-none";
        }
        return "bg-gray-200 border-gray-300 border-b-[6px] text-gray-400 cursor-not-allowed";
    };

    const getIcon = () => {
        if (noHearts && (isCurrent || lesson.completed)) return <Heart className="h-7 w-7 fill-white" />;
        if (isCurrent) return <Star className="h-8 w-8 fill-white" />;
        if (lesson.completed) return <Crown className="h-8 w-8 fill-white" />;
        return <Lock className="h-6 w-6" />;
    };

    const isAccessible = (isCurrent || lesson.completed) && !noHearts;

    const handleClick = (e: React.MouseEvent) => {
        if (!isAccessible) {
            if (noHearts) {
                // Let the link navigate to shop
                return;
            }
            e.preventDefault();
            return;
        }

        e.preventDefault();

        // Calculate challenge stats
        const challengeCount = lesson.challenges?.length || 0;
        const completedCount = lesson.challenges?.filter(c =>
            c.challengeProgress?.some(p => p.completed)
        ).length || 0;

        onLessonClick({
            id: lesson.id,
            title: lesson.title,
            unitTitle: unitTitle,
            challengeCount,
            completedCount,
            xpReward: challengeCount * 10, // 10 XP per question
        });
    };

    return (
        <div 
            className="relative flex justify-center w-full my-3"
            style={{
                transform: `translateX(${xOffset}px)`,
                // Staggered entrance: each node fades+slides in with a delay
                animation: `lessonNodeIn 0.45s ease both`,
                animationDelay: `${index * 60}ms`,
            }}
        >
            <Link
                href={noHearts ? "/shop" : "#"}
                onClick={handleClick}
                className={cn(
                    "relative flex items-center justify-center rounded-full outline-none transition-transform",
                    isLocked && "cursor-not-allowed opacity-80"
                )}
            >
                {/* Glow ring for current active lesson */}
                {isCurrent && (
                    <div className="absolute h-[90px] w-[90px] animate-ping rounded-full bg-green-500 opacity-20" />
                )}

                {/* START Pill Tooltip */}
                {isCurrent && !noHearts && (
                    <div className="absolute -top-14 z-10 animate-bounce cursor-pointer" style={{ animationDuration: '2s' }}>
                        <div className="relative rounded-xl bg-green-500 px-4 py-2 text-sm font-black tracking-wide text-white shadow-xl shadow-green-500/40 uppercase">
                            Começar
                            <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-green-500" />
                        </div>
                    </div>
                )}

                {/* Tactile 3D Node */}
                <div
                    className={cn(
                        "relative flex h-[76px] w-[76px] items-center justify-center rounded-full transition-all duration-200",
                        getNodeStyles(),
                        isCurrent && "shadow-xl shadow-green-400/50",
                        isAccessible && !isCurrent && "hover:scale-105 hover:-translate-y-1 hover:shadow-lg",
                        isCurrent && "hover:scale-110"
                    )}
                >
                    {/* Inner highlight for extra 3D pop on active/completed */}
                    {(isCurrent || lesson.completed) && !noHearts && (
                        <div className="absolute top-1 w-3/4 h-[20px] rounded-full bg-white/20 blur-[1px]" />
                    )}
                    {getIcon()}
                </div>
            </Link>
        </div>
    );
};

type Props = {
    units: Unit[];
    noHearts: boolean;
};

export const LessonMap = ({ units, noHearts }: Props) => {
    const [selectedLesson, setSelectedLesson] = useState<LessonInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLessonClick = (lessonInfo: LessonInfo) => {
        setSelectedLesson(lessonInfo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLesson(null);
    };

    // Track first incomplete across ALL units
    let firstIncompleteFound = false;

    return (
        <>
            <div className="space-y-8">
                {units.map((unit) => {
                    const lessonsWithStatus = unit.lessons.map((lesson) => {
                        const isCompleted = lesson.completed;
                        let isCurrent = false;
                        let isLocked = false;

                        if (isCompleted) {
                            isCurrent = false;
                            isLocked = false;
                        } else if (!firstIncompleteFound) {
                            isCurrent = true;
                            firstIncompleteFound = true;
                        } else {
                            isLocked = true;
                        }

                        return { ...lesson, isCurrent, isLocked };
                    });

                    return (
                        <div key={unit.id}>
                            {/* Lesson Path with Connecting Line */}
                            <div className="relative py-8 flex flex-col items-center">
                                {/* The Central Ambient Line behind the snake path */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-2 -translate-x-1/2 rounded-full bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 opacity-80 z-0" />
                                
                                <div className="flex flex-col gap-6 w-full max-w-sm z-10">
                                    {lessonsWithStatus.map((lesson, index) => (
                                        <LessonNode
                                            key={lesson.id}
                                            lesson={lesson}
                                            unitTitle={unit.title}
                                            index={index}
                                            isCurrent={lesson.isCurrent}
                                            isLocked={lesson.isLocked}
                                            noHearts={noHearts}
                                            onLessonClick={handleLessonClick}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <LessonStartModal
                lesson={selectedLesson}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
};

