"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Star, Check, Lock, Heart } from "lucide-react";
import { LessonStartModal } from "@/components/lesson-start-modal";

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
    // Zigzag positioning
    const positions = ["center", "left", "center", "right", "center"];
    const position = positions[index % 5];

    const positionClasses = {
        left: "-translate-x-12",
        center: "",
        right: "translate-x-12",
    };

    const getNodeStyles = () => {
        if (noHearts && (isCurrent || lesson.completed)) {
            return "bg-rose-400 border-rose-500 border-b-4 text-white";
        }
        if (isCurrent) {
            return "bg-green-500 border-green-600 border-b-4 text-white shadow-lg scale-110";
        }
        if (lesson.completed) {
            return "bg-green-500 border-green-600 border-b-4 text-white";
        }
        return "bg-slate-200 border-slate-300 border-b-4 text-slate-400";
    };

    const getIcon = () => {
        if (noHearts && (isCurrent || lesson.completed)) return <Heart className="h-6 w-6" />;
        if (isCurrent) return <Star className="h-8 w-8 fill-white" />;
        if (lesson.completed) return <Check className="h-8 w-8" />;
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
        <div className={cn("flex justify-center", positionClasses[position as keyof typeof positionClasses])}>
            <Link
                href={noHearts ? "/shop" : "#"}
                onClick={handleClick}
                className={cn(
                    "relative flex items-center justify-center",
                    isLocked && "cursor-not-allowed"
                )}
            >
                {/* Glow effect for current */}
                {isCurrent && (
                    <div className="absolute h-20 w-20 animate-ping rounded-full bg-green-500 opacity-20" />
                )}

                {/* START label */}
                {isCurrent && (
                    <span className="absolute -top-8 rounded-lg bg-white px-3 py-1 text-sm font-bold text-green-500 shadow-lg">
                        COMEÇAR
                    </span>
                )}

                {/* Node */}
                <div
                    className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200",
                        getNodeStyles(),
                        isAccessible && "hover:scale-105 active:scale-95 active:border-b-0"
                    )}
                >
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
                            {/* Lesson Path */}
                            <div className="py-8">
                                <div className="flex flex-col gap-6">
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
