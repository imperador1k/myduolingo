import { getCourses, getUserProgress } from "@/db/queries";
import { CoursesList } from "./courses-list";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
    const courses = await getCourses();
    const userProgress = await getUserProgress();

    return (
        <div className="pb-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-700">Cursos de Idiomas</h1>
                <p className="text-slate-500">Escolhe o idioma que queres aprender</p>
            </div>

            {/* Active Course (if any) */}
            {userProgress?.activeCourseId && (
                <div className="mb-8 rounded-xl border-2 border-green-500 bg-green-50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl">🇵🇹</span>
                            <div>
                                <p className="text-sm font-bold text-green-600">CURSO ATIVO</p>
                                <h2 className="text-xl font-bold text-slate-700">
                                    {courses.find(c => c.id === userProgress.activeCourseId)?.title || "Português"}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {userProgress.points} XP
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* All Courses Grid */}
            <h2 className="mb-4 text-lg font-bold text-slate-600">
                {courses.length > 0 ? "Cursos Disponíveis" : "Nenhum curso disponível"}
            </h2>

            <CoursesList
                courses={courses}
                activeCourseId={userProgress?.activeCourseId || undefined}
            />

            {/* Coming Soon */}
            <div className="mt-8 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center">
                <p className="text-lg font-bold text-slate-400">🚀 Mais idiomas em breve!</p>
                <p className="text-sm text-slate-400">Espanhol, Francês, Italiano...</p>
            </div>
        </div>
    );
}
