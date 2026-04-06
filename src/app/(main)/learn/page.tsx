import { redirect } from "next/navigation";
import { UnitSearchModal } from "@/components/modals/unit-search-modal";
import Link from "next/link";
import Image from "next/image";
import { getUnits, getUserProgress, getCourses } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { Heart, Target, BookOpen, Zap, Trophy, ChevronRight } from "lucide-react";
import { CatLottie } from "@/components/ui/lottie-animation";
import { UnitIslandFeed } from "@/components/learn/unit-island-feed";
import { cn } from "@/lib/utils";

// Desktop Sidebar - Premium Light Dashboard
const DesktopSidebar = ({
    points, hearts, streak, activeCourse, progressPct, completedLessons, totalLessons,
}: {
    points: number; hearts: number; streak: number;
    activeCourse?: { title: string; imageSrc?: string | null };
    progressPct: number; completedLessons: number; totalLessons: number;
}) => {
    const dailyGoal = 200;
    const todayXp = points % dailyGoal;
    const xpDashOffset = ((dailyGoal - todayXp) / dailyGoal) * 283; // 2 * pi * 45 = 282.7

    return (
        <div className="w-full lg:w-[368px] relative lg:sticky lg:top-6 lg:self-start z-10 font-sans">
            <div className="bg-white rounded-[32px] border-2 border-slate-200 border-b-[8px] p-6 shadow-xl flex flex-col gap-6 w-full text-slate-700 relative overflow-hidden">
                
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-0 opacity-50" />
                
                {/* Header / Brand */}
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
                        <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">O Teu Progresso</h2>
                    </div>
                </div>

                {/* ── Visual Metrics Grid ── */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    
                    {/* Ring XP Widget */}
                    <div className="col-span-1 bg-white rounded-[24px] border-2 border-amber-200 border-b-[6px] shadow-sm flex flex-col items-center justify-center p-5 relative group hover:border-b-[4px] hover:translate-y-[2px] active:translate-y-[6px] active:border-b-0 transition-all cursor-default overflow-hidden">
                        <div className="absolute inset-0 bg-amber-50 opacity-50" />
                        <div className="relative w-20 h-20 flex items-center justify-center mb-1">
                            {/* Background track */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-sm">
                                <circle cx="40" cy="40" r="34" className="fill-none stroke-amber-200/50 stroke-[6]" />
                                {/* Progress track */}
                                <circle 
                                    cx="40" 
                                    cy="40" 
                                    r="34" 
                                    className="fill-none stroke-amber-400 stroke-[6] transition-all duration-1000 ease-out drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]" 
                                    strokeDasharray="214" // 2 * pi * 34 = 213.6
                                    strokeDashoffset={((dailyGoal - todayXp) / dailyGoal) * 214}
                                    strokeLinecap="round" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-black text-xl tracking-tighter text-amber-500">{todayXp}</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-amber-500" /> XP Diário
                            </span>
                        </div>
                    </div>

                    {/* Streak & Hearts Column */}
                    <div className="col-span-1 flex flex-col gap-4">
                        {/* Streak Box */}
                        <div className="flex-1 bg-white rounded-[20px] border-2 border-orange-200 border-b-[6px] p-3 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            {streak > 0 && <div className="absolute inset-0 bg-orange-50 opacity-50 transition-colors" />}
                            <div className="relative z-10 flex items-center justify-between px-1">
                                <p className="font-black text-2xl tracking-tighter text-orange-500">{streak}</p>
                                <span className={cn("text-2xl drop-shadow-sm", streak > 0 ? "animate-pulse origin-bottom" : "grayscale opacity-50")}>
                                    {streak > 0 ? "🔥" : "💤"}
                                </span>
                            </div>
                            <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-orange-400 mt-1 px-1">Série</span>
                        </div>

                        {/* Hearts Box */}
                        <div className="flex-1 bg-white rounded-[20px] border-2 border-rose-200 border-b-[6px] p-3 flex flex-col justify-center relative group hover:-translate-y-1 transition-transform overflow-hidden">
                            <div className="absolute inset-0 bg-rose-50 opacity-50" />
                            <div className="relative z-10 flex items-center justify-between px-1">
                                <p className="font-black text-2xl tracking-tighter text-rose-500">{hearts}</p>
                                <Heart className={cn("w-6 h-6", hearts > 0 ? "text-rose-500 fill-rose-500 group-hover:scale-110 group-hover:animate-pulse transition-all drop-shadow-sm" : "text-slate-300")} />
                            </div>
                             <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-rose-400 mt-1 px-1">Vidas</span>
                        </div>
                    </div>
                </div>

                {/* Active Course Module */}
                {activeCourse && (
                    <div className="bg-white rounded-[24px] border-2 border-slate-200 border-b-[6px] p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform relative z-10 shadow-sm">
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-[18px] w-14 h-14 shrink-0 flex items-center justify-center p-2 shadow-inner">
                             {activeCourse.imageSrc
                                ? <Image src={activeCourse.imageSrc} alt={activeCourse.title} width={40} height={40} className="w-full h-full object-cover" />
                                : <span className="text-2xl drop-shadow-sm">🌍</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="truncate">{activeCourse.title}</span>
                                <span className="text-emerald-500">{progressPct}%</span>
                            </div>
                            {/* Thick tactile progress bar */}
                            <div className="h-4 w-full bg-slate-100 rounded-full border-2 border-slate-200 overflow-hidden relative shadow-inner">
                                <div className="absolute inset-y-0 left-0 bg-emerald-400 transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }}>
                                    {/* Light highlight string for 3D effect */}
                                    <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Portal */}
                <Link href="/leaderboard" className="block w-full relative z-10">
                    <div className="bg-indigo-50 rounded-[24px] border-2 border-indigo-200 border-b-[6px] p-4 flex items-center gap-4 hover:-translate-y-1 active:border-b-[2px] active:translate-y-[4px] transition-all group">
                        <div className="bg-white border-2 border-indigo-200 rounded-[18px] w-12 h-12 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                            <Trophy className="w-6 h-6 text-indigo-400 group-hover:text-indigo-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 font-sans">
                            <h3 className="font-black text-sm uppercase tracking-wider text-indigo-500 leading-tight">Leaderboard</h3>
                            <p className="text-xs font-bold text-indigo-400 opacity-80 mt-0.5">Defende a tua glória</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-indigo-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" strokeWidth={3} />
                    </div>
                </Link>

                {/* Mock Admin / Elite Stats removed completely per user request */}

            </div>
        </div>
    );
};

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

    const searchableUnits = processedUnits.map(u => ({
        id: u.id,
        title: u.title,
        order: u.order
    }));

    return (
        <>
            <UnitSearchModal units={searchableUnits} />
            
            {/* V2 Abstract Ambient Backgrounds */}
            <div className="absolute bg-shape w-[1000px] h-[1000px] -top-[200px] -left-[200px] opacity-70 -z-10 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute bg-shape w-[800px] h-[800px] bottom-[-200px] right-[-100px] opacity-50 -z-10 pointer-events-none mix-blend-overlay"></div>
            
            <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-[48px] px-4 lg:px-6 pb-6 w-full max-w-[1056px] mx-auto z-10 relative">
                {/* ── Main Column (The Feed/Island World) ── */}
                <div className="flex-1 w-full relative overflow-x-hidden pb-0 mt-8">
                    <div className="flex flex-col gap-8 lg:gap-12 items-center w-full">


                        {/* ── Units Winding World Path ── */}
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

                    {/* Atmospheric Bottom Fade Overlay */}
                    <div className="fixed bottom-0 left-0 lg:left-[88px] right-0 h-48 bg-gradient-to-t from-[#f3f6f8] via-[#f3f6f8]/90 to-transparent pointer-events-none z-40 flex items-end justify-center pb-6">
                        <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white/50 shadow-sm flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Pressiona</span>
                            <kbd className="px-2 py-1 bg-white border-2 border-slate-200 border-b-4 rounded-lg text-xs font-black text-slate-500">CTRL</kbd>
                            <span className="text-xs font-bold text-slate-400">+</span>
                            <kbd className="px-2 py-1 bg-white border-2 border-slate-200 border-b-4 rounded-lg text-xs font-black text-slate-500">M</kbd>
                            <span className="text-xs font-bold text-slate-400 ml-1">Para Navegar</span>
                        </div>
                    </div>
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
