"use client";

import { useState } from "react";
import { Activity, BookA, Info, Link as LinkIcon, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordCardProps {
    word: string;
    translation: string;
    explanation: string;
    contextSentence: string | null;
    language: string | null;
    strength: number;
    index: number;
}

const strengthInfo: Record<number, { label: string; color: string; pct: number }> = {
    1: { label: "Semente", color: "text-amber-600 bg-amber-100 border-amber-200 stroke-amber-500", pct: 25 },
    2: { label: "Broto", color: "text-lime-600 bg-lime-100 border-lime-200 stroke-lime-500", pct: 50 },
    3: { label: "Árvore", color: "text-emerald-600 bg-emerald-100 border-emerald-200 stroke-emerald-500", pct: 75 },
    4: { label: "Mestre", color: "text-indigo-600 bg-indigo-100 border-indigo-200 stroke-indigo-500", pct: 100 },
};

export const WordCard = ({ word, translation, explanation, contextSentence, language, strength, index }: WordCardProps) => {
    const [isRevealed, setIsRevealed] = useState(false);
    
    const info = strengthInfo[strength] || strengthInfo[1];

    // S-Curve math for the card position
    const cycleLength = 6;
    const offsetCalc = Math.sin((index % cycleLength) * (Math.PI / (cycleLength / 2)));
    const translateX = `calc(${offsetCalc * 12}%)`;

    return (
        <div 
            className="w-full max-w-xl mx-auto flex flex-col items-center group"
            style={{ transform: `translateX(${translateX})` }}
        >
            <div className="bg-white border-2 border-stone-200 border-b-[8px] rounded-[32px] p-6 sm:p-8 w-full shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                {/* ── Top Bar ── */}
                <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-transparent border-b-[4px] shadow-sm ${info.color.replace('stroke-', 'text-')}`}>
                        <Activity className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">{info.label}</span>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                        <button 
                            onClick={() => setIsRevealed(!isRevealed)}
                            className={cn(
                                "h-10 px-3 flex items-center justify-center rounded-xl border-2 border-transparent border-b-[4px] hover:-translate-y-1 active:border-b-[2px] active:translate-y-1 transition-all",
                                isRevealed 
                                  ? "bg-indigo-100 text-indigo-500 border-b-indigo-200 hover:border-b-indigo-300 hover:bg-indigo-200" 
                                  : "bg-stone-100 text-stone-400 border-b-stone-200 hover:border-b-sky-200 hover:bg-sky-50 hover:text-sky-500"
                            )}
                            title={isRevealed ? "Esconder Spoiler" : "Mostrar Spoiler"}
                        >
                            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-stone-100 text-stone-400 hover:text-sky-500 rounded-xl border-2 border-transparent border-b-[4px] border-b-stone-200 hover:border-b-sky-200 hover:bg-sky-50 hover:-translate-y-1 active:border-b-[2px] active:translate-y-1 transition-all">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-stone-100 text-stone-400 hover:text-rose-500 rounded-xl border-2 border-transparent border-b-[4px] border-b-stone-200 hover:border-b-rose-200 hover:bg-rose-50 hover:-translate-y-1 active:border-b-[2px] active:translate-y-1 transition-all">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Core Word ── */}
                <div className="flex flex-col gap-1 mb-6">
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight break-words">
                        {word}
                    </h2>
                    
                    {isRevealed ? (
                        <div className="flex items-center gap-2 text-indigo-500 animate-in fade-in slide-in-from-top-2">
                            <BookA className="w-5 h-5 shrink-0" />
                            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-none break-words">
                                {translation}
                            </h3>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-stone-300 mt-2">
                            <BookA className="w-5 h-5 shrink-0" />
                            <h3 className="text-xl sm:text-2xl font-black tracking-widest blur-sm opacity-50 select-none">
                                {translation.replace(/./g, '•')}
                            </h3>
                        </div>
                    )}
                </div>

                {/* ── Context & Explanation Bento ── */}
                {isRevealed ? (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Definition Block */}
                        {explanation && (
                            <div className="bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 flex gap-3">
                                <Info className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                                <p className="text-sm font-bold text-stone-500 leading-relaxed">
                                    {explanation}
                                </p>
                            </div>
                        )}

                        {/* Context Block */}
                        {contextSentence && (
                            <div className="bg-sky-50 border-2 border-sky-100 border-b-[4px] rounded-2xl p-4 flex flex-col gap-2 relative shadow-sm">
                                <div className="absolute top-0 right-4 -translate-y-1/2 bg-sky-500 text-white px-3 py-1 rounded-full border-2 border-sky-600 shadow-sm">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white shrink-0">Cena do Contexto</span>
                                </div>
                                <div className="flex items-start gap-3 mt-1">
                                    <LinkIcon className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                                    <p className="text-[15px] font-bold text-sky-700 italic leading-relaxed break-words">
                                        &quot;{contextSentence.split(new RegExp(`(${word})`, 'gi')).map((part, i) => 
                                            part.toLowerCase() === word.toLowerCase() 
                                                ? <strong key={i} className="font-black bg-sky-200 px-1 rounded mx-0.5 text-sky-900 border-b-2 border-sky-300">{part}</strong> 
                                                : part
                                        )}&quot;
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div 
                        onClick={() => setIsRevealed(true)}
                        className="w-full bg-stone-50 border-2 border-stone-200 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-500 group/reveal"
                    >
                        <Eye className="w-6 h-6 group-hover/reveal:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Tocar para Revelar Detalhes</span>
                    </div>
                )}

                {/* Progress Indicator Ring Background Element */}
                <div className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none">
                    <svg className="w-48 h-48 -rotate-90">
                        <circle cx="96" cy="96" r="80" className="fill-none stroke-stone-300 stroke-[24]" />
                        <circle 
                            cx="96" cy="96" r="80" 
                            className={`fill-none ${info.color.split(' ').find(c => c.startsWith('stroke-'))} stroke-[24]`}
                            strokeDasharray="502"
                            strokeDashoffset={502 - (502 * info.pct) / 100}
                            strokeLinecap="round" 
                        />
                    </svg>
                </div>
            </div>

            {/* Path connector line (visible if not last item, drawn via CSS relative to the card flow) */}
            <div className="w-2 md:w-4 h-12 md:h-16 bg-stone-200 opacity-50 relative -z-10 mt-1 mb-1 rounded-full mx-auto" />
        </div>
    );
};
