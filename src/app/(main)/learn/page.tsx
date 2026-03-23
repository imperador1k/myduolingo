import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUnits, getUserProgress, getCourses } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { Heart, Target, BookOpen, Zap, Trophy, ChevronRight } from "lucide-react";
import { CatLottie } from "@/components/ui/lottie-animation";
import { UnitIslandFeed } from "@/components/learn/unit-island-feed";

// Desktop Sidebar
const DesktopSidebar = ({
    points, hearts, streak, activeCourse, progressPct, completedLessons, totalLessons,
}: {
    points: number; hearts: number; streak: number;
    activeCourse?: { title: string; imageSrc?: string | null };
    progressPct: number; completedLessons: number; totalLessons: number;
}) => (
    <div className="w-full lg:w-[368px] relative lg:sticky lg:top-6 lg:self-start flex flex-col gap-4 z-10">
        {/* Active course */}
        {activeCourse && (
            <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Curso Activo</p>
                <div className="flex items-center gap-3">
                    {activeCourse.imageSrc
                        ? <Image src={activeCourse.imageSrc} alt={activeCourse.title} width={40} height={40} className="rounded-xl object-cover shrink-0" />
                        : <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl shrink-0">🌍</div>}
                    <div className="min-w-0">
                        <p className="font-bold text-slate-700 truncate">{activeCourse.title}</p>
                        <p className="text-xs text-slate-400">{progressPct}% completo</p>
                    </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{completedLessons}/{totalLessons} lições</p>
            </div>
        )}

        {/* Streak */}
        <div className={`rounded-2xl p-5 text-white shadow-md border-b-4 ${streak > 0 ? "bg-gradient-to-br from-orange-400 to-red-500 border-red-600" : "bg-gradient-to-br from-slate-300 to-slate-400 border-slate-500"}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">🔥 Streak</p>
                    <p className="text-5xl font-black tracking-tighter">{streak}</p>
                    <p className="text-sm opacity-80 mt-1">{streak === 0 ? "Começa hoje!" : streak === 1 ? "Que arranque!" : "dias seguidos"}</p>
                </div>
                <span className="text-5xl opacity-25 select-none">{streak > 0 ? "🔥" : "💤"}</span>
            </div>
            {streak > 0 && (
                <div className="mt-3 bg-white/20 rounded-full h-1.5">
                    <div className="bg-white rounded-full h-full" style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }} />
                </div>
            )}
        </div>

        {/* XP + Hearts grid */}
        <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 flex flex-col items-center gap-1">
                <Zap className="h-6 w-6 text-amber-500 fill-amber-400" />
                <span className="text-2xl font-black text-amber-600">{points.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Total XP</span>
            </div>
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 flex flex-col items-center gap-1">
                <Heart className={`h-6 w-6 ${hearts > 0 ? "text-rose-500 fill-rose-400" : "text-slate-300"}`} />
                <span className={`text-2xl font-black ${hearts > 0 ? "text-rose-600" : "text-slate-400"}`}>{hearts}</span>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">Corações</span>
            </div>
        </div>

        {/* Daily goal */}
        <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-sky-500" />
                    <span className="font-bold text-sky-700 text-sm">Meta Diária</span>
                </div>
                <span className="text-xs font-bold text-sky-400">{Math.min(points % 200, 200)}/200 XP</span>
            </div>
            <div className="w-full bg-sky-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((points % 200 / 200) * 100, 100)}%` }} />
            </div>
        </div>

        {/* Leaderboard */}
        <Link href="/leaderboard">
            <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 flex items-center gap-3 hover:border-amber-300 hover:bg-amber-50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 text-sm">Leaderboard</p>
                    <p className="text-xs text-slate-400">Ver a tua posição</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-400 transition-colors shrink-0" />
            </div>
        </Link>
    </div>
);

export const dynamic = "force-dynamic";

export default async function LearnPage() {
    const userProgress = await getUserProgress();
    const units = await getUnits();
    const courses = await getCourses();

    if (!userProgress || !userProgress.activeCourseId) redirect("/courses");
    if (!units || units.length === 0) redirect("/courses");

    const activeCourse = courses.find(c => c.id === userProgress.activeCourseId);
    
    // Process units to determine exact node states globally (current vs completed vs locked)
    let foundCurrent = false;
    const processedUnits = units.map(unit => {
        const processedLessons = unit.lessons.map((lesson) => {
            const isCompleted = lesson.completed;
            const isCurrent = !isCompleted && !foundCurrent;
            if (isCurrent) foundCurrent = true;
            
            return {
                id: lesson.id,
                title: lesson.title,
                completed: isCompleted,
                isCurrent,
                isLocked: !isCompleted && !isCurrent
            };
        });
        
        return {
            ...unit,
            lessons: processedLessons,
            isCompleted: processedLessons.every(l => l.completed),
            isActive: processedLessons.some(l => l.isCurrent),
        };
    });

    const totalLessons = units.reduce((s, u) => s + u.lessons.length, 0);
    const completedLessons = units.reduce((s, u) => s + u.lessons.filter(l => l.completed).length, 0);
    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const streak = userProgress.streak || 0;

    return (
        <>
            {/* V2 Abstract Ambient Backgrounds */}
            <div className="absolute bg-shape w-[800px] h-[800px] -top-[200px] -left-[200px] opacity-60 -z-10 pointer-events-none"></div>
            <div className="absolute bg-shape w-[600px] h-[600px] bottom-[-200px] right-[-100px] opacity-40 -z-10 pointer-events-none"></div>
            
            <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-[48px] px-4 lg:px-6 pb-28 lg:pb-8 w-full max-w-[1056px] mx-auto">
                {/* ── Main Column ── */}
                <div className="flex-1 w-full flex flex-col gap-4 lg:gap-6 items-center">

                    {/* Mascot Hero */}
                    <div className="flex flex-row items-center gap-4 bg-white shadow-sm rounded-3xl p-4 border border-gray-100 w-full max-w-[600px] relative z-20">
                        <div className="relative shrink-0">
                            <CatLottie className="w-16 sm:w-20" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-black text-slate-700 leading-tight">
                                {completedLessons === 0 ? "Pronto para começar? 🚀" : completedLessons === totalLessons ? "Lendário! 💪" : "Mantém a chama acesa! 🔥"}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {progressPct}% de domínio alcançado
                            </p>
                        </div>
                    </div>

                    {/* ── Units V2 Floating Path ── */}
                    <UnitIslandFeed 
                        processedUnits={processedUnits}
                        noHearts={userProgress.hearts === 0} 
                    />

                    {processedUnits.length === 0 && (
                         <div className="flex flex-col items-center justify-center py-16 text-center">
                             <span className="text-5xl mb-4">📚</span>
                             <h2 className="text-xl font-bold text-slate-700 mb-2">Ainda não há lições</h2>
                             <p className="text-slate-500 mb-6 text-sm">Seleciona um curso para começar!</p>
                             <Link href="/courses"><Button variant="primary">Ver Cursos</Button></Link>
                         </div>
                    )}
                </div>

                {/* ── Desktop Sidebar ── */}
                <DesktopSidebar
                    points={userProgress.points}
                    hearts={userProgress.hearts}
                    streak={streak}
                    activeCourse={activeCourse}
                    progressPct={progressPct}
                    completedLessons={completedLessons}
                    totalLessons={totalLessons}
                />
            </div>
        </>
    );
}
