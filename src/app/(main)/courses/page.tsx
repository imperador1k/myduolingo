import { getCourses, getUserProgress } from "@/db/queries";
import { CoursesList } from "./courses-list";
import { BookOpen, Flame, Target, Trophy } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
    const courses = await getCourses();
    const userProgress = await getUserProgress();

    const activeCourse = courses.find(c => c.id === userProgress?.activeCourseId);

    return (
        <div className="pb-12 px-4 lg:px-0">
            {/* Hero Header */}
            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 p-6 lg:p-8 text-white">
                {/* Decorative elements */}
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="h-8 w-8" />
                        <h1 className="text-2xl lg:text-3xl font-bold">Cursos de Idiomas</h1>
                    </div>
                    <p className="text-white/80 text-sm lg:text-base max-w-md">
                        Escolhe o idioma que queres dominar. Cada jornada de mil léguas começa com um único passo.
                    </p>
                </div>
            </div>

            {/* Active Course Card (if any) */}
            {userProgress?.activeCourseId && activeCourse && (
                <div className="mb-8">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        O Teu Curso Ativo
                    </h2>
                    <Link href="/learn">
                        <div className="group relative overflow-hidden rounded-2xl border-2 border-green-400 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-5 transition-all hover:shadow-lg hover:shadow-green-500/20">
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex items-center gap-4">
                                <div className="flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-2xl bg-white shadow-lg text-4xl lg:text-5xl">
                                    🇵🇹
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">
                                        Continuar a Aprender
                                    </p>
                                    <h2 className="text-xl lg:text-2xl font-bold text-slate-700">
                                        {activeCourse.title}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Trophy className="h-4 w-4" />
                                            <span className="text-sm font-bold">{userProgress.points} XP</span>
                                        </div>
                                        {userProgress.streak && userProgress.streak > 0 && (
                                            <div className="flex items-center gap-1 text-orange-500">
                                                <Flame className="h-4 w-4" />
                                                <span className="text-sm font-bold">{userProgress.streak} dias</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <Target className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* All Courses Grid */}
            <div className="mb-8">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {courses.length > 0 ? "Todos os Cursos" : "Nenhum curso disponível"}
                </h2>

                <CoursesList
                    courses={courses}
                    activeCourseId={userProgress?.activeCourseId || undefined}
                />
            </div>

            {/* Coming Soon */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center">
                <div className="absolute -right-4 -top-4 text-8xl opacity-10">🚀</div>
                <div className="relative">
                    <p className="text-xl font-bold text-slate-500 mb-2">🚀 Mais idiomas em breve!</p>
                    <p className="text-sm text-slate-400">
                        Espanhol, Francês, Italiano, Alemão, Japonês...
                    </p>
                    <div className="flex justify-center gap-3 mt-4 text-2xl">
                        <span className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">🇪🇸</span>
                        <span className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">🇫🇷</span>
                        <span className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">🇮🇹</span>
                        <span className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">🇩🇪</span>
                        <span className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">🇯🇵</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
