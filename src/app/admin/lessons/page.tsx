import { db } from "@/db/drizzle";
import Link from "next/link";
import { Dumbbell, Sparkles } from "lucide-react";
import { DeleteLessonButton } from "@/components/admin/delete-lesson-button";

export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
    const lessonsData = await db.query.lessons.findMany({
        with: {
            unit: {
                with: {
                    course: true,
                },
            },
        },
        orderBy: (lessons, { asc }) => [asc(lessons.id)],
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                        <Dumbbell className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Lições & Desafios</h1>
                        <p className="text-slate-500 font-medium">
                            {lessonsData.length} lição{lessonsData.length !== 1 ? "ões" : ""} registada{lessonsData.length !== 1 ? "s" : ""} no sistema.
                        </p>
                    </div>
                </div>
                <Link href="/admin/courses" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95">
                    <Sparkles className="w-5 h-5" />
                    <span className="hidden sm:inline">Gerar Novas Lições (IA)</span>
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b-2 border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                <th className="px-6 py-4 w-16">ID</th>
                                <th className="px-6 py-4">Título da Lição</th>
                                <th className="px-6 py-4">Unidade</th>
                                <th className="px-6 py-4">Curso</th>
                                <th className="px-6 py-4 text-center">Ordem</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lessonsData.map((lesson) => (
                                <tr key={lesson.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-400">#{lesson.id}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-slate-700">{lesson.title}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                            {lesson.unit?.title ?? "—"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-sky-100">
                                            {lesson.unit?.course?.title ?? "—"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-bold text-slate-400">{lesson.order}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <DeleteLessonButton lessonId={lesson.id} lessonTitle={lesson.title} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {lessonsData.length === 0 && (
                    <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
                        <div className="bg-slate-100 p-4 rounded-full">
                            <Dumbbell className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-slate-600 font-bold text-lg">Nenhuma lição encontrada</p>
                            <p className="text-slate-400 text-sm mt-1">A base de dados não contém lições neste momento.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
