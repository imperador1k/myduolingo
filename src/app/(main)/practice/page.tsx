import { Dumbbell, Mic, PenTool, BookOpen, Headphones } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function PracticePage() {
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
