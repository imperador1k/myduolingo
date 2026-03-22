import { getCourses, getUserProgress } from "@/db/queries";
import { CoursesList } from "./courses-list";
import { BookOpen, Flame, Target, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { BroomLottie } from "@/components/ui/lottie-animation";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
    const courses = await getCourses();
    const userProgress = await getUserProgress();

    const activeCourse = courses.find(c => c.id === userProgress?.activeCourseId);

    return (
        <div className="pb-12 px-4 lg:px-0 max-w-[1056px] mx-auto pt-6 space-y-10">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 lg:p-12 text-white shadow-xl shadow-purple-500/30 ring-1 ring-white/20">
                {/* Decorative Elements */}
                <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute right-12 bottom-4 text-7xl opacity-20 transform rotate-12 drop-shadow-lg">
                    ðŸŒ
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <BookOpen className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm"> Cursos de Idiomas </h1>
                    </div>
                    <p className="text-white/90 text-sm lg:text-base max-w-lg font-medium leading-relaxed">
                        Escolhe o idioma que queres dominar. Uma jornada inteiramente gamificada e adaptativa espera por ti.
                    </p>
                </div>
            </div>

            {/* Active Course Card (if any) */}
            {userProgress?.activeCourseId && activeCourse && (
                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        O Teu Percurso
                    </h2>
                    <Link href="/learn" className="block w-full">
                        <div className="group relative overflow-hidden rounded-2xl border-none ring-4 ring-green-400/50 bg-gradient-to-br from-green-50 to-emerald-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.3)] cursor-pointer">
                            
                            {/* Animated Background Mesh */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-300/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Active Pulse Badge */}
                            <div className="absolute -right-12 top-6 rotate-45 bg-amber-400 text-white font-black text-[10px] uppercase tracking-widest py-1 px-12 shadow-md flex items-center gap-1">
                                <span className="animate-pulse flex items-center gap-1 shadow-amber-400">
                                    <Sparkles className="h-3 w-3" />Em Foco
                                </span>
                            </div>

                            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10">
                                {/* Course Image or Flag */}
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl text-5xl shrink-0 border-2 border-white overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
                                    {activeCourse.imageSrc && activeCourse.imageSrc.startsWith("http") ? (
                                        <img src={activeCourse.imageSrc} alt={activeCourse.title} className="w-full h-full object-cover" />
                                    ) : (
                                        "🌟" // Generic active star or flag
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                                        Continuar a Aprender
                                    </p>
                                    <h2 className="text-2xl font-extrabold text-slate-800 drop-shadow-sm">
                                        {activeCourse.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                        <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-white/40 shadow-sm text-amber-500">
                                            <Trophy className="h-4 w-4 fill-amber-500" />
                                            <span className="text-sm font-bold tracking-tight">{userProgress.points} XP Totais</span>
                                        </div>
                                        {userProgress.streak && userProgress.streak > 0 && (
                                            <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-white/40 shadow-sm text-orange-500">
                                                <Flame className="h-4 w-4 fill-orange-500" />
                                                <span className="text-sm font-bold tracking-tight">{userProgress.streak} Dias de Ofensiva</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-4 sm:mt-0 ml-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/40 group-hover:scale-110 transition-transform">
                                    <Target className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* All Courses Grid */}
            <div className="flex flex-col gap-3">
                <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-2">
                    <BookOpen className="h-4 w-4" />
                    {courses.length > 0 ? "Catálogo" : "Nenhum curso disponível"}
                </h2>

                <CoursesList
                    courses={courses}
                    activeCourseId={userProgress?.activeCourseId || undefined}
                />
            </div>

            {/* Coming Soon Section */}
            <div className="w-full flex flex-col items-center justify-center mt-16 pb-12 opacity-80">
                <div className="w-32 h-32 mb-2 relative">
                    <BroomLottie className="w-full h-full drop-shadow-sm" />
                </div>
                <h3 className="text-xl font-bold text-slate-500 mt-4">Estamos a preparar mais idiomas!</h3>
                <p className="text-sm text-slate-400 mt-2 text-center max-w-md">
                    Espanhol, Francês, Italiano, Alemão, Japonês e muitos mais estão a ser limados nos nossos estúdios.
                </p>
                <div className="flex justify-center gap-3 mt-4 text-2xl">
                    <span className="opacity-50 transition-opacity">🇪🇸</span>
                    <span className="opacity-50 transition-opacity">🇫🇷</span>
                    <span className="opacity-50 transition-opacity">🇮🇹</span>
                    <span className="opacity-50 transition-opacity">🇩🇪</span>
                    <span className="opacity-50 transition-opacity">🇯🇵</span>
                </div>
            </div>
        </div>
    );
}

