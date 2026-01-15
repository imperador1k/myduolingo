"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Mic, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

type Session = {
    id: number;
    type: "writing" | "speaking";
    prompt: string;
    userInput: string | null;
    feedback: any; // JSON string or object
    score: number | null;
    createdAt: Date | null;
};

export const HistoryList = ({ history }: { history: any[] }) => {
    const [filter, setFilter] = useState<"all" | "writing" | "speaking">("all");

    // Filter
    const filteredHistory = history.filter(session => {
        if (filter === "all") return true;
        return session.type === filter;
    });

    // Group by Date
    const groupedHistory: { [date: string]: Session[] } = {};

    filteredHistory.forEach(session => {
        const date = new Date(session.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        if (!groupedHistory[date]) {
            groupedHistory[date] = [];
        }
        groupedHistory[date].push(session);
    });

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Button
                    variant={filter === "all" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("all")}
                    className={cn(filter === "all" && "bg-slate-700 text-white hover:bg-slate-800")}
                >
                    Todos
                </Button>
                <Button
                    variant={filter === "writing" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("writing")}
                    className={cn(filter === "writing" && "bg-sky-500 text-white hover:bg-sky-600")}
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Escrita
                </Button>
                <Button
                    variant={filter === "speaking" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("speaking")}
                    className={cn(filter === "speaking" && "bg-rose-500 text-white hover:bg-rose-600")}
                >
                    <Mic className="mr-2 h-4 w-4" />
                    Fala
                </Button>
            </div>

            {/* List */}
            {Object.keys(groupedHistory).length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <p>Nenhuma sessão encontrada com este filtro.</p>
                </div>
            ) : (
                Object.entries(groupedHistory).map(([date, sessions]) => (
                    <div key={date} className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-slate-400" />
                            <h2 className="text-sm font-bold uppercase text-slate-400 tracking-wider">
                                {date}
                            </h2>
                        </div>

                        <div className="grid gap-6">
                            {sessions.map((session) => (
                                <HistoryCard key={session.id} session={session} />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

const HistoryCard = ({ session }: { session: any }) => {
    // Parse feedback if string
    const feedbackData = typeof session.feedback === 'string'
        ? JSON.parse(session.feedback)
        : session.feedback;

    return (
        <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-3 rounded-xl",
                        session.type === 'writing' ? "bg-sky-100 text-sky-600" : "bg-rose-100 text-rose-600"
                    )}>
                        {session.type === 'writing' ? <MessageSquare className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-slate-700 capitalize">
                                {session.type === 'writing' ? 'Prática de Escrita' : 'Prática de Fala'}
                            </h3>
                        </div>
                        <p className="text-slate-500 font-medium text-sm mt-1">Tema: "{session.prompt}"</p>
                    </div>
                </div>
                {session.score !== null && (
                    <div className={cn(
                        "flex flex-col items-center px-4 py-2 rounded-xl border-2 shrink-0",
                        session.score >= 80 ? "border-green-500 bg-green-50 text-green-600" :
                            session.score >= 50 ? "border-amber-500 bg-amber-50 text-amber-600" :
                                "border-red-500 bg-red-50 text-red-600"
                    )}>
                        <span className="text-xl font-bold">{session.score}</span>
                        <span className="text-[10px] uppercase font-bold">Score</span>
                    </div>
                )}
            </div>

            {/* Content Preview */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
                <p className="text-slate-600 italic font-medium">"{session.userInput}"</p>
            </div>

            {/* Feedback Summary */}
            <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-slate-600 text-sm">{feedbackData.feedback}</p>
                </div>

                {/* Key Corrections/Tips Showcase */}
                {session.type === 'writing' && feedbackData.corrections && feedbackData.corrections.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {feedbackData.corrections.slice(0, 2).map((c: any, i: number) => (
                            <div key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 flex items-center gap-1">
                                <span className="line-through opacity-60 max-w-[100px] truncate block">{c.original}</span>
                                <span>→</span>
                                <span className="font-bold max-w-[100px] truncate block">{c.correction}</span>
                            </div>
                        ))}
                        {feedbackData.corrections.length > 2 && (
                            <span className="text-xs text-slate-400 flex items-center">+{feedbackData.corrections.length - 2}</span>
                        )}
                    </div>
                )}

                {session.type === 'speaking' && feedbackData.pronunciationTips && (
                    <div className="mt-2 text-xs bg-indigo-50 text-indigo-700 px-3 py-2 rounded border border-indigo-100">
                        <span className="font-bold">Dica:</span> {feedbackData.pronunciationTips}
                    </div>
                )}
            </div>
        </div>
    );
};
