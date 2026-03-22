import { db } from "@/db/drizzle";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";
import { Edit } from "lucide-react";

type Props = {
    params: {
        courseId: string;
    };
};

export default async function EditCoursePage({ params }: Props) {
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
                <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
                    <Edit className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Editar Curso</h1>
                    <p className="text-slate-500 font-medium">A editar: <span className="font-bold text-slate-700">{course.title}</span></p>
                </div>
            </div>

            <CourseForm initialData={course} />
        </div>
    );
}
