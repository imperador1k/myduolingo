import { Suspense } from "react";
import { Dumbbell, Mic, PenTool, BookOpen, Headphones, HeartPulse, Bot, History, Sparkles, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserProgress } from "@/db/queries";
import { checkSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default function PracticePage() {
    return (
        <div className="flex flex-col gap-8 px-4 sm:px-6 py-8 max-w-[1056px] mx-auto w-full">
            {/* ── Header (Synchronous) ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-stone-200 pb-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl border-b-4 border-indigo-200 flex items-center justify-center shrink-0">
                        <Bot className="w-7 h-7 text-indigo-500" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-stone-700">Área de Prática AI</h1>
                        <p className="text-stone-500 font-medium mt-0.5">
                            Melhora o teu Português com a IA.
                        </p>
                    </div>
                </div>
                <Link href="/practice/history">
                    <Button variant="ghost" className="text-stone-400 hover:text-stone-600 font-bold tracking-wide uppercase">
                        <History className="w-5 h-5 mr-2" />
                        Ver Histórico
                    </Button>
                </Link>
            </div>

            <Suspense fallback={<PracticeSkeleton />}>
                <PracticeData />
            </Suspense>
        </div>
    );
}

async function PracticeData() {
    const userProgress = await getUserProgress();
    const hasFullHearts = userProgress?.hearts === 5;
    const isPro = await checkSubscription();

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* ── Clínica de Corações ── */}
            <div>
                {hasFullHearts ? (
                    <div className="bg-white rounded-xl border-2 border-stone-200 border-b-8 p-10 flex flex-col items-center text-center space-y-4 opacity-50 grayscale">
                        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center shadow-inner">
                            <HeartPulse className="h-10 w-10 text-rose-300" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-stone-400">Clínica de Corações</h3>
                            <p className="mt-2 font-medium text-stone-400 max-w-sm mx-auto">
                                Tens as vidas no máximo! Volta aqui quando precisares de recuperar corações.
                            </p>
                        </div>
                    </div>
                ) : (
                    <Link href="/lesson?clinic=true">
                        <div className="bg-white rounded-xl border-2 border-stone-200 border-b-8 p-10 flex flex-col items-center text-center space-y-4 transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50 cursor-pointer">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center border-b-4 border-red-200">
                                <HeartPulse className="h-10 w-10 text-red-500 animate-pulse" strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-stone-700">Clínica de Corações</h3>
                                <p className="mt-2 font-medium text-stone-500 max-w-sm mx-auto">
                                    Recupera vidas a rever os exercícios que erraste recentemente.
                                </p>
                            </div>
                            <div className="pt-2">
                                <span className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest border-b-4 border-red-600">
                                    Praticar para ganhar +1 ❤️
                                </span>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* ── 2x2 Skills Grid & Conversação Fluída OR Paywall ── */}
            {isPro ? (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Writing Card */}
                        <Link href="/practice/writing" className="group text-left bg-white rounded-xl border-2 border-stone-200 border-b-8 p-8 flex gap-6 items-start transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 bg-[#1cb0f6] border-[#1899d6] shrink-0 group-hover:-translate-y-1 transition-transform">
                                <PenTool className="h-8 w-8 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-stone-700">Escrita</h3>
                                <p className="mt-2 text-stone-500 font-medium leading-relaxed">
                                    Recebe um tema e escreve um texto. A AI vai corrigir a tua gramática e ortografia.
                                </p>
                            </div>
                        </Link>

                        {/* Speaking Card */}
                        <Link href="/practice/speaking" className="group text-left bg-white rounded-xl border-2 border-stone-200 border-b-8 p-8 flex gap-6 items-start transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 bg-[#ff4b4b] border-[#ea2b2b] shrink-0 group-hover:-translate-y-1 transition-transform">
                                <Mic className="h-8 w-8 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-stone-700">Fala</h3>
                                <p className="mt-2 text-stone-500 font-medium leading-relaxed">
                                    Recebe uma pergunta e responde falando. A AI vai analisar a tua resposta e dar dicas.
                                </p>
                            </div>
                        </Link>

                        {/* Reading Card */}
                        <Link href="/practice/reading" className="group text-left bg-white rounded-xl border-2 border-stone-200 border-b-8 p-8 flex gap-6 items-start transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 bg-[#58cc02] border-[#46a302] shrink-0 group-hover:-translate-y-1 transition-transform">
                                <BookOpen className="h-8 w-8 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-stone-700">Leitura</h3>
                                <p className="mt-2 text-stone-500 font-medium leading-relaxed">
                                    Lê um texto gerado pela AI e debate sobre o tema. Melhora a tua compreensão.
                                </p>
                            </div>
                        </Link>

                        {/* Listening Card */}
                        <Link href="/practice/listening" className="group text-left bg-white rounded-xl border-2 border-stone-200 border-b-8 p-8 flex gap-6 items-start transition-all active:translate-y-1 active:border-b-4 hover:bg-stone-50">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center border-b-4 bg-[#ce82ff] border-[#a552c9] shrink-0 group-hover:-translate-y-1 transition-transform">
                                <Headphones className="h-8 w-8 text-white" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-stone-700">Escuta</h3>
                                <p className="mt-2 text-stone-500 font-medium leading-relaxed">
                                    Ouve um áudio gerado pela AI e analisa o conteúdo. Treina o teu ouvido.
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* ── Novidade: Conversação Fluída ── */}
                    <div className="bg-stone-100 rounded-3xl p-8 sm:p-12 relative border-2 border-stone-200 overflow-hidden flex flex-col md:flex-row items-center gap-8 mt-4">
                        <div className="flex-1 text-center md:text-left z-10">
                            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-xl font-bold text-sm mb-4 uppercase tracking-wider">
                                <Sparkles className="w-4 h-4" /> Novidade
                            </div>
                            <h3 className="text-3xl font-black text-stone-800 mb-3">
                                Pratica Conversação Fluída
                            </h3>
                            <p className="text-stone-500 font-medium text-lg max-w-md mb-8">
                                Simula conversas do dia a dia com a nossa Inteligência Artificial por voz, sem interrupções.
                            </p>
                            <Link href="/practice/conversation">
                                <span className="inline-block bg-[#58cc02] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest border-b-8 border-[#46a302] active:border-b-4 active:translate-y-1 transition-all hover:bg-[#61da02]">
                                    COMEÇAR AGORA
                                </span>
                            </Link>
                        </div>
                        {/* Decorative background element replacing image */}
                        <div className="w-48 h-48 md:w-64 md:h-64 bg-indigo-200 rounded-full opacity-20 absolute -right-10 -bottom-10 blur-3xl pointer-events-none"></div>
                        <div className="hidden md:flex w-48 h-48 shrink-0 bg-white rounded-[2rem] border-4 border-stone-200 shadow-xl items-center justify-center rotate-6 relative z-10">
                            <div className="absolute inset-0 flex items-center justify-center gap-2">
                                <div className="w-4 h-12 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-4 h-20 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-4 h-16 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                <div className="w-4 h-8 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }}></div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-stone-200 border-b-8 flex flex-col items-center text-center mt-4">
                    <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6 shadow-inner border-b-4 border-stone-200">
                        <Lock className="w-12 h-12 text-stone-400" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-black text-stone-700 mb-4">Prática com IA Bloqueada</h3>
                    <p className="text-stone-500 font-medium text-lg max-w-lg mb-8">
                        Eleva o teu nível com o plano MyDuolingo PRO e acede à nossa Inteligência Artificial sem limites.
                    </p>
                    <Link href="/shop" className="w-full sm:w-auto">
                        <span className="inline-block bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest border-b-8 border-indigo-600 active:border-b-4 active:translate-y-1 transition-all hover:bg-indigo-400">
                            DESBLOQUEAR PRO
                        </span>
                    </Link>
                </div>
            )}
        </div>
    );
}

