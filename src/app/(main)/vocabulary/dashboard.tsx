"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, Search, Swords, BookOpen } from "lucide-react";
import { Flashcard } from "@/components/ui/flashcard";
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

            {/* ── Control Bar ── */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Pesquisar palavras ou traduções..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-sky-400 focus:bg-white transition-colors"
                    />
                </div>

                <Link href="/practice/vocabulary" className="w-full md:w-auto">
                    <Button
                        className="w-full md:w-auto font-bold text-lg px-8 py-6 rounded-xl border-b-4 bg-indigo-500 hover:bg-indigo-600 border-indigo-700 text-white shadow-sm active:border-b-0 active:translate-y-1 transition-all"
                        disabled={initialWords.length === 0}
                    >
                        <span className="flex items-center gap-2">
                            <Swords className="h-5 w-5" />
                            Treinar Vocabulário
                        </span>
                    </Button>
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
                /* ── Flashcard Grid: 1 col mobile, 2 col desktop ── */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2 animate-in fade-in duration-500">
                    {filteredWords.map((entry) => (
                        <Flashcard
                            key={entry.id}
                            word={entry.word}
                            translation={entry.translation}
                            explanation={entry.explanation}
                            contextSentence={entry.contextSentence}
                            language={entry.language}
                            strength={entry.strength}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
