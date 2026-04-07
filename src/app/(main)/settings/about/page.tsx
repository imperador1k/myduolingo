"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Mail, FileText, Code, ArrowLeft, User2, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="flex flex-col items-center py-6 px-4">
            <div className="relative z-10 max-w-2xl w-full mx-auto">
                <Link href="/settings" className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-600 font-bold mb-6 transition-all group active:translate-x-[-4px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-stone-200 border-b-4 bg-white group-hover:bg-stone-50 transition-all">
                        <ArrowLeft className="w-5 h-5 text-stone-400 group-hover:text-stone-600" />
                    </div>
                    VOLTAR
                </Link>
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 shadow-sm">
                    
                    {/* Hero Area */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 mb-8 flex flex-col items-center border-2 border-green-200 relative overflow-hidden">
                        <div className="w-32 h-32 mb-4 relative z-10">
                            <Image 
                                src="/marco.png" 
                                alt="Marco Mascot" 
                                fill
                                className="object-contain drop-shadow-xl animate-bounce-slow"
                            />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-700 mb-4 z-10 text-center">Sobre o App</h1>
                        <div className="bg-green-100 text-green-700 border-2 border-green-200 border-b-4 font-black tracking-widest text-sm px-4 py-2 rounded-2xl z-10">
                            V1.0.0-BETA
                        </div>
                        {/* Decorative background circle */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-black uppercase text-stone-400 mb-6 tracking-wider">A Equipa</h2>
                            <Link href="/settings/creator" className="w-full bg-purple-50 border-2 border-purple-200 border-b-4 rounded-2xl p-5 hover:bg-purple-100 active:translate-y-1 active:border-b-2 transition-all cursor-pointer flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-200 rounded-xl text-purple-700">
                                        <User2 className="w-6 h-6" />
                                    </div>
                                    <span className="text-lg font-bold text-purple-700">Conhece o Criador</span>
                                </div>
                                <ChevronRight className="w-6 h-6 text-purple-400 group-hover:text-purple-700 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>

                        <div>
                            <h2 className="text-xl font-black uppercase text-stone-400 mb-6 tracking-wider">Informação Legal</h2>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <Link href="/terms" className="w-full bg-white border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:bg-stone-50 active:translate-y-1 active:border-b-2 transition-all cursor-pointer flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-stone-100 rounded-xl text-stone-500">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <span className="text-lg font-bold text-stone-700">Termos de Serviço</span>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-1 transition-all" />
                                </Link>

                                <Link href="/privacy" className="w-full bg-white border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:bg-stone-50 active:translate-y-1 active:border-b-2 transition-all cursor-pointer flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-stone-100 rounded-xl text-stone-500">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <span className="text-lg font-bold text-stone-700">Política de Privacidade</span>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-1 transition-all" />
                                </Link>

                                <Link href="/licenses" className="w-full bg-white border-2 border-stone-200 border-b-4 rounded-2xl p-5 hover:bg-stone-50 active:translate-y-1 active:border-b-2 transition-all cursor-pointer flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-stone-100 rounded-xl text-stone-500">
                                            <Code className="w-6 h-6" />
                                        </div>
                                        <span className="text-lg font-bold text-stone-700">Licenças Open Source</span>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-1 transition-all" />
                                </Link>

                                <Link href="/support" className="w-full bg-sky-50 border-2 border-[#1CB0F6]/30 border-b-4 rounded-2xl p-5 hover:bg-sky-100 active:translate-y-1 active:border-b-2 active:border-[#1CB0F6]/30 transition-all cursor-pointer flex justify-between items-center group mt-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[#1CB0F6] rounded-xl text-white shadow-sm shadow-[#1CB0F6]/30">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <span className="text-lg font-bold text-[#1CB0F6]">Contactar Suporte</span>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-[#1CB0F6] group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="text-center mt-12 mb-8">
                    <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-stone-200 border-b-4 hover:bg-stone-50 transition-colors shadow-sm">
                        <span className="text-stone-400 font-black tracking-widest text-xs uppercase">Concebido com</span>
                        <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-[bounce_2s_ease-in-out_infinite]" />
                        <span className="text-stone-400 font-black tracking-widest text-xs uppercase">por Lendas</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
