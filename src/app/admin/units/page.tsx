import { db } from "@/db/drizzle";
import { Layers } from "lucide-react";
import { DeleteUnitButton } from "@/components/admin/delete-unit-button";
import Link from "next/link";

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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-sky-500 p-3 rounded-2xl border-2 border-transparent border-b-[4px] border-b-sky-600 shadow-sm relative">
                        <Layers className="w-8 h-8 text-white drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Gestão de Unidades</h1>
                        <p className="text-slate-500 font-bold text-sm tracking-wide">
                            {unitsData.length} UNIDADE{unitsData.length !== 1 ? "S" : ""} ENCONTRADA{unitsData.length !== 1 ? "S" : ""}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input 
                            type="text" 
                            placeholder="Procurar unidade..." 
                            className="w-full bg-white border-2 border-stone-200 border-b-[4px] rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-sky-400 focus:border-b-sky-500 transition-colors placeholder:text-stone-400 placeholder:font-bold"
                            disabled
                        />
                    </div>
                    <button className="hidden sm:flex items-center justify-center px-4 py-3 bg-stone-100 text-stone-500 font-black text-sm tracking-widest uppercase rounded-2xl border-2 border-transparent border-b-[4px] border-b-stone-200 hover:translate-y-[2px] hover:border-b-[2px] active:translate-y-[4px] active:border-b-0 transition-all cursor-pointer">
                        Exportar
                    </button>
                    <Link href="/admin/units/new" className="flex items-center justify-center px-6 py-3 bg-[#58CC02] text-white font-black text-sm tracking-widest uppercase rounded-2xl border-2 border-transparent border-b-[6px] border-b-[#46a302] hover:translate-y-[2px] hover:border-b-[4px] active:translate-y-[6px] active:border-b-0 transition-all cursor-pointer shadow-sm">
                        Nova Unidade
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border-2 border-stone-200 border-b-[8px] overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50 border-b-2 border-stone-200 text-[11px] uppercase tracking-[0.2em] text-stone-400 font-black">
                                <th className="px-6 py-5 w-20">ID</th>
                                <th className="px-6 py-5">Título da Unidade</th>
                                <th className="px-6 py-5">Curso</th>
                                <th className="px-6 py-5 text-center">Lições</th>
                                <th className="px-6 py-5 text-center">Ordem</th>
                                <th className="px-6 py-5 text-right w-32">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-stone-100">
                            {unitsData.map((unit) => (
                                <tr key={unit.id} className="hover:bg-stone-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <span className="inline-block px-3 py-1.5 bg-amber-100 text-amber-700 font-black rounded-lg border-2 border-transparent border-b-[4px] border-b-amber-200 text-xs shadow-sm">
                                            #{unit.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-black text-slate-700">{unit.title}</span>
                                            <span className="text-xs font-bold text-stone-400 truncate max-w-[200px]">{unit.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1.5 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 border-transparent border-b-[3px] border-b-sky-200 shadow-sm">
                                            {unit.course?.title ?? "—"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-sm font-black text-stone-500">
                                            {unit.lessons.length}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-500 font-black rounded-lg border-2 border-transparent border-b-[4px] border-b-indigo-200 text-xs shadow-sm">
                                            {unit.order}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-50 lg:group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/units/${unit.id}/edit`} className="p-2 bg-stone-100 text-stone-500 rounded-xl border-2 border-transparent border-b-[4px] border-b-stone-200 hover:-translate-y-1 hover:border-b-[6px] active:translate-y-1 active:border-b-[2px] transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                            </Link>
                                            <div className="scale-90 origin-right">
                                                <DeleteUnitButton unitId={unit.id} unitTitle={unit.title} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {unitsData.length === 0 && (
                    <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
                        <div className="bg-stone-100 p-6 rounded-[24px] border-b-[6px] border-stone-200">
                            <Layers className="w-10 h-10 text-stone-300" />
                        </div>
                        <div>
                            <p className="text-slate-600 font-black text-xl uppercase tracking-tight">Nenhuma unidade encontrada</p>
                            <p className="text-stone-400 text-sm mt-2 font-bold max-w-sm mx-auto">A data ledger está vazia. Começa por criar uma nova unidade para povoares o mundo de jogo.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Mock */}
            <div className="flex items-center justify-between mt-4 mb-12">
                <span className="text-xs font-black text-stone-400 uppercase tracking-widest px-2">Página 1 de 1</span>
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center bg-white text-stone-400 font-black rounded-xl border-2 border-stone-200 border-b-[4px] hover:-translate-y-1 hover:border-b-[6px] active:translate-y-1 active:border-b-[2px] transition-all cursor-not-allowed opacity-50">
                        {"<"}
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center bg-[#1CB0F6] text-white font-black rounded-xl border-2 border-transparent border-b-[4px] border-b-[#0092d6] shadow-sm">
                        1
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center bg-white text-stone-400 font-black rounded-xl border-2 border-stone-200 border-b-[4px] hover:-translate-y-1 hover:border-b-[6px] active:translate-y-1 active:border-b-[2px] transition-all cursor-not-allowed opacity-50">
                        {">"}
                    </button>
                </div>
            </div>
        </div>
    );
}
