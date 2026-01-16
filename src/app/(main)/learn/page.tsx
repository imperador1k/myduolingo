import { redirect } from "next/navigation";
import Link from "next/link";
import { getUnits, getUserProgress, getCourses } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { LessonMap } from "@/components/lesson-map";

// Unit Header Component
const UnitHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="flex items-center justify-between rounded-xl bg-green-500 p-3 lg:p-5 text-white">
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

export const dynamic = "force-dynamic";

export default async function LearnPage() {
    const userProgress = await getUserProgress();
    const units = await getUnits();
    const courses = await getCourses();

    // If no user progress, redirect to courses to select one
    if (!userProgress || !userProgress.activeCourseId) {
        redirect("/courses");
    }

    const activeCourse = courses.find(c => c.id === userProgress.activeCourseId);

    // Prepare units data with challenges for the client component
    const unitsWithChallenges = units.map(unit => ({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        lessons: unit.lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            completed: lesson.completed,
            challenges: lesson.challenges?.map(c => ({
                id: c.id,
                challengeProgress: c.challengeProgress,
            })) || [],
        })),
    }));

    return (
        <div className="flex gap-8">
            {/* Main Content - Lesson Map */}
            <div className="flex-1">
                {/* Course Header */}
                <div className="mb-6 items-center gap-4 hidden lg:flex">
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

                {/* Units with Lesson Map */}
                <div className="space-y-8">
                    {units.map((unit, unitIndex) => (
                        <div key={unit.id}>
                            <UnitHeader title={unit.title} description={unit.description} />
                            <LessonMap
                                units={[{
                                    ...unitsWithChallenges[unitIndex],
                                }]}
                                noHearts={userProgress.hearts === 0}
                            />
                        </div>
                    ))}
                </div>

                {/* End of journey marker */}
                {units.length > 0 && (
                    <div className="flex items-center justify-center gap-4 py-12 mt-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">🏆</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Continua a aprender
                            </span>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                    </div>
                )}

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
