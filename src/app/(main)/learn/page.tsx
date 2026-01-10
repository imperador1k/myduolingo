import { redirect } from "next/navigation";
import Link from "next/link";
import { getUnits, getUserProgress, getCourses } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Crown, Star, Check, Lock, ChevronRight, Heart } from "lucide-react";

// Lesson Node Component
type LessonNodeProps = {
    id: number;
    index: number;
    totalCount: number;
    completed: boolean;
    current: boolean;
    locked: boolean;
    noHearts: boolean;
};

const LessonNode = ({ id, index, totalCount, completed, current, locked, noHearts }: LessonNodeProps) => {
    // Zigzag positioning
    const positions = ["center", "left", "center", "right", "center"];
    const position = positions[index % 5];

    const positionClasses = {
        left: "-translate-x-12",
        center: "",
        right: "translate-x-12",
    };

    const getNodeStyles = () => {
        if (noHearts && (current || completed)) {
            return "bg-rose-400 border-rose-500 border-b-4 text-white";
        }
        if (current) {
            return "bg-green-500 border-green-600 border-b-4 text-white shadow-lg scale-110";
        }
        if (completed) {
            return "bg-green-500 border-green-600 border-b-4 text-white";
        }
        return "bg-slate-200 border-slate-300 border-b-4 text-slate-400";
    };

    const getIcon = () => {
        if (noHearts && (current || completed)) return <Heart className="h-6 w-6" />;
        if (current) return <Star className="h-8 w-8 fill-white" />;
        if (completed) return <Check className="h-8 w-8" />;
        return <Lock className="h-6 w-6" />;
    };

    const isAccessible = (current || completed) && !noHearts;

    return (
        <div className={cn("flex justify-center", positionClasses[position as keyof typeof positionClasses])}>
            <Link
                href={isAccessible ? `/lesson?id=${id}` : noHearts ? "/shop" : "#"}
                className={cn(
                    "relative flex items-center justify-center",
                    locked && "cursor-not-allowed"
                )}
            >
                {/* Glow effect for current */}
                {current && (
                    <div className="absolute h-20 w-20 animate-ping rounded-full bg-green-500 opacity-20" />
                )}

                {/* START label */}
                {current && (
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

// Unit Header Component
const UnitHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="flex items-center justify-between rounded-xl bg-green-500 p-4 text-white">
        <div>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm opacity-90">{description}</p>
        </div>
        <Button
            variant="ghost"
            className="bg-white/20 text-white hover:bg-white/30"
            size="sm"
        >
            <ChevronRight className="h-5 w-5" />
        </Button>
    </div>
);

// Sidebar stats
const SidebarStats = ({ points, hearts, streak }: { points: number; hearts: number; streak: number }) => (
    <div className="hidden lg:block lg:w-80">
        <div className="sticky top-6 space-y-4">
            {/* Streak Card */}
            <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-400 to-orange-500 p-4 text-white">
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span className="text-3xl font-bold">{streak}</span>
                </div>
                <p className="text-sm opacity-90">
                    {streak === 0 ? "Começa a tua streak hoje!" : streak === 1 ? "1 dia de streak!" : `${streak} dias de streak!`}
                </p>
            </div>

            {/* Stats */}
            <div className="rounded-xl border-2 p-4">
                <h3 className="mb-4 font-bold text-slate-700">Os Teus Stats</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">⭐ XP Total</span>
                        <span className="font-bold text-amber-500">{points}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">❤️ Corações</span>
                        <span className="font-bold text-rose-500">{hearts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600">🔥 Streak</span>
                        <span className="font-bold text-orange-500">{streak}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default async function LearnPage() {
    const userProgress = await getUserProgress();
    const units = await getUnits();
    const courses = await getCourses();

    // If no user progress, redirect to courses to select one
    if (!userProgress || !userProgress.activeCourseId) {
        redirect("/courses");
    }

    const activeCourse = courses.find(c => c.id === userProgress.activeCourseId);

    return (
        <div className="flex gap-8">
            {/* Main Content - Lesson Map */}
            <div className="flex-1">
                {/* Course Header */}
                <div className="mb-6 flex items-center gap-4">
                    <span className="text-2xl">🇵🇹</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-500">
                            {activeCourse?.title || "Português"}
                        </span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="flex items-center gap-1 text-amber-500">
                            <span className="text-lg">⚡</span>
                            <span className="font-bold">{userProgress.points}</span>
                        </div>
                        <div className="flex items-center gap-1 text-rose-500">
                            <span className="text-lg">❤️</span>
                            <span className="font-bold">{userProgress.hearts}</span>
                        </div>
                    </div>
                </div>

                {/* Units */}
                <div className="space-y-8">
                    {(() => {
                        // Track first incomplete across ALL units
                        let firstIncompleteFound = false;

                        return units.map((unit, unitIndex) => {
                            const lessonsWithStatus = unit.lessons.map((lesson, lessonIndex) => {
                                const isCompleted = lesson.completed;
                                let isCurrent = false;
                                let isLocked = false;

                                if (isCompleted) {
                                    // Lesson is completed - show checkmark
                                    isCurrent = false;
                                    isLocked = false;
                                } else if (!firstIncompleteFound) {
                                    // First incomplete lesson - this is current
                                    isCurrent = true;
                                    firstIncompleteFound = true;
                                } else {
                                    // Not completed and not first incomplete - locked
                                    isLocked = true;
                                }

                                return { ...lesson, isCurrent, isLocked };
                            });

                            return (
                                <div key={unit.id}>
                                    {/* Unit Header */}
                                    <UnitHeader title={unit.title} description={unit.description} />

                                    {/* Lesson Path */}
                                    <div className="py-8">
                                        {/* Lessons */}
                                        <div className="flex flex-col gap-6">
                                            {lessonsWithStatus.map((lesson, index) => (
                                                <LessonNode
                                                    key={lesson.id}
                                                    id={lesson.id}
                                                    index={index}
                                                    totalCount={lessonsWithStatus.length}
                                                    completed={lesson.completed}
                                                    current={lesson.isCurrent}
                                                    locked={lesson.isLocked}
                                                    noHearts={userProgress.hearts === 0}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>

                {/* Empty state if no units */}
                {units.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-6xl">📚</span>
                        <h2 className="mt-4 text-xl font-bold text-slate-700">
                            Ainda não há lições disponíveis
                        </h2>
                        <p className="text-slate-500">
                            Seleciona um curso para começar a aprender!
                        </p>
                        <Link href="/courses" className="mt-4">
                            <Button variant="primary">Ver Cursos</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <SidebarStats points={userProgress.points} hearts={userProgress.hearts} streak={userProgress.streak || 0} />
        </div>
    );
}
