"use client";

import Link from "next/link";
import { CopyMinus, Zap, Sparkles } from "lucide-react";

export default function ArcadeHub() {
    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-12 pb-32">
            
            {/* Header */}
            <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-stone-700 uppercase">
                    Arcade 🕹️
                </h1>
                <p className="text-stone-400 font-bold text-lg">
                    Treina os teus reflexos e a memória em mini-jogos.
                </p>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Vocabulary Sprint Card */}
                <div className="bg-purple-100 border-2 border-purple-300 border-b-8 rounded-3xl p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 group">
                    <div className="h-24 w-24 bg-white rounded-3xl border-2 border-purple-200 border-b-4 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                        <Zap className="h-10 w-10 fill-purple-500" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-purple-700 mb-2 uppercase tracking-wide">
                        Sprint de Vocabulário
                    </h2>
                    
                    <p className="text-purple-600/80 font-bold mb-8">
                        Treina a tua memória muscular. Traduz rápido, ganha pontos.
                    </p>
                    
                    <Link href="/arcade/sprint" className="w-full mt-auto">
                        <button className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-black text-lg uppercase tracking-widest rounded-2xl border-2 border-purple-600 border-b-8 active:border-b-2 active:translate-y-[6px] transition-all">
                            JOGAR AGORA
                        </button>
                    </Link>
                </div>

                {/* Swipe Card */}
                <div className="bg-rose-100 border-2 border-rose-300 border-b-8 rounded-3xl p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 group">
                    <div className="h-24 w-24 bg-white rounded-3xl border-2 border-rose-200 border-b-4 flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                        <CopyMinus className="h-10 w-10 text-rose-500" strokeWidth={2.5} />
                    </div>
                    
                    <h2 className="text-2xl font-black text-rose-700 mb-2 uppercase tracking-wide">
                        O Deslize
                    </h2>
                    
                    <p className="text-rose-600/80 font-bold mb-8">
                        Verdade ou Mentira? Arrasta para a direita se for verdade, ou para a esquerda se for mentira.
                    </p>
                    
                    <Link href="/arcade/swipe" className="w-full mt-auto">
                        <button className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-lg uppercase tracking-widest rounded-2xl border-2 border-rose-600 border-b-8 active:border-b-2 active:translate-y-[6px] transition-all">
                            JOGAR AGORA
                        </button>
                    </Link>
                </div>

                {/* Meteoros Card */}
                <div className="bg-amber-100 border-2 border-amber-300 border-b-8 rounded-3xl p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 group col-span-1 md:col-span-2 lg:col-span-1">
                    <div className="h-24 w-24 bg-white rounded-3xl border-2 border-amber-200 border-b-4 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform shadow-sm relative overflow-hidden">
                        <span className="absolute inset-0 bg-amber-400 opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                        <Sparkles className="h-10 w-10 text-amber-500 relative z-10" strokeWidth={2.5} />
                    </div>
                    
                    <h2 className="text-2xl font-black text-amber-700 mb-2 uppercase tracking-wide">
                        Chuva de Meteoros
                    </h2>
                    
                    <p className="text-amber-600/80 font-bold mb-8">
                        Física realista! Destrói as palavras enquanto elas caem. Testa os teus reflexos e não as deixes bater no chão.
                    </p>
                    
                    <Link href="/arcade/meteoros" className="w-full mt-auto">
                        <button className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-lg uppercase tracking-widest rounded-2xl border-2 border-amber-600 border-b-8 active:border-b-2 active:translate-y-[6px] transition-all relative overflow-hidden">
                            <span className="absolute inset-0 bg-white/20 w-8 h-full skew-x-12 -ml-16 group-hover:animate-[shimmer_1.5s_infinite]" />
                            JOGAR AGORA
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
}
