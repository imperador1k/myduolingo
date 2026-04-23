import type { Metadata } from "next";
import Link from "next/link";
import { Code, Atom, Layers, Palette, Database, Key, Sparkles } from "lucide-react";

export const metadata: Metadata = {
    title: "Licenças de Software",
    description: "Créditos e licenças das tecnologias de código aberto utilizadas na construção do MyDuolingo.",
    alternates: {
        canonical: "/licenses",
    },
};

export default function LicensesPage() {
    return (
        <div className="min-h-screen bg-[#fbf9f8] py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col items-center text-center mb-12 space-y-4">
                    <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center border-2 border-stone-200 mb-2">
                        <Code className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-stone-700 tracking-tight">Licenças de Software</h1>
                    <div className="bg-stone-200 text-stone-500 font-bold text-xs px-4 py-2 rounded-full uppercase tracking-widest mt-4">
                        Créditos de Código Aberto
                    </div>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-black text-stone-700 mb-6">Tecnologias Utilizadas</h2>
                    <p className="text-stone-500 font-medium mb-8">
                        A MyDuolingo é construída sobre os ombros de gigantes. Agradecemos às comunidades de código aberto responsáveis por estas fantásticas ferramentas.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* React */}
                        <div className="bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:bg-stone-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Atom className="w-6 h-6 text-[#1CB0F6]" />
                                    <h3 className="font-bold text-lg text-stone-700">React</h3>
                                </div>
                                <span className="bg-[#1CB0F6]/10 text-[#1CB0F6] font-bold text-xs px-2 py-1 rounded-md">MIT</span>
                            </div>
                            <p className="text-sm text-stone-500 font-medium">A biblioteca principal para a construção da interface do utilizador iterativa e baseada em componentes.</p>
                        </div>

                        {/* Next.js */}
                        <div className="bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:bg-stone-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-6 h-6 text-stone-800" />
                                    <h3 className="font-bold text-lg text-stone-700">Next.js</h3>
                                </div>
                                <span className="bg-[#1CB0F6]/10 text-[#1CB0F6] font-bold text-xs px-2 py-1 rounded-md">MIT</span>
                            </div>
                            <p className="text-sm text-stone-500 font-medium">Framework React que providencia renderização do lado do servidor (SSR) e estrutura da aplicação.</p>
                        </div>

                        {/* Tailwind CSS */}
                        <div className="bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:bg-stone-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Palette className="w-6 h-6 text-[#38BDF8]" />
                                    <h3 className="font-bold text-lg text-stone-700">Tailwind CSS</h3>
                                </div>
                                <span className="bg-[#1CB0F6]/10 text-[#1CB0F6] font-bold text-xs px-2 py-1 rounded-md">MIT</span>
                            </div>
                            <p className="text-sm text-stone-500 font-medium">Framework CSS de classes utilitárias focado em designs extremamente rápidos e customizáveis.</p>
                        </div>

                        {/* Drizzle ORM */}
                        <div className="bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:bg-stone-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Database className="w-6 h-6 text-[#C4E456]" />
                                    <h3 className="font-bold text-lg text-stone-700">Drizzle ORM</h3>
                                </div>
                                <span className="bg-[#1CB0F6]/10 text-[#1CB0F6] font-bold text-xs px-2 py-1 rounded-md">Apache 2.0</span>
                            </div>
                            <p className="text-sm text-stone-500 font-medium">A interface para a base de dados relacional, totalmente tipada com TypeScript.</p>
                        </div>

                        {/* Clerk */}
                        <div className="bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:bg-stone-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Key className="w-6 h-6 text-indigo-500" />
                                    <h3 className="font-bold text-lg text-stone-700">Clerk</h3>
                                </div>
                                <span className="bg-stone-200 text-stone-600 font-bold text-xs px-2 py-1 rounded-md">Proprietário</span>
                            </div>
                            <p className="text-sm text-stone-500 font-medium">A plataforma de Gestão de Utilizadores e Autenticação (Login/Registo).</p>
                        </div>

                        {/* Gemini API */}
                        <div className="bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:bg-stone-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-blue-500" />
                                    <h3 className="font-bold text-lg text-stone-700">Google Gemini</h3>
                                </div>
                                <span className="bg-stone-200 text-stone-600 font-bold text-xs px-2 py-1 rounded-md">Proprietário</span>
                            </div>
                            <p className="text-sm text-stone-500 font-medium">O modelo de inteligência artificial generativa subjacente ao mascote Marco AI.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <Link href="/settings" className="bg-stone-200 text-stone-500 border-b-4 border-stone-300 active:translate-y-1 active:border-b-0 hover:bg-stone-300 rounded-2xl px-12 py-5 font-black uppercase tracking-widest text-center block w-full md:w-auto transition-all">
                        VOLTAR
                    </Link>
                </div>
            </div>
        </div>
    );
}
