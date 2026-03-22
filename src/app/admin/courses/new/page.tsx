import { CourseForm } from "@/components/admin/course-form";
import { Plus } from "lucide-react";

export default function NewCoursePage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <Plus className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Novo Curso</h1>
                    <p className="text-slate-500 font-medium">Preenche os campos abaixo para criar um novo curso na plataforma.</p>
                </div>
            </div>

            <CourseForm />
        </div>
    );
}
