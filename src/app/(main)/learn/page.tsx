import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUnits, getUserProgress, getCourses } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { ChevronRight, Notebook } from "lucide-react";
import { LessonMap } from "@/components/lesson-map";

// Unit Header Component
const UnitHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-green-400 to-emerald-500 p-6 text-white shadow-lg shadow-green-500/30 mb-8 border-b-4 border-emerald-600 top-4 z-10 sticky">
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Notebook className="h-6 w-6 text-white" />
            </div>
            <div>
                <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">{title}</h2>
                <p className="text-sm font-medium opacity-90 mt-1">{description}</p>
            </div>
        </div>
        <Button
            variant="ghost"
            className="bg-white/20 text-white hover:bg-white/30 rounded-xl"
            size="lg"
        >
            <ChevronRight className="h-6 w-6" />
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

                {/* Motivational Mascot */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 sm:mb-16 pt-4 animate-in fade-in zoom-in-95 duration-700">
                    <div className="relative animate-[bounce_4s_ease-in-out_infinite]">
                        <Image 
                            src="/duolingo-home.png" 
                            alt="Mascot" 
                            width={220} 
                            height={220} 
                            className="w-40 sm:w-52 drop-shadow-2xl rounded-3xl"
                        />
                    </div>
                    {/* Speech Bubble */}
                    <div className="relative bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-lg max-w-[250px] text-center sm:text-left">
                        <p className="text-lg font-black text-slate-700 tracking-tight leading-tight">Vamos aprender! 🚀</p>
                        <p className="text-sm font-medium text-slate-500 mt-1">Pronto para dominar o mundo hoje?</p>
                        
                        {/* Desktop Arrow (Left) */}
                        <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 bg-white border-l-2 border-b-2 border-slate-200 rotate-45 hidden sm:block shadow-[-4px_4px_4px_-2px_rgba(0,0,0,0.05)]" />
                        {/* Mobile Arrow (Top) */}
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-l-2 border-t-2 border-slate-200 rotate-45 sm:hidden shadow-[-4px_-4px_4px_-2px_rgba(0,0,0,0.05)]" />
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
