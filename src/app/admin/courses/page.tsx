import { db } from "@/db/drizzle";
import Image from "next/image";
import Link from "next/link";
import { Edit, Plus, BookOpen, Sparkles } from "lucide-react";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
    // Fetch courses from DB
    const courses = await db.query.courses.findMany({
        orderBy: (courses, { asc }) => [asc(courses.id)],
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
                        <BookOpen className="w-6 h-6 text-sky-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Cursos Disponíveis</h1>
                        <p className="text-slate-500 font-medium">Gere os idiomas e currículos da plataforma.</p>
                    </div>
                </div>
                <Link href="/admin/courses/new" className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95">
                    <Plus className="w-5 h-5" />
                    Novo Curso
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b-2 border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                <th className="px-6 py-4 w-16">ID</th>
                                <th className="px-6 py-4 w-20">Idioma</th>
                                <th className="px-6 py-4">Detalhes do Curso</th>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-5 text-sm font-bold text-slate-400">#{course.id}</td>
                                    <td className="px-6 py-5">
                                        <div className="w-12 h-12 relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-2 shadow-sm shrink-0">
                                            <Image
                                                src={course.imageSrc}
                                                alt={course.title}
                                                fill
                                                className="object-contain drop-shadow-sm"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-base font-black text-slate-700">{course.title}</div>
                                        <div className="text-xs font-medium text-slate-400 mt-0.5">{course.language}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                            {course.languageCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/courses/${course.id}/generate`} className="p-2 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2 px-3 border border-amber-200" title="Gerar conteúdo IA">
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-xs font-bold hidden xl:block">Gerar IA</span>
                                            </Link>
                                            <Link href={`/admin/courses/${course.id}/edit`} className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors" title="Editar curso">
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {courses.length === 0 && (
                    <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
                        <div className="bg-slate-100 p-4 rounded-full">
                            <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-slate-600 font-bold text-lg">Nenhum curso encontrado</p>
                            <p className="text-slate-400 text-sm mt-1">A base de dados não contém cursos neste momento.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
