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

export default async function LearnPage() {
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
            
            {/* V3 Living Background */}
            <LivingBackground />
            
            <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-[48px] px-4 lg:px-6 pb-6 w-full max-w-[1056px] mx-auto z-10 relative">
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

                    {/* Atmospheric Bottom Fade Overlay */}
                    <div className="fixed bottom-0 left-0 lg:left-[88px] right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-40 flex items-end justify-center pb-6">
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
                    isPro={isPro}
                />
            </div>
        </>
    );
}
