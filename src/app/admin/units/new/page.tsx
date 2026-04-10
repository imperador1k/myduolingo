import { db } from "@/db/drizzle";
import { UnitForm } from "@/components/admin/unit-form";
import { Layers } from "lucide-react";

export default async function NewUnitPage() {
    const availableCourses = await db.query.courses.findMany({
        columns: {
            id: true,
            title: true,
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="bg-[#58CC02]/10 p-3 rounded-xl border border-[#58CC02]/20 shadow-sm border-b-4 border-b-[#58CC02]/20">
                    <Layers className="w-6 h-6 text-[#58CC02]" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Criar Unidade</h1>
                    <p className="text-slate-500 font-medium">Expande o teu mundo criando um novo módulo de aprendizagem.</p>
                </div>
            </div>

            <UnitForm courses={availableCourses} />
        </div>
    );
}
