import { db } from "@/db/drizzle";
import { units, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { UnitForm } from "@/components/admin/unit-form";
import { Layers } from "lucide-react";

type Props = {
    params: {
        unitId: string;
    };
};

export default async function EditUnitPage({ params }: Props) {
    const unitId = parseInt(params.unitId);

    if (isNaN(unitId)) {
        redirect("/admin/units");
    }

    const [unit] = await db.select().from(units).where(eq(units.id, unitId));

    if (!unit) {
        redirect("/admin/units");
    }

    const availableCourses = await db.query.courses.findMany({
        columns: {
            id: true,
            title: true,
        },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20 shadow-sm border-b-4 border-b-sky-500/20">
                    <Layers className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Editar Unidade</h1>
                    <p className="text-slate-500 font-medium">A modificar dados vitais da estrutura curricular.</p>
                </div>
            </div>

            <UnitForm initialData={unit} courses={availableCourses} />
        </div>
    );
}
