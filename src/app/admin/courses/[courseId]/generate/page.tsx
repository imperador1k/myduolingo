import { db } from "@/db/drizzle";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AIGeneratorForm } from "@/components/admin/ai-generator-form";
import { Sparkles } from "lucide-react";
import Image from "next/image";

type Props = {
    params: {
        courseId: string;
    };
};

export default async function GenerateCoursePage({ params }: Props) {
    const courseId = parseInt(params.courseId);

    if (isNaN(courseId)) {
        redirect("/admin/courses");
    }

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));

    if (!course) {
        redirect("/admin/courses");
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-3 rounded-xl border border-violet-500/20">
                    <Sparkles className="w-6 h-6 text-violet-500" />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gerador de Conteúdo IA</h1>
                    <p className="text-slate-500 font-medium">
                        A gerar para: <span className="font-bold text-slate-700">{course.title}</span> ({course.language})
                    </p>
                </div>
                {course.imageSrc && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-200 relative shrink-0">
                        <Image src={course.imageSrc} alt={course.title} fill className="object-contain p-1" />
                    </div>
                )}
            </div>

            <AIGeneratorForm courseId={course.id} targetLang={course.language} />
        </div>
    );
}