// --- SKELETON FALLBACK ---
const PracticeSkeleton = () => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Clínica de Corações Skeleton */}
            <div className="bg-white rounded-xl border-2 border-stone-200 border-b-8 p-10 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-stone-200 rounded-full animate-pulse" />
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-48 bg-stone-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-64 bg-stone-200 rounded-md animate-pulse" />
                </div>
                <div className="pt-2">
                    <div className="h-[48px] w-[240px] bg-stone-200 rounded-2xl animate-pulse" />
                </div>
            </div>

            {/* 2x2 Skills Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border-2 border-stone-200 border-b-8 p-8 flex gap-6 items-start">
                        <div className="w-16 h-16 rounded-full bg-stone-200 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-3">
                            <div className="h-6 w-32 bg-stone-200 rounded-lg animate-pulse" />
                            <div className="h-4 w-full bg-stone-200 rounded-md animate-pulse" />
                            <div className="h-4 w-3/4 bg-stone-200 rounded-md animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Conversação Fluída Skeleton */}
            <div className="bg-stone-50 rounded-3xl p-8 sm:p-12 relative border-2 border-stone-200 overflow-hidden flex flex-col md:flex-row items-center gap-8 mt-4">
                <div className="flex-1 text-center md:text-left z-10 space-y-4 flex flex-col items-center md:items-start">
                    <div className="w-24 h-8 bg-stone-200 rounded-xl animate-pulse" />
                    <div className="w-64 h-10 bg-stone-200 rounded-lg animate-pulse" />
                    <div className="w-full max-w-md h-16 bg-stone-200 rounded-md animate-pulse" />
                    <div className="w-48 h-[56px] bg-stone-200 rounded-2xl animate-pulse mt-4" />
                </div>
                <div className="hidden md:flex w-48 h-48 shrink-0 bg-stone-200 rounded-[2rem] animate-pulse relative z-10" />
            </div>
        </div>
    );
};
