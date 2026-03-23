import { getCourses, getUserProgress } from "@/db/queries";
import { CoursesList } from "./courses-list";
import { BookOpen, Flame, Target, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
    const courses = await getCourses();
    const userProgress = await getUserProgress();

    const activeCourse = courses.find(c => c.id === userProgress?.activeCourseId);

    return (
        <div className="pb-12 px-4 lg:px-0 max-w-[1056px] mx-auto pt-6 space-y-10">
            {/* Minimalist Premium Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-sky-500" />
                    Catálogo de Cursos
                </h1>
                <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
                    Escolhe um curso e começa a tua jornada de aprendizagem hoje mesmo.
                </p>
            </div>

            {/* Active Course Card (if any) */}
            {userProgress?.activeCourseId && activeCourse && (
                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        O Teu Percurso
                    </h2>
                    <Link href="/learn" className="block w-full">
                        <div className="group relative overflow-hidden rounded-3xl border-2 border-slate-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl cursor-pointer">
                            
                            {/* Animated Background Mesh */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Active Pulse Badge */}
                            <div className="absolute -right-12 top-6 rotate-45 bg-sky-500 text-white font-black text-[10px] uppercase tracking-widest py-1 px-12 shadow-md flex items-center gap-1">
                                <span className="animate-pulse flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />Em Foco
                                </span>
                            </div>

                            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10">
                                {/* Course Image or Flag */}
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 shadow-sm shrink-0 border-2 border-slate-100 overflow-hidden transform group-hover:scale-105 transition-transform duration-300 relative">
                                    {activeCourse.imageSrc && activeCourse.imageSrc.startsWith("http") ? (
                                        <Image src={activeCourse.imageSrc} alt={activeCourse.title} fill className="object-cover" />
                                    ) : activeCourse.imageSrc ? (
                                        <Image src={activeCourse.imageSrc} alt={activeCourse.title} width={60} height={60} className="object-cover drop-shadow-md" />
                                    ) : (
                                        <span className="text-4xl">🌟</span>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1">
                                        Continuar a Aprender
                                    </p>
                                    <h2 className="text-2xl font-extrabold text-slate-800 drop-shadow-sm">
                                        {activeCourse.title}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 text-amber-500">
                                            <Trophy className="h-4 w-4 fill-amber-500" />
                                            <span className="text-sm font-bold tracking-tight">{userProgress.points} XP Totais</span>
                                        </div>
                                        {userProgress.streak && userProgress.streak > 0 && (
                                            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 text-orange-500">
                                                <Flame className="h-4 w-4 fill-orange-500" />
                                                <span className="text-sm font-bold tracking-tight">{userProgress.streak} Dias de Ofensiva</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-4 sm:mt-0 ml-auto h-12 w-12 flex items-center justify-center rounded-full bg-sky-500 text-white shadow-md shadow-sky-500/20 group-hover:scale-110 group-hover:bg-sky-400 transition-transform">
                                    <Target className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* All Courses Grid */}
            <div className="flex flex-col gap-3">
                <CoursesList
                    courses={courses}
                    activeCourseId={userProgress?.activeCourseId || undefined}
                />
            </div>
        </div>
    );
}

