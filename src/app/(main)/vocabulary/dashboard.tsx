"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, Search, Swords, BookOpen, Joystick } from "lucide-react";
import { WordCard } from "@/components/ui/word-card";
import { Button } from "@/components/ui/button";

interface VocabularyEntry {
    id: number;
    word: string;
    translation: string;
    explanation: string;
    contextSentence: string | null;
    language: string | null;
    strength: number;
    createdAt: Date | null;
}

interface VocabularyDashboardProps {
    initialWords: VocabularyEntry[];
}

export const VocabularyDashboard = ({ initialWords }: VocabularyDashboardProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredWords = initialWords.filter((entry) => {
        const query = searchQuery.toLowerCase();
        return (
            entry.word.toLowerCase().includes(query) ||
            entry.translation.toLowerCase().includes(query)
        );
    });

    return (
        <div className="flex flex-col gap-y-6">

            {/* ── Stats Bar ── */}
            {initialWords.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-indigo-400" />
                        <span><strong className="text-slate-700">{initialWords.length}</strong> {initialWords.length === 1 ? "palavra" : "palavras"} no cofre</span>
                    </div>
                </div>
            )}

            {/* ── Control System ── */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between bg-stone-100 border-2 border-stone-200 border-b-[8px] p-6 rounded-[32px] shadow-sm relative z-10">
                <div className="relative w-full md:w-96 flex-1">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-6 w-6 text-stone-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Pesquisar palavras ou traduções..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-full min-h-[56px] pl-12 pr-4 py-4 bg-white border-2 border-transparent border-b-[4px] border-b-stone-200 rounded-[20px] text-stone-700 font-bold focus:outline-none focus:border-sky-400 focus:border-b-sky-500 transition-colors shadow-sm placeholder:font-bold placeholder:text-stone-400"
                    />
                </div>

                <Link href="/practice/vocabulary" className="w-full md:w-auto h-full block">
                    <button
                        className="w-full h-full min-h-[56px] md:w-auto flex items-center justify-center gap-3 font-black text-lg px-8 py-4 rounded-[20px] bg-[#1CB0F6] text-white border-2 border-transparent border-b-[6px] border-b-[#0092d6] shadow-sm hover:border-b-[4px] hover:translate-y-[2px] active:translate-y-[6px] active:border-b-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={initialWords.length === 0}
                    >
                        <Joystick className="w-6 h-6 border-2 border-white/20 rounded-full p-0.5" />
                        TREINAR VOCABULÁRIO
                    </button>
                </Link>
            </div>

            {/* ── Content ── */}
            {initialWords.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 mt-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-slate-100 p-8 rounded-full mb-6">
                        <Archive className="h-16 w-16 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-700 mb-2">
                        O teu cofre está vazio.
                    </h2>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">
                        Clica em palavras durante as lições ou avaliação para as guardares aqui!
                    </p>
                </div>
            ) : filteredWords.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 font-medium">
                    <Search className="h-12 w-12 text-slate-300 mb-4" />
                    <p>Nenhuma palavra encontrada para &quot;{searchQuery}&quot;.</p>
                </div>
            ) : (
                /* ── Word Vault Feed (S-Curve) ── */
                <div className="flex flex-col w-full relative pt-12 animate-in fade-in duration-700 pb-20">
                    {/* The Background Map Grid Elements can go here later */}
                    <div className="absolute inset-0 top-6 bottom-0 w-2 md:w-4 bg-stone-100 rounded-full left-1/2 -translate-x-1/2 -z-20 opacity-50" />
                    
                    {filteredWords.map((entry, index) => (
                        <WordCard
                            key={entry.id}
                            index={index}
                            word={entry.word}
                            translation={entry.translation}
                            explanation={entry.explanation}
                            contextSentence={entry.contextSentence}
                            language={entry.language}
                            strength={entry.strength}
                        />
                    ))}
                    
                    {/* Final massive train button at the bottom of the map */}
                    <div className="mx-auto mt-8 w-full max-w-sm flex items-center justify-center">
                        <Link href="/practice/vocabulary" className="w-full">
                            <button className="w-full flex flex-col items-center justify-center gap-1 font-black text-xl px-8 py-6 rounded-[32px] bg-amber-400 text-amber-900 border-2 border-transparent border-b-[8px] border-b-amber-600 shadow-xl hover:translate-y-[2px] hover:border-b-[6px] active:translate-y-[8px] active:border-b-0 transition-all hover:scale-105 active:scale-95 group">
                                <span className="flex items-center gap-2 drop-shadow-sm">
                                    <Swords className="w-6 h-6 animate-pulse" />
                                    INICIAR DOJO
                                </span>
                                <span className="text-[11px] font-black text-amber-900/50 uppercase tracking-widest mt-1 group-hover:opacity-100 opacity-60 transition-opacity">
                                    Missão Rápida (+20 XP)
                                </span>
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
