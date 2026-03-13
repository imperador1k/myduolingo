import { Dumbbell, Mic, PenTool, BookOpen, Headphones, HeartPulse } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserProgress } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
    const userProgress = await getUserProgress();
    const hasFullHearts = userProgress?.hearts === 5;

    return (
        <div className="flex flex-col gap-6 px-6 py-8">
            <div className="flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-700">Área de Prática AI</h1>
                    <Link href="/practice/history">
                        <Button variant="ghost" size="sm" className="text-slate-500">
                            Ver Histórico
                        </Button>
                    </Link>
                </div>
                <p className="text-slate-500">
                    Melhora o teu Português com a ajuda da Inteligência Artificial.
                </p>
            </div>

            {/* Heart Clinic Wrapper */}
            <div className="mb-2">
                {hasFullHearts ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-slate-200 bg-slate-50 p-6 opacity-75">
                        <div className="rounded-full bg-slate-200 p-4">
                            <HeartPulse className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-600">Clínica de Corações</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Tens as vidas no máximo! Volta aqui quando precisares de recuperar corações.
                            </p>
                        </div>
                    </div>
                ) : (
                    <Link href="/lesson?clinic=true">
                        <div className="group flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border-2 border-b-4 border-rose-200 bg-rose-50 p-6 transition-all hover:bg-rose-100 active:border-b-2 cursor-pointer shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-6">
                                <div className="rounded-full bg-rose-500 p-4 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-6">
                                    <HeartPulse className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-black text-rose-700">Clínica de Corações</h3>
                                    <p className="mt-1 font-medium text-rose-600/80">
                                        Recupera vidas a rever os exercícios que erraste recentemente.
                                    </p>
                                </div>
                            </div>
                            <Button variant="danger" className="w-full md:w-auto shrink-0 shadow-sm pointer-events-none">
                                Praticar para ganhar +1 ❤️
                            </Button>
                        </div>
                    </Link>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Writing Card */}
                <Link href="/practice/writing">
                    <div className="group flex h-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-b-4 border-slate-200 p-8 transition-all hover:border-sky-500 hover:bg-sky-50 active:border-b-2">
                        <div className="rounded-full bg-sky-100 p-6 transition-transform group-hover:scale-110">
                            <PenTool className="h-10 w-10 text-sky-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-700">Escrita</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Recebe um tema e escreve um texto. A AI vai corrigir a tua gramática e ortografia.
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Speaking Card */}
                <Link href="/practice/speaking">
                    <div className="group flex h-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-b-4 border-slate-200 p-8 transition-all hover:border-rose-500 hover:bg-rose-50 active:border-b-2">
                        <div className="rounded-full bg-rose-100 p-6 transition-transform group-hover:scale-110">
                            <Mic className="h-10 w-10 text-rose-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-700">Fala</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Recebe uma pergunta e responde falando. A AI vai analisar a tua resposta e dar dicas.
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Reading Card */}
                <Link href="/practice/reading">
                    <div className="group flex h-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-b-4 border-slate-200 p-8 transition-all hover:border-emerald-500 hover:bg-emerald-50 active:border-b-2">
                        <div className="rounded-full bg-emerald-100 p-6 transition-transform group-hover:scale-110">
                            <BookOpen className="h-10 w-10 text-emerald-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-700">Leitura</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Lê um texto gerado pela AI e debate sobre o tema. Melhora a tua compreensão e escrita.
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Listening Card */}
                <Link href="/practice/listening">
                    <div className="group flex h-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-b-4 border-slate-200 p-8 transition-all hover:border-indigo-500 hover:bg-indigo-50 active:border-b-2">
                        <div className="rounded-full bg-indigo-100 p-6 transition-transform group-hover:scale-110">
                            <Headphones className="h-10 w-10 text-indigo-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-700">Escuta</h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Ouve um áudio gerado pela AI e analisa o conteúdo. Treina o teu ouvido e compreensão.
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
