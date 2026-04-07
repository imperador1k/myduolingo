"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageSquareText, ShieldAlert, Check } from "lucide-react";
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
                "w-full py-5 rounded-2xl font-black text-xl tracking-widest text-white transition-all flex items-center justify-center outline-none uppercase",
                pending 
                    ? "bg-stone-300 border-stone-300 border-b-4 cursor-not-allowed translate-y-2 opacity-70 animate-pulse" 
                    : "bg-[#1CB0F6] border-[#0092d6] border-b-8 active:border-b-0 active:translate-y-2 hover:bg-[#2bc2ff]"
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
        <div className="min-h-screen bg-stone-50 py-10 px-4">
            <div className="max-w-xl mx-auto">
                <Link href="/learn" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 font-bold mb-6 transition-all group active:translate-x-[-4px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-stone-200 border-b-4 bg-white group-hover:bg-stone-50 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-stone-400 group-hover:text-stone-600" />
                    </div>
                    VOLTAR
                </Link>

                <div className="flex flex-col items-center mb-8 space-y-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-stone-700 text-center">Reportar um Bug ou <br/> Dar Feedback</h1>
                </div>

                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 shadow-sm">
                    {state?.success ? (
                        <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 bg-green-50 border-2 border-green-200 border-b-8 rounded-3xl p-8">
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
                            
                            {/* Mascot Header Dialogue */}
                            <div className="flex items-end gap-4 mb-8">
                                <div className="relative w-20 h-20 shrink-0">
                                    <Image 
                                        src="/marco.png" 
                                        alt="Marco Bug Hunter" 
                                        fill
                                        className="object-contain drop-shadow-md animate-pulse"
                                    />
                                </div>
                                <div className="bg-white border-2 border-stone-200 border-b-4 rounded-3xl rounded-bl-none p-4 shadow-sm relative">
                                    <p className="font-bold text-stone-700 text-sm">
                                        Encontraste um bug? Ajuda-me a esmagá-lo! 🐛
                                    </p>
                                    <div className="absolute -left-[10px] bottom-4 w-4 h-4 bg-white border-b-2 border-l-2 border-stone-200 rotate-45" />
                                </div>
                            </div>

                            {(state?.errors?.subject || state?.errors?.message) && (
                                <div className="p-4 bg-red-100 border-2 border-red-200 rounded-2xl flex items-start gap-3">
                                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-700 font-medium">{state.message}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-black uppercase text-stone-500 mb-2 block tracking-wider">Assunto</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-[18px] text-stone-400">
                                        <MessageSquareText className="w-6 h-6" />
                                    </div>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        placeholder="Ex: Áudio a falhar na lição 3"
                                        className="w-full bg-stone-100 border-2 border-stone-200 border-b-4 rounded-2xl p-5 pl-14 text-lg font-bold text-stone-700 focus:bg-white focus:border-[#1CB0F6] focus:ring-4 focus:ring-[#1CB0F6]/20 outline-none transition-all placeholder:font-medium placeholder:text-stone-400"
                                    />
                                </div>
                                {state?.errors?.subject && <p className="text-red-500 font-bold text-sm ml-2">{state.errors.subject[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-black uppercase text-stone-500 mb-2 block tracking-wider">Mensagem</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    placeholder="Descreve o problema que encontraste com o máximo de detalhes possível..."
                                    className="w-full bg-stone-100 border-2 border-stone-200 border-b-4 rounded-2xl p-5 text-lg font-bold text-stone-700 focus:bg-white focus:border-[#1CB0F6] focus:ring-4 focus:ring-[#1CB0F6]/20 outline-none transition-all resize-none placeholder:font-medium placeholder:text-stone-400"
                                />
                                {state?.errors?.message && <p className="text-red-500 font-bold text-sm ml-2">{state.errors.message[0]}</p>}
                            </div>

                            <SubmitButton />
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
