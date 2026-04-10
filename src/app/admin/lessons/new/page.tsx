import { db } from "@/db/drizzle";
import { LessonForm } from "@/components/admin/lesson-form";
import { Dumbbell } from "lucide-react";

export default async function NewLessonPage() {
    const availableUnits = await db.query.units.findMany({
        columns: {
            id: true,
            title: true,
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="bg-[#58CC02]/10 p-3 rounded-xl border border-[#58CC02]/20 shadow-sm border-b-4 border-b-[#58CC02]/20">
                    <Dumbbell className="w-6 h-6 text-[#58CC02]" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Criar Lição Manual</h1>
                    <p className="text-slate-500 font-medium">Injeta uma nova lição cirúrgica na tua árvore pedagógica.</p>
                </div>
            </div>

            <LessonForm units={availableUnits} />
        </div>
    );
}
