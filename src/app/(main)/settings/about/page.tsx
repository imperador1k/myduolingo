"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Mail, FileText, Code, ArrowLeft, UserCircle, Zap, Box, Server, Sparkles, Heart, Star } from "lucide-react";
import { useReviewModal } from "@/store/use-review-modal-store";

export default function AboutPage() {
    const { open: openReviewModal } = useReviewModal();

    return (
        <div className="flex flex-col items-center py-6 px-4 pb-24">
            <div className="relative z-10 max-w-6xl w-full mx-auto space-y-8">
                
                {/* ── Header Area ── */}
                <div className="flex items-center justify-between">
                    <Link href="/settings" className="inline-flex items-center gap-3 text-stone-400 hover:text-stone-600 font-extrabold uppercase tracking-widest text-sm transition-all group active:translate-x-[-4px]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-stone-200 border-b-4 bg-white group-hover:bg-stone-50 transition-all shadow-sm">
                            <ArrowLeft className="w-6 h-6 text-stone-400 group-hover:text-stone-600" />
                        </div>
                        Definições
                    </Link>
                </div>

                {/* ── Premium Hero Banner (Brand Green Vibe) ── */}
                <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#58CC02] to-[#46a302] p-8 md:p-12 shadow-md border-b-8 border-[#3b8c02]">
                    <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(circle_at_20%_150%,rgba(255,255,255,0.3)_0%,transparent_60%)]" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                        <div className="flex flex-col h-full justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-lg font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> V1.0.0-BETA
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
                                myDuolingo <br className="hidden md:block"/> Engine Core.
                            </h1>
                            <p className="text-white/90 font-bold text-lg mt-4 max-w-md">
                                Descobre tudo sobre os bastidores da plataforma, a equipa e a tecnologia de ponta que torna isto possível.
                            </p>
                        </div>
                        <div className="relative w-36 h-36 shrink-0 md:mr-10">
                            {/* Spotlight effect to separate green mascot from green background */}
                            <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-white/40 blur-3xl rounded-full animate-pulse pointer-events-none" />
                            <div className="absolute inset-0 bg-white/20 rounded-full border-4 border-white/30 scale-110 shadow-[0_0_40px_rgba(255,255,255,0.3)]" />
                            <Image src="/marco.png" alt="App Mascot" fill className="object-contain drop-shadow-2xl relative z-10 scale-125 hover:scale-150 transition-transform duration-500 cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* ── First Grid Row: Creator & Tech ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
                    
                    {/* Creator Highlight Card */}
                    <Link href="/settings/creator" className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-indigo-200 border-b-8 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group hover:border-indigo-300 transition-all active:translate-y-2 active:border-b-0 cursor-pointer shadow-sm">
                        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 h-full justify-between">
                            <div className="flex-1 text-center sm:text-left">
                                <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg font-black uppercase tracking-widest text-xs mb-4">
                                    <UserCircle className="w-4 h-4" /> A Equipa
                                </div>
                                <h2 className="text-3xl font-black text-indigo-950 mb-3">Conhece o <br className="hidden sm:block" />Criador</h2>
                                <p className="text-indigo-900/70 font-bold mb-6 max-w-xs mx-auto sm:mx-0">
                                    A mente curiosa por trás do design e do código. Clica aqui para explorar a sua visão e contactar.
                                </p>
                                <div className="bg-white text-indigo-600 font-black text-sm uppercase tracking-widest px-6 py-3 rounded-2xl border-2 border-indigo-100 border-b-4 inline-flex items-center gap-3 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                    Ver Perfil <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
                                {/* Decorative elements */}
                                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl group-hover:bg-indigo-300 transition-colors" />
                                <div className="w-full h-full bg-white border-4 border-indigo-100 rounded-[2rem] rotate-3 flex items-center justify-center relative z-10 shadow-lg group-hover:rotate-6 transition-transform">
                                    <UserCircle className="w-16 h-16 text-indigo-400" />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Tech Stack Card */}
                    <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2.5rem] p-8 md:p-10 shadow-sm flex flex-col h-full justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 px-3 py-1 rounded-lg font-black uppercase tracking-widest text-xs mb-6">
                                <Zap className="w-4 h-4" /> Tecnologia
                            </div>
                            <h2 className="text-2xl font-black text-stone-800 mb-6">Powered By</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 transition-colors hover:border-stone-200">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-stone-200 flex items-center justify-center shrink-0">
                                    <Box className="w-6 h-6 text-stone-700" />
                                </div>
                                <div>
                                    <p className="font-extrabold text-stone-800">Next.js 14</p>
                                    <p className="font-bold text-stone-400 text-xs uppercase tracking-wider">Framework Base</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border-2 border-stone-100 transition-colors hover:border-stone-200">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-stone-200 flex items-center justify-center shrink-0">
                                    <Server className="w-6 h-6 text-stone-700" />
                                </div>
                                <div>
                                    <p className="font-extrabold text-stone-800">Tailwind + Drizzle</p>
                                    <p className="font-bold text-stone-400 text-xs uppercase tracking-wider">Estilos & Dados</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Second Grid Row: Legal & Support ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Terms */}
                    <Link href="/terms" className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-stone-50 active:translate-y-2 active:border-b-0 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform border-b-4 border-stone-200">
                            <FileText className="w-8 h-8 text-stone-500" />
                        </div>
                        <h3 className="text-lg font-black text-stone-700">Termos de <br/> Serviço</h3>
                    </Link>

                    {/* Privacy */}
                    <Link href="/privacy" className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-stone-50 active:translate-y-2 active:border-b-0 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform border-b-4 border-stone-200">
                            <ShieldCheck className="w-8 h-8 text-stone-500" />
                        </div>
                        <h3 className="text-lg font-black text-stone-700">Política de <br/> Privacidade</h3>
                    </Link>

                    {/* Licenses */}
                    <Link href="/licenses" className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-stone-50 active:translate-y-2 active:border-b-0 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform border-b-4 border-stone-200">
                            <Code className="w-8 h-8 text-stone-500" />
                        </div>
                        <h3 className="text-lg font-black text-stone-700">Licenças <br/> Open Source</h3>
                    </Link>

                    {/* Support Highlight */}
                    <Link href="/support" className="bg-sky-50 border-2 border-sky-200 border-b-8 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-sky-100 active:translate-y-2 active:border-b-0 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-[#1CB0F6] rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform border-b-4 border-[#1899D6] shadow-md shadow-[#1CB0F6]/30">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-black text-[#1CB0F6]">Contactar <br/> Suporte</h3>
                    </Link>

                    {/* Community Reviews Link */}
                    <Link href="/reviews" className="bg-purple-50 border-2 border-purple-200 border-b-8 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-purple-100 active:translate-y-2 active:border-b-0 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform border-b-4 border-purple-600 shadow-md shadow-purple-500/30">
                            <Heart className="w-8 h-8 text-white fill-white" />
                        </div>
                        <h3 className="text-lg font-black text-purple-600">Mural de <br/> Feedback</h3>
                    </Link>

                    {/* Give Feedback Button */}
                    <button onClick={openReviewModal} className="outline-none focus:outline-none col-span-1 md:col-span-2 lg:col-span-2 bg-yellow-50 border-2 border-yellow-200 border-b-8 rounded-3xl p-6 flex flex-row items-center justify-center text-center gap-6 hover:bg-yellow-100 active:translate-y-2 active:border-b-0 transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-[#FFC800] rounded-2xl flex items-center justify-center group-hover:-translate-y-1 transition-transform border-b-4 border-yellow-500 shadow-md shadow-[#FFC800]/30 shrink-0">
                            <Star className="w-8 h-8 text-white fill-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-black text-yellow-600">Dar o teu Feedback</h3>
                            <p className="text-yellow-600/70 font-bold text-sm">Ajuda a melhorar a app!</p>
                        </div>
                    </button>

                </div>

                {/* ── Footer ── */}
                <div className="text-center mt-12 mb-8 pt-8">
                    <div className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border-2 border-stone-200 border-b-4 shadow-sm hover:translate-y-[-2px] transition-transform">
                        <span className="text-stone-400 font-black tracking-widest text-xs uppercase">Feito com</span>
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                        <span className="text-stone-400 font-black tracking-widest text-xs uppercase">pelo Miguel</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
