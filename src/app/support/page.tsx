"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageSquareText, ShieldAlert, Check, Bot, FileText, ShieldCheck, Scale, Sparkles, UserCircle } from "lucide-react";
import { useFormStatus, useFormState } from "react-dom";
import { submitSupportTicket } from "@/actions/support";
import { cn } from "@/lib/utils";

const initialState: any = {
    errors: {},
    message: "",
    success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(
                "w-full py-5 rounded-2xl font-black text-xl tracking-widest text-white transition-all flex items-center justify-center outline-none uppercase shadow-sm",
                pending 
                    ? "bg-stone-300 border-stone-300 border-b-4 cursor-not-allowed translate-y-2 opacity-70 animate-pulse" 
                    : "bg-[#58CC02] border-[#46a302] border-b-8 active:border-b-0 active:translate-y-2 hover:bg-[#61da02]"
            )}
        >
            {pending ? (
                <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    A ENVIAR...
                </>
            ) : "ENVIAR MENSAGEM"}
        </button>
    );
}

export default function SupportPage() {
    const [state, formAction] = useFormState(submitSupportTicket, initialState);

    return (
        <div className="min-h-screen bg-stone-50 py-10 px-4 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* ── Header Area ── */}
                <div className="flex items-center justify-between">
                    <Link href="/learn" className="inline-flex items-center gap-3 text-stone-400 hover:text-stone-600 font-extrabold uppercase tracking-widest text-sm transition-all group active:translate-x-[-4px]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-stone-200 border-b-4 bg-white group-hover:bg-stone-50 transition-all shadow-sm">
                            <ArrowLeft className="w-6 h-6 text-stone-400 group-hover:text-stone-600" />
                        </div>
                        Início
                    </Link>
                </div>

                {/* ── Premium Hero Banner ── */}
                <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 p-8 md:p-12 shadow-md border-b-8 border-indigo-700/50">
                    <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(circle_at_20%_150%,rgba(255,255,255,0.4)_0%,transparent_60%)]" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <span className="text-white/80 font-black tracking-widest uppercase text-sm mb-2 block">Central de Ajuda</span>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-sm">
                                Como podemos <br className="hidden md:block"/> te ajudar hoje?
                            </h1>
                        </div>
                        <div className="relative w-32 h-32 shrink-0 animate-bounce-subtle">
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-black/20 blur-xl rounded-full" />
                            <Image src="/marco.png" alt="Marco Mascot" fill className="object-contain drop-shadow-2xl relative z-10" />
                        </div>
                    </div>
                </div>

                {/* ── Top Bento Links ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ask Marco Card */}
                    <div className="bg-[#e6ffed] border-2 border-[#b3ffc7] border-b-8 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between group h-full">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 border-b-4 border-emerald-600 shadow-sm group-hover:-translate-y-1 transition-transform">
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-emerald-700 mb-2 leading-tight">Dúvida rápida?</h3>
                            <p className="text-emerald-600/90 font-medium text-sm leading-relaxed mb-4">
                                Tens alguma dúvida que queiras relatar de forma simples? Fala com o Marco clicando no balão de chat flutuante!
                            </p>
                        </div>
                    </div>

                    {/* Legal Card */}
                    <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col h-full">
                        <div className="w-14 h-14 bg-stone-100 border-2 border-stone-200 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                            <ShieldCheck className="w-7 h-7 text-stone-500" />
                        </div>
                        <h3 className="text-xl font-black text-stone-700 mb-4">Avisos Legais</h3>
                        <div className="flex flex-col gap-2 w-full mt-auto">
                            <Link href="/terms" className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border-2 border-transparent hover:border-stone-200 transition-colors font-bold text-stone-600 text-sm">
                                <FileText className="w-4 h-4 text-stone-400" /> Termos de Uso
                            </Link>
                            <Link href="/privacy" className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border-2 border-transparent hover:border-stone-200 transition-colors font-bold text-stone-600 text-sm">
                                <ShieldCheck className="w-4 h-4 text-stone-400" /> Privacidade
                            </Link>
                            <Link href="/licenses" className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 border-2 border-transparent hover:border-stone-200 transition-colors font-bold text-stone-600 text-sm">
                                <Scale className="w-4 h-4 text-stone-400" /> Licenças Ativas
                            </Link>
                        </div>
                    </div>

                    {/* Creator Card */}
                    <Link href="/settings/creator" className="bg-sky-50 border-2 border-sky-200 border-b-8 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-sky-100 transition-colors active:translate-y-2 active:border-b-0 h-full">
                        <div className="w-20 h-20 bg-white border-4 border-sky-200 rounded-full flex items-center justify-center mb-4 shadow-sm relative overflow-hidden">
                            <UserCircle className="w-12 h-12 text-sky-400" />
                        </div>
                        <h3 className="text-xl font-black text-sky-700 mb-2">Quem criou?</h3>
                        <p className="text-sky-600/80 font-bold text-sm">Conhece o criador da plataforma e os créditos do projeto.</p>
                        <div className="mt-4 bg-white text-sky-600 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl border-b-2 border-sky-200 flex items-center gap-2">
                            Aceder <ArrowLeft className="w-4 h-4 rotate-180" />
                        </div>
                    </Link>
                </div>

                {/* ── Main Form & FAQ Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
                    
                    {/* Left Column: Form Bento */}
                    <div className="bg-white border-2 border-stone-200 border-b-8 rounded-[2.5rem] p-8 shadow-sm h-fit">
                        {state?.success ? (
                            <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 bg-green-50 border-2 border-green-200 border-b-8 rounded-3xl p-10">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                                    <Check className="w-12 h-12 text-green-500 stroke-[3]" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-green-700 mb-2">Mensagem Enviada!</h2>
                                <p className="text-green-700/80 font-medium text-lg leading-relaxed mb-8">
                                    {state.message}
                                </p>
                                <Link href="/learn" className="bg-[#58CC02] text-white border-b-8 border-[#46a302] active:border-b-0 active:translate-y-2 rounded-2xl w-full py-4 font-bold text-lg block transition-all hover:bg-[#68e003]">
                                    VOLTAR ÀS LIÇÕES
                                </Link>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-6">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-stone-800 mb-2 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-500">
                                            <MessageSquareText className="w-5 h-5" />
                                        </div>
                                        Reportar um Bug detalhado
                                    </h2>
                                    <p className="text-stone-500 font-medium pl-14">Preenche o ticket abaixo e a nossa equipa irá esmagar o erro na próxima atualização.</p>
                                </div>

                                {(state?.errors?.subject || state?.errors?.message) && (
                                    <div className="p-4 bg-red-100 border-2 border-red-200 border-b-4 rounded-2xl flex items-start gap-3">
                                        <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-red-700 font-bold">{state.message || "Por favor, preenche todos os campos corretamente."}</p>
                                    </div>
                                )}

                                {/* 🍯 HONEYPOT TRAP (Bot Catching) - Invisível para humanos */}
                                <div 
                                    className="absolute opacity-0 -z-50 select-none pointer-events-none w-0 h-0 overflow-hidden" 
                                    aria-hidden="true" 
                                    tabIndex={-1}
                                >
                                    <label htmlFor="user_contact_number">Número de Telefone Pessoal</label>
                                    <input type="text" id="user_contact_number" name="user_contact_number" tabIndex={-1} autoComplete="off" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-sm font-black uppercase text-stone-500 mb-2 block tracking-wider ml-1">Assunto Curto</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        placeholder="Ex: Áudio a falhar na Lição 3"
                                        className="w-full bg-stone-50 border-2 border-stone-200 border-b-4 rounded-xl p-5 text-stone-800 font-black tracking-wide placeholder:text-stone-400 placeholder:font-bold focus:outline-none focus:border-[#1CB0F6] focus:bg-white transition-all text-lg"
                                    />
                                    {state?.errors?.subject && <p className="text-red-500 font-bold text-sm ml-2">{state.errors.subject[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-black uppercase text-stone-500 mb-2 block tracking-wider ml-1">Mensagem ou Detalhes</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={6}
                                        placeholder="Onde estavas? Apareceu algum erro no ecrã? Descreve passo a passo o que aconteceu..."
                                        className="w-full bg-stone-50 border-2 border-stone-200 border-b-4 rounded-xl p-5 text-stone-700 font-bold placeholder:text-stone-400 transition-none focus:outline-none focus:border-[#1CB0F6] focus:bg-white resize-y text-base leading-relaxed"
                                    />
                                    {state?.errors?.message && <p className="text-red-500 font-bold text-sm ml-2">{state.errors.message[0]}</p>}
                                </div>

                                <div className="pt-2">
                                    <SubmitButton />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right Column: Expanded FAQs */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-6 bg-white border-2 border-stone-200 rounded-2xl p-4 shadow-sm">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                            </div>
                            <h2 className="text-xl font-black text-stone-700">Dúvidas Comuns</h2>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <details className="group bg-white border-2 border-stone-200 border-b-4 rounded-2xl cursor-pointer hover:border-stone-300 transition-all [&_summary::-webkit-details-marker]:hidden shadow-sm">
                                <summary className="p-5 font-bold text-stone-700 text-lg flex items-center justify-between outline-none">
                                    Como ganho XP?
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-open:rotate-45 transition-transform shrink-0">
                                        <span className="text-stone-400 font-black text-xl">+</span>
                                    </div>
                                </summary>
                                <div className="px-5 pb-5 pt-2 text-stone-500 font-medium leading-relaxed border-t-2 border-stone-100 mx-5">
                                    Ganha XP (Pontos de Experiência) ao completares com sucesso as tuas lições guiadas. As lições mais difíceis valem mais pontos. Podes usar este XP para subir nas Ligas e comprar maravilhas na Loja!
                                </div>
                            </details>

                            <details className="group bg-white border-2 border-stone-200 border-b-4 rounded-2xl cursor-pointer hover:border-stone-300 transition-all [&_summary::-webkit-details-marker]:hidden shadow-sm">
                                <summary className="p-5 font-bold text-stone-700 text-lg flex items-center justify-between outline-none">
                                    O que são as Ligas?
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-open:rotate-45 transition-transform shrink-0">
                                        <span className="text-stone-400 font-black text-xl">+</span>
                                    </div>
                                </summary>
                                <div className="px-5 pb-5 pt-2 text-stone-500 font-medium leading-relaxed border-t-2 border-stone-100 mx-5">
                                    As Ligas são tabelas de classificação globais ("Leaderboards") de ciclo semanal. Apanha mais XP que os outros alunos para subir à próxima divisão. Cuidado com a zona de despromoção.
                                </div>
                            </details>

                            <details className="group bg-white border-2 border-stone-200 border-b-4 rounded-2xl cursor-pointer hover:border-stone-300 transition-all [&_summary::-webkit-details-marker]:hidden shadow-sm">
                                <summary className="p-5 font-bold text-stone-700 text-lg flex items-center justify-between outline-none">
                                    Perdi a minha ofensiva (streak)!
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-open:rotate-45 transition-transform shrink-0">
                                        <span className="text-stone-400 font-black text-xl">+</span>
                                    </div>
                                </summary>
                                <div className="px-5 pb-5 pt-2 text-stone-500 font-medium leading-relaxed border-t-2 border-stone-100 mx-5">
                                    Não deixes o medo abalar o teu progresso. Vai à Loja e adquire "Congelamentos de Ofensiva" (Freezes) com as joias que farmaste para perdoar um dia perdido.
                                </div>
                            </details>

                            <details className="group bg-white border-2 border-stone-200 border-b-4 rounded-2xl cursor-pointer hover:border-stone-300 transition-all [&_summary::-webkit-details-marker]:hidden shadow-sm">
                                <summary className="p-5 font-bold text-stone-700 text-lg flex items-center justify-between outline-none text-left">
                                    Como funciona a pontuação do Arcade?
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-open:rotate-45 transition-transform shrink-0 ml-3">
                                        <span className="text-stone-400 font-black text-xl">+</span>
                                    </div>
                                </summary>
                                <div className="px-5 pb-5 pt-2 text-stone-500 font-medium leading-relaxed border-t-2 border-stone-100 mx-5">
                                    Nos mini-jogos Arcade (como o Sprint ou Swipe), a pontuação é baseada num multiplicador de combo. Responde rápido e sem errar para o multiplicador subir. Os pontos vão diretamente para a Liga atual.
                                </div>
                            </details>

                            <details className="group bg-white border-2 border-stone-200 border-b-4 rounded-2xl cursor-pointer hover:border-stone-300 transition-all [&_summary::-webkit-details-marker]:hidden shadow-sm">
                                <summary className="p-5 font-bold text-stone-700 text-lg flex items-center justify-between outline-none text-left">
                                    É possível alterar a língua de aprendizagem?
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center group-open:rotate-45 transition-transform shrink-0 ml-3">
                                        <span className="text-stone-400 font-black text-xl">+</span>
                                    </div>
                                </summary>
                                <div className="px-5 pb-5 pt-2 text-stone-500 font-medium leading-relaxed border-t-2 border-stone-100 mx-5">
                                    Podes gerir e alterar o teu curso atual na aba "Cursos". Todo o teu progresso (XP e Ligas) é mantido na conta, seja qual for a língua que escolheres.
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
