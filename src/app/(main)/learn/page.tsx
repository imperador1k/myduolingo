"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Crown, Star, Check, Lock, ChevronRight } from "lucide-react";

// Lesson status types
type LessonStatus = "start" | "completed" | "current" | "locked" | "treasure";

type Lesson = {
    id: number;
    status: LessonStatus;
    position: "left" | "center" | "right";
};

type Unit = {
    id: number;
    title: string;
    description: string;
    color: string;
    colorDark: string;
    lessons: Lesson[];
};

// Mock data for units and lessons
const units: Unit[] = [
    {
        id: 1,
        title: "Unidade 1",
        description: "Aprende o básico de Português",
        color: "bg-green-500",
        colorDark: "border-green-600",
        lessons: [
            { id: 1, status: "start", position: "center" },
            { id: 2, status: "locked", position: "left" },
            { id: 3, status: "locked", position: "center" },
            { id: 4, status: "locked", position: "right" },
            { id: 5, status: "locked", position: "center" },
        ],
    },
    {
        id: 2,
        title: "Unidade 2",
        description: "Saudações e Apresentações",
        color: "bg-sky-500",
        colorDark: "border-sky-600",
        lessons: [
            { id: 6, status: "locked", position: "center" },
            { id: 7, status: "locked", position: "right" },
            { id: 8, status: "locked", position: "center" },
            { id: 9, status: "locked", position: "left" },
            { id: 10, status: "locked", position: "center" },
        ],
    },
];

// Lesson Node Component
const LessonNode = ({ lesson, unitColor, unitColorDark }: {
    lesson: Lesson;
    unitColor: string;
    unitColorDark: string;
}) => {
    const isActive = lesson.status === "start" || lesson.status === "current";
    const isCompleted = lesson.status === "completed";
    const isLocked = lesson.status === "locked";
    const isTreasure = lesson.status === "treasure";

    // Position offset for zigzag pattern
    const positionClasses = {
        left: "-translate-x-12",
        center: "",
        right: "translate-x-12",
    };

    const getNodeStyles = () => {
        if (isActive) {
            return `${unitColor} ${unitColorDark} border-b-4 text-white shadow-lg scale-110`;
        }
        if (isCompleted) {
            return "bg-green-500 border-green-600 border-b-4 text-white";
        }
        if (isTreasure) {
            return "bg-amber-400 border-amber-500 border-b-4 text-white";
        }
        return "bg-slate-200 border-slate-300 border-b-4 text-slate-400";
    };

    const getIcon = () => {
        if (isActive) return <Star className="h-8 w-8 fill-white" />;
        if (isCompleted) return <Check className="h-8 w-8" />;
        if (isTreasure) return <Crown className="h-8 w-8 fill-white" />;
        return <Lock className="h-6 w-6" />;
    };

    return (
        <div className={cn("flex justify-center", positionClasses[lesson.position])}>
            <Link
                href={isActive ? "/lesson" : "#"}
                className={cn(
                    "relative flex items-center justify-center",
                    isLocked && "cursor-not-allowed"
                )}
            >
                {/* Glow effect for active */}
                {isActive && (
                    <div className={cn(
                        "absolute h-20 w-20 animate-ping rounded-full opacity-20",
                        unitColor
                    )} />
                )}

                {/* START label */}
                {lesson.status === "start" && (
                    <span className="absolute -top-8 rounded-lg bg-white px-3 py-1 text-sm font-bold text-green-500 shadow-lg">
                        COMEÇAR
                    </span>
                )}

                {/* Node */}
                <div
                    className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200",
                        getNodeStyles(),
                        isActive && "hover:scale-115",
                        !isLocked && "active:scale-95 active:border-b-0"
                    )}
                >
                    {getIcon()}
                </div>
            </Link>
        </div>
    );
};

// Unit Header Component
const UnitHeader = ({ unit }: { unit: Unit }) => (
    <div className={cn(
        "flex items-center justify-between rounded-xl p-4 text-white",
        unit.color
    )}>
        <div>
            <h2 className="text-lg font-bold">{unit.title}</h2>
            <p className="text-sm opacity-90">{unit.description}</p>
        </div>
        <Button
            variant="ghost"
            className="bg-white/20 text-white hover:bg-white/30"
            size="sm"
        >
            <span className="hidden sm:inline">Continuar</span>
            <ChevronRight className="h-5 w-5" />
        </Button>
    </div>
);

// Sidebar stats (simplified)
const SidebarStats = () => (
    <div className="hidden lg:block lg:w-80">
        <div className="sticky top-6 space-y-4">
            {/* Upgrade Card */}
            <div className="rounded-xl border-2 bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                <div className="mb-2 flex items-center gap-2">
                    <Crown className="h-5 w-5 fill-amber-300 text-amber-300" />
                    <span className="font-bold">Upgrade para Pro</span>
                </div>
                <p className="mb-3 text-sm opacity-90">
                    Corações ilimitados e mais!
                </p>
                <Button
                    variant="super"
                    size="sm"
                    className="w-full"
                >
                    Upgrade Hoje
                </Button>
            </div>

            {/* Quests */}
            <div className="rounded-xl border-2 p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700">Quests</h3>
                    <Link href="#" className="text-sm font-bold text-sky-500">
                        Ver Todas
                    </Link>
                </div>
                <div className="space-y-3">
                    {[20, 50, 100, 250, 500].map((xp, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-2 flex-1 rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-green-500"
                                    style={{ width: i === 0 ? "75%" : "0%" }}
                                />
                            </div>
                            <span className="min-w-[60px] text-right text-sm font-bold text-amber-500">
                                Ganhar {xp} XP
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default function LearnPage() {
    return (
        <div className="flex gap-8">
            {/* Main Content - Lesson Map */}
            <div className="flex-1">
                {/* Course Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button className="text-2xl">🇵🇹</button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-500">Português</span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="flex items-center gap-1 text-amber-500">
                            <span className="text-lg">⚡</span>
                            <span className="font-bold">170</span>
                        </div>
                        <div className="flex items-center gap-1 text-rose-500">
                            <span className="text-lg">❤️</span>
                            <span className="font-bold">5</span>
                        </div>
                    </div>
                </div>

                {/* Units */}
                <div className="space-y-8">
                    {units.map((unit) => (
                        <div key={unit.id}>
                            {/* Unit Header */}
                            <UnitHeader unit={unit} />

                            {/* Lesson Path */}
                            <div className="relative py-8">
                                {/* Connecting line */}
                                <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-slate-200" />

                                {/* Lessons */}
                                <div className="relative flex flex-col gap-6">
                                    {unit.lessons.map((lesson) => (
                                        <LessonNode
                                            key={lesson.id}
                                            lesson={lesson}
                                            unitColor={unit.color}
                                            unitColorDark={unit.colorDark}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Sidebar */}
            <SidebarStats />
        </div>
    );
}
