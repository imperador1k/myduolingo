import { db } from "@/db/drizzle";
import { Layers } from "lucide-react";
import { DeleteUnitButton } from "@/components/admin/delete-unit-button";

export const dynamic = "force-dynamic";

export default async function AdminUnitsPage() {
    const unitsData = await db.query.units.findMany({
        with: {
            course: true,
            lessons: true,
        },
        orderBy: (units, { asc }) => [asc(units.id)],
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                        <Layers className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Unidades</h1>
                        <p className="text-slate-500 font-medium">
                            {unitsData.length} unidade{unitsData.length !== 1 ? "s" : ""} registada{unitsData.length !== 1 ? "s" : ""} no sistema.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b-2 border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                                <th className="px-6 py-4 w-16">ID</th>
                                <th className="px-6 py-4">Título da Unidade</th>
                                <th className="px-6 py-4">Curso</th>
                                <th className="px-6 py-4 text-center">Lições</th>
                                <th className="px-6 py-4 text-center">Ordem</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {unitsData.map((unit) => (
                                <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-400">#{unit.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-700">{unit.title}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{unit.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-sky-100">
                                            {unit.course?.title ?? "—"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-bold text-slate-500">
                                            {unit.lessons.length}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-bold text-slate-400">{unit.order}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <DeleteUnitButton unitId={unit.id} unitTitle={unit.title} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {unitsData.length === 0 && (
                    <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
                        <div className="bg-slate-100 p-4 rounded-full">
                            <Layers className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-slate-600 font-bold text-lg">Nenhuma unidade encontrada</p>
                            <p className="text-slate-400 text-sm mt-1">A base de dados não contém unidades neste momento.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
