import { db } from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { LessonForm } from "@/components/admin/lesson-form";
import { Dumbbell } from "lucide-react";

type Props = {
    params: {
        lessonId: string;
    };
};

export default async function EditLessonPage({ params }: Props) {
    const lessonId = parseInt(params.lessonId);

    if (isNaN(lessonId)) {
        redirect("/admin/lessons");
    }

    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));

    if (!lesson) {
        redirect("/admin/lessons");
    }

    const availableUnits = await db.query.units.findMany({
        columns: {
            id: true,
            title: true,
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 shadow-sm border-b-4 border-b-indigo-500/20">
                    <Dumbbell className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Editar Lição</h1>
                    <p className="text-slate-500 font-medium">A modificar dados do desafio pedagógico.</p>
                </div>
            </div>

            <LessonForm initialData={lesson} units={availableUnits} />
        </div>
    );
}
