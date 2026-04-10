"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveUnitAction } from "@/actions/admin-units";
import { Save, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface UnitFormProps {
    initialData?: {
        id: number;
        title: string;
        description: string;
        courseId: number;
        order: number;
    };
    courses: {
        id: number;
        title: string;
    }[];
}

export function UnitForm({ initialData, courses }: UnitFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        if (initialData) {
            formData.append("id", initialData.id.toString());
        }

        startTransition(() => {
            saveUnitAction(formData)
                .catch((error) => {
                    toast.error(error.message || "Oops! Ocorreu um erro ao guardar.");
                });
        });
    };

    return (
        <form action={handleSubmit} className="bg-white border-2 border-stone-200 border-b-8 rounded-[24px] p-8 shadow-sm max-w-2xl">
            <div className="space-y-6">
                
                <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-stone-500 tracking-wider ml-1">Título da Unidade</label>
                    <input 
                        type="text" 
                        name="title" 
                        required 
                        defaultValue={initialData?.title} 
                        placeholder="Ex: Introdução ao Espanhol"
                        className="w-full bg-stone-50 border-2 border-stone-200 border-b-4 rounded-xl p-4 text-stone-800 font-bold focus:outline-none focus:border-sky-400 focus:bg-white transition-all text-lg"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black uppercase text-stone-500 tracking-wider ml-1">Descrição</label>
                    <textarea 
                        name="description" 
                        required 
                        rows={3}
                        defaultValue={initialData?.description} 
                        placeholder="Aprende sobre cumprimentos iniciais e as cores básicas..."
                        className="w-full bg-stone-50 border-2 border-stone-200 border-b-4 rounded-xl p-4 text-stone-600 font-bold focus:outline-none focus:border-sky-400 focus:bg-white transition-all resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase text-stone-500 tracking-wider ml-1">Ordem da Tabela</label>
                        <input 
                            type="number" 
                            name="order" 
                            required 
                            min={1}
                            defaultValue={initialData?.order || 1} 
                            className="w-full bg-stone-50 border-2 border-stone-200 border-b-4 rounded-xl p-4 text-stone-800 font-bold focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase text-stone-500 tracking-wider ml-1">Curso Dedicado</label>
                        <div className="relative">
                            <select 
                                name="courseId" 
                                required 
                                defaultValue={initialData?.courseId}
                                className="w-full bg-stone-50 border-2 border-stone-200 border-b-4 rounded-xl p-4 text-stone-800 font-bold focus:outline-none focus:border-sky-400 focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Selecionar Curso...</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
                                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex border-t-2 border-stone-100 pt-6 gap-4 justify-end">
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isPending}
                    className="px-6 py-4 rounded-2xl font-black tracking-widest uppercase text-stone-500 hover:bg-stone-100 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-[#58CC02] text-white px-8 py-4 rounded-2xl border-2 border-transparent border-b-[6px] border-b-[#46a302] hover:bg-[#68e003] hover:-translate-y-1 hover:border-b-[8px] active:translate-y-2 active:border-b-0 font-black tracking-widest uppercase transition-all flex items-center gap-3 disabled:opacity-50 shadow-sm"
                >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Guardar
                </button>
            </div>
        </form>
    );
}
