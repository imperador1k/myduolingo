"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

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
                    
                    <Link href="/arcade/sprint" className="w-full">
                        <button className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-black text-lg uppercase tracking-widest rounded-2xl border-2 border-purple-600 border-b-8 active:border-b-2 active:translate-y-[6px] transition-all">
                            JOGAR AGORA
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
}
