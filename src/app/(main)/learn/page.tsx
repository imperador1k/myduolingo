import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getUnits, getUserProgress, getCourses } from "@/db/queries";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trophy, Zap, Heart, Target, BookOpen } from "lucide-react";
import { LessonMap } from "@/components/lesson-map";
import { CatLottie } from "@/components/lottie-animation";

// ─── Unit Header ────────────────────────────────────────────────────────────
const GRADIENTS = [
    "from-emerald-500 to-teal-600 border-emerald-700",
    "from-violet-500 to-purple-600 border-purple-700",
    "from-amber-500 to-orange-500 border-orange-600",
    "from-rose-500 to-pink-600 border-pink-700",
    "from-sky-500 to-blue-600 border-blue-700",
];

const UnitHeader = ({ title, description, index }: { title: string; description: string; index: number }) => (
    <div className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${GRADIENTS[index % GRADIENTS.length]} p-4 text-white shadow-md border-b-4 mb-4`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-75">Unidade {index + 1}</p>
            <h2 className="text-base font-black leading-tight truncate">{title}</h2>
            <p className="text-xs opacity-75 truncate">{description}</p>
        </div>
    </div>
);

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────
const DesktopSidebar = ({
    points, hearts, streak, activeCourse, progressPct, completedLessons, totalLessons,
}: {
    points: number; hearts: number; streak: number;
    activeCourse?: { title: string; imageSrc?: string | null };
    progressPct: number; completedLessons: number; totalLessons: number;
}) => (
    <div className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 gap-4 sticky top-6 self-start">
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



// ─── Page ─────────────────────────────────────────────────────────────────────
export const dynamic = "force-dynamic";

export default async function LearnPage() {
    const userProgress = await getUserProgress();
    const units = await getUnits();
    const courses = await getCourses();

    if (!userProgress || !userProgress.activeCourseId) redirect("/courses");

    const activeCourse = courses.find(c => c.id === userProgress.activeCourseId);
    const unitsWithChallenges = units.map(unit => ({
        id: unit.id, title: unit.title, description: unit.description,
        lessons: unit.lessons.map(lesson => ({
            id: lesson.id, title: lesson.title, completed: lesson.completed,
            challenges: lesson.challenges?.map(c => ({ id: c.id, challengeProgress: c.challengeProgress })) || [],
        })),
    }));
    const totalLessons = units.reduce((s, u) => s + u.lessons.length, 0);
    const completedLessons = units.reduce((s, u) => s + u.lessons.filter(l => l.completed).length, 0);
    const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const streak = userProgress.streak || 0;

    return (
        <>


            <div className="flex gap-6 xl:gap-8 pb-28 lg:pb-8">
                {/* ── Main Column ── */}
                <div className="flex-1 min-w-0">

                    {/* Mobile course header pill */}
                    <div className="lg:hidden mb-5 flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
                        {activeCourse?.imageSrc
                            ? <Image src={activeCourse.imageSrc} alt={activeCourse.title || ""} width={36} height={36} className="rounded-xl object-cover shrink-0" />
                            : <span className="text-2xl shrink-0">🌍</span>}
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-700 text-sm truncate">{activeCourse?.title || "Curso"}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${progressPct}%` }} />
                                </div>
                                <span className="text-xs font-black text-green-600 shrink-0">{progressPct}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop progress bar */}
                    <div className="hidden lg:block mb-6">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-slate-400">{completedLessons}/{totalLessons} lições completas</span>
                            <span className="text-sm font-black text-green-600">{progressPct}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>

                    {/* ── Mascot Hero — compact horizontal row on mobile ── */}
                    <div className="flex flex-row items-center gap-4 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-4 border border-green-100">
                        {/* Mascot — Cat Lottie animation */}
                        <div className="relative shrink-0">
                            <CatLottie className="w-20 sm:w-28 lg:w-32" />
                        </div>
                        {/* Speech bubble — inline on all sizes */}
                        <div className="flex-1 min-w-0">
                            <p className="text-base sm:text-lg font-black text-slate-800 leading-tight">
                                {completedLessons === 0 ? "Vamos começar! 🚀" : completedLessons === totalLessons ? "Parabéns! 🏆" : "Continua assim! 💪"}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                {completedLessons === 0
                                    ? "Escolhe a tua primeira lição abaixo"
                                    : `${totalLessons - completedLessons} lições por completar`}
                            </p>
                            {completedLessons > 0 && totalLessons > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-green-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${progressPct}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-green-600 shrink-0">{progressPct}%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Units ── */}
                    <div className="space-y-10">
                        {units.map((unit, unitIndex) => (
                            <div key={unit.id}>
                                <UnitHeader title={unit.title} description={unit.description} index={unitIndex} />
                                <LessonMap
                                    units={[{ ...unitsWithChallenges[unitIndex] }]}
                                    noHearts={userProgress.hearts === 0}
                                />
                            </div>
                        ))}
                    </div>

                    {/* End marker */}
                    {units.length > 0 && (
                        <div className="flex items-center justify-center gap-3 py-14 mt-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-3xl">🏆</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Continua a aprender</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                        </div>
                    )}

                    {/* Empty */}
                    {units.length === 0 && (
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
