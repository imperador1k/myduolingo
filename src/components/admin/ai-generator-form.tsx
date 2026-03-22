"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateCourseContent } from "@/actions/ai-generator";
import { AI_TOPICS, CEFR_LEVELS } from "@/lib/ai-topics";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type Props = {
    courseId: number;
    targetLang: string;
};

export const AIGeneratorForm = ({ courseId, targetLang }: Props) => {
    const router = useRouter();
    const [topicId, setTopicId] = useState(1);
    const [level, setLevel] = useState("A2_B1");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadingMessages = [
        "A Coruja está a pensar... 🦉",
        "A gerar lições com Inteligência Artificial...",
        "Isto pode demorar 15-30 segundos.",
        "A construir desafios épicos...",
    ];
    const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setLoadingMsgIdx(0);

        toast.loading("A Coruja está a pensar... Isto pode demorar.", { id: "generating" });

        // Cycle through loading messages
        const interval = setInterval(() => {
            setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
        }, 4000);

        try {
            await generateCourseContent(courseId, targetLang, topicId, level);
            toast.dismiss("generating");
            toast.success("✨ Sucesso! Unidades, lições e desafios gerados com IA.", { duration: 5000 });
            
            // Redirect after showing the toast
            setTimeout(() => {
                router.push("/admin/courses");
            }, 1500);
        } catch (err: any) {
            console.error(err);
            toast.dismiss("generating");
            toast.error("Oops! Algo correu mal ao gerar as lições. Tenta de novo.");
            setError(err?.message || "Erro ao gerar conteúdo. Tenta novamente.");
            setLoading(false);
        } finally {
            clearInterval(interval);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 flex flex-col gap-6">
                {/* Topic */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="topic" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tema / Tópico
                    </label>
                    <select
                        id="topic"
                        value={topicId}
                        onChange={(e) => setTopicId(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer"
                    >
                        {AI_TOPICS.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                [{String(topic.id).padStart(2, "0")}] {topic.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Foco: {AI_TOPICS.find((t) => t.id === topicId)?.focus}
                    </p>
                </div>

                {/* Level */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="level" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Nível CEFR
                    </label>
                    <select
                        id="level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full max-w-[320px] px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all cursor-pointer"
                    >
                        {CEFR_LEVELS.map((lvl) => (
                            <option key={lvl.value} value={lvl.value}>
                                {lvl.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Info Card */}
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
                    <div className="text-sm text-violet-700">
                        <p className="font-bold">O que vai ser gerado:</p>
                        <p className="text-violet-600 mt-1">1 Unidade → 3 Lições → 4-5 Desafios cada (SELECT, INSERT, MATCH, DICTATION) com opções e explicações pedagógicas.</p>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col items-center gap-3 animate-pulse">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                        <p className="text-amber-700 font-black text-lg">{loadingMessages[loadingMsgIdx]}</p>
                        <p className="text-amber-500 text-xs font-medium">Gemini 2.5 Flash • Não feches esta página.</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                        <p className="text-rose-700 text-sm font-bold">{error}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-violet-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            A gerar...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Gerar Conteúdo com IA
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};
