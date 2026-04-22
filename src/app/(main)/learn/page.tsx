import { Suspense } from "react";
import { redirect } from "next/navigation";
import { UnitSearchModal } from "@/components/modals/unit-search-modal";
import Link from "next/link";
import { getUnits, getUserProgress, getCourses } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { UnitIslandFeed } from "@/components/learn/unit-island-feed";
import { DesktopSidebar } from "@/components/learn/desktop-sidebar";
import { LivingBackground } from "@/components/learn/living-background";
import { checkSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default function LearnPage() {
    return (
        <>
            {/* V3 Living Background (Synchronous) */}
            <LivingBackground />
            
            <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-[48px] px-4 lg:px-6 pb-6 w-full max-w-[1056px] mx-auto z-10 relative">
                <Suspense fallback={<LearnSkeleton />}>
                    <LearnData />
                </Suspense>
            </div>

            {/* Atmospheric Bottom Fade Overlay (Synchronous) */}
            <div className="fixed bottom-0 left-0 lg:left-[88px] right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-40 flex items-end justify-center pb-6">
                <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white/50 shadow-sm flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Pressiona</span>
                    <kbd className="px-2 py-1 bg-white border-2 border-slate-200 border-b-4 rounded-lg text-xs font-black text-slate-500">CTRL</kbd>
                    <span className="text-xs font-bold text-slate-400">+</span>
                    <kbd className="px-2 py-1 bg-white border-2 border-slate-200 border-b-4 rounded-lg text-xs font-black text-slate-500">M</kbd>
                    <span className="text-xs font-bold text-slate-400 ml-1">Para Navegar</span>
                </div>
            </div>
        </>
    );
}

// --- ASYNC SERVER COMPONENT FOR DATA FETCHING ---
async function LearnData() {
    const userProgress = await getUserProgress();
    const units = await getUnits();
    const courses = await getCourses();
    const isPro = await checkSubscription();

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
                isLocked: !isCompleted && !isCurrent,
                challenges: lesson.challenges
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
            
            {/* ── Main Column (The Feed/Island World) ── */}
            <div className="flex-1 w-full relative pb-0 mt-8">
                <div className="flex flex-col gap-8 lg:gap-12 items-center w-full">
                    {/* ── Units Winding World Path ── */}
                    <UnitIslandFeed 
                        processedUnits={processedUnits}
                        noHearts={userProgress.hearts === 0} 
                    />

                    {processedUnits.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="text-5xl mb-4">📚</span>
                            <h2 className="text-xl font-bold text-slate-700 mb-2">Ainda não há lições</h2>
                            <p className="text-slate-500 mb-6 text-sm">Seleciona um curso para começar!</p>
                            <Link href="/courses"><Button variant="primary">Ver Cursos</Button></Link>
                        </div>
                    )}
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
                isPro={isPro}
            />
        </>
    );
}

// --- SKELETON FALLBACK ---
const LearnSkeleton = () => {
    return (
        <>
            {/* Main Column Skeleton */}
            <div className="flex-1 w-full relative pb-0 mt-8 animate-in fade-in duration-500">
                <div className="flex flex-col gap-8 lg:gap-12 items-center w-full">
                    <div className="w-full flex flex-col items-center gap-6">
                        {/* Unit Banner Skeleton */}
                        <div className="w-full max-w-[500px] h-24 bg-emerald-100 rounded-3xl border-2 border-emerald-200 border-b-[6px] animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
                        </div>
                        
                        {/* Nodes Skeleton - Winding path */}
                        <div className="flex flex-col items-center gap-8 mt-6">
                            <div className="w-[72px] h-[72px] rounded-full bg-stone-200 animate-pulse border-b-[8px] border-stone-300 relative left-0"></div>
                            <div className="w-[72px] h-[72px] rounded-full bg-stone-200 animate-pulse border-b-[8px] border-stone-300 relative left-10"></div>
                            {/* Current Active Node (Larger, Crown) */}
                            <div className="w-[90px] h-[90px] rounded-full bg-emerald-200 animate-pulse border-b-[10px] border-emerald-300 relative left-16"></div>
                            <div className="w-[72px] h-[72px] rounded-full bg-stone-200 animate-pulse border-b-[8px] border-stone-300 relative left-10"></div>
                            <div className="w-[72px] h-[72px] rounded-full bg-stone-200 animate-pulse border-b-[8px] border-stone-300 relative left-0"></div>
                        </div>
                        
                        {/* Next Unit Banner Skeleton */}
                        <div className="w-full max-w-[500px] h-24 bg-indigo-100 rounded-3xl border-2 border-indigo-200 border-b-[6px] animate-pulse mt-8"></div>
                    </div>
                </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="w-full lg:w-[368px] relative lg:sticky lg:top-6 lg:self-start z-10 font-sans animate-in fade-in duration-500">
                <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border-2 border-slate-200 border-b-[8px] p-6 shadow-xl flex flex-col gap-6 w-full relative overflow-hidden">
                    {/* Header */}
                    <div className="h-4 w-32 bg-slate-200 rounded-full animate-pulse mb-2"></div>
                    
                    {/* Visual Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Ring XP Widget Skeleton */}
                        <div className="col-span-1 bg-amber-50 rounded-[24px] border-2 border-amber-100 border-b-[6px] h-40 animate-pulse flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-[6px] border-amber-200/50"></div>
                        </div>
                        
                        {/* Streak & Hearts Column */}
                        <div className="col-span-1 flex flex-col gap-4">
                            <div className="flex-1 bg-orange-50 rounded-[20px] border-2 border-orange-100 border-b-[6px] h-[72px] animate-pulse"></div>
                            <div className="flex-1 bg-rose-50 rounded-[20px] border-2 border-rose-100 border-b-[6px] h-[72px] animate-pulse"></div>
                        </div>
                    </div>
                    
                    {/* Active Course Module Skeleton */}
                    <div className="bg-slate-50 rounded-[24px] border-2 border-slate-200 border-b-[6px] h-24 animate-pulse flex items-center gap-4 p-4">
                         <div className="w-14 h-14 bg-slate-200 rounded-[18px] shrink-0"></div>
                         <div className="flex-1 flex flex-col gap-2">
                             <div className="h-3 w-16 bg-slate-200 rounded-full"></div>
                             <div className="h-4 w-full bg-emerald-100 rounded-full"></div>
                         </div>
                    </div>
                    
                    {/* Leaderboard Portal Skeleton */}
                    <div className="bg-indigo-50 rounded-[24px] border-2 border-indigo-100 border-b-[6px] h-20 animate-pulse flex items-center gap-4 p-4">
                         <div className="w-12 h-12 bg-indigo-100 rounded-[18px] shrink-0"></div>
                         <div className="flex-1 flex flex-col gap-2">
                             <div className="h-4 w-24 bg-indigo-200 rounded-full"></div>
                             <div className="h-3 w-32 bg-indigo-100 rounded-full"></div>
                         </div>
                    </div>
                </div>
            </div>
        </>
    );
};
