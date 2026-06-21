"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Mic,
  Calendar,
  BookOpen,
  Headphones,
  Sparkles,
  Bot,
  ChevronRight,
} from "lucide-react";

type Session = {
  id: number;
  type: "writing" | "speaking" | "reading" | "listening";
  prompt: string;
  userInput: string | null;
  feedback: unknown; // JSON string or object
  score: number | null;
  createdAt: Date | null;
};

export const HistoryList = ({ history }: { history: Session[] }) => {
  const [filter, setFilter] = useState<
    "all" | "writing" | "speaking" | "reading" | "listening"
  >("all");

  // Filter
  const filteredHistory = history.filter((session) => {
    if (filter === "all") return true;
    return session.type === filter;
  });

  // Group by Date
  const groupedHistory: { [date: string]: Session[] } = {};

  filteredHistory.forEach((session) => {
    const date = session.createdAt
      ? new Date(session.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Desconhecido";
    if (!groupedHistory[date]) {
      groupedHistory[date] = [];
    }
    groupedHistory[date].push(session);
  });

  return (
    <div className="space-y-8 pb-10">
      {/* ── Juicy Filters ── */}
      <div className="flex flex-wrap items-center gap-3 pb-4">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] sm:text-xs transition-all border-2 border-b-4",
            filter === "all"
              ? "bg-slate-700 text-white border-slate-800 translate-y-0.5 border-b-2"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5",
          )}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter("writing")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] sm:text-xs transition-all border-2 border-b-4",
            filter === "writing"
              ? "bg-sky-500 text-white border-sky-600 translate-y-0.5 border-b-2"
              : "bg-white text-sky-500 border-sky-200 hover:bg-sky-50 hover:-translate-y-0.5",
          )}
        >
          <MessageSquare className="h-4 w-4" strokeWidth={2.5} />
          Escrita
        </button>
        <button
          onClick={() => setFilter("speaking")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] sm:text-xs transition-all border-2 border-b-4",
            filter === "speaking"
              ? "bg-rose-500 text-white border-rose-600 translate-y-0.5 border-b-2"
              : "bg-white text-rose-500 border-rose-200 hover:bg-rose-50 hover:-translate-y-0.5",
          )}
        >
          <Mic className="h-4 w-4" strokeWidth={2.5} />
          Fala
        </button>
        <button
          onClick={() => setFilter("reading")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] sm:text-xs transition-all border-2 border-b-4",
            filter === "reading"
              ? "bg-emerald-500 text-white border-emerald-600 translate-y-0.5 border-b-2"
              : "bg-white text-emerald-500 border-emerald-200 hover:bg-emerald-50 hover:-translate-y-0.5",
          )}
        >
          <BookOpen className="h-4 w-4" strokeWidth={2.5} />
          Leitura
        </button>
        <button
          onClick={() => setFilter("listening")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] sm:text-xs transition-all border-2 border-b-4",
            filter === "listening"
              ? "bg-indigo-500 text-white border-indigo-600 translate-y-0.5 border-b-2"
              : "bg-white text-indigo-500 border-indigo-200 hover:bg-indigo-50 hover:-translate-y-0.5",
          )}
        >
          <Headphones className="h-4 w-4" strokeWidth={2.5} />
          Escuta
        </button>
      </div>

      {/* ── List ── */}
      {Object.keys(groupedHistory).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-stone-200/50 rounded-[2.5rem] flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-stone-400" />
          </div>
          <p className="text-xl font-bold text-stone-400">
            Nenhuma sessão encontrada para este filtro.
          </p>
        </div>
      ) : (
        Object.entries(groupedHistory).map(([date, sessions]) => (
          <div
            key={date}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="flex items-center gap-3 mb-6 ml-2">
              <div className="w-10 h-10 bg-stone-200 rounded-xl flex items-center justify-center border-b-4 border-stone-300 shrink-0">
                <Calendar
                  className="h-5 w-5 text-stone-500"
                  strokeWidth={2.5}
                />
              </div>
              <h2 className="text-lg font-black uppercase text-stone-500 tracking-wider">
                {date}
              </h2>
              <div className="h-1 flex-1 bg-stone-200 rounded-full ml-4 hidden sm:block"></div>
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

const HistoryCard = ({ session }: { session: Session }) => {
  // Parse feedback if string
  const feedbackData: any =
    typeof session.feedback === "string"
      ? JSON.parse(session.feedback as string)
      : session.feedback;

  return (
    <div className="group relative rounded-[2rem] border-2 border-stone-200 border-b-8 bg-white p-6 sm:p-8 hover:-translate-y-1 hover:border-b-[10px] hover:mb-[-2px] hover:border-stone-300 transition-all shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "p-4 rounded-2xl border-2 border-b-4 flex items-center justify-center shrink-0",
              session.type === "writing"
                ? "bg-sky-100 text-sky-500 border-sky-200"
                : session.type === "speaking"
                  ? "bg-rose-100 text-rose-500 border-rose-200"
                  : session.type === "reading"
                    ? "bg-emerald-100 text-emerald-500 border-emerald-200"
                    : "bg-indigo-100 text-indigo-500 border-indigo-200",
            )}
          >
            {session.type === "writing" && (
              <MessageSquare className="h-7 w-7" strokeWidth={2.5} />
            )}
            {session.type === "speaking" && (
              <Mic className="h-7 w-7" strokeWidth={2.5} />
            )}
            {session.type === "reading" && (
              <BookOpen className="h-7 w-7" strokeWidth={2.5} />
            )}
            {session.type === "listening" && (
              <Headphones className="h-7 w-7" strokeWidth={2.5} />
            )}
          </div>
          <div>
            <h3 className="font-black text-xl text-stone-700 capitalize tracking-tight">
              {session.type === "writing"
                ? "Prática de Escrita"
                : session.type === "speaking"
                  ? "Prática de Fala"
                  : session.type === "reading"
                    ? "Prática de Leitura"
                    : "Prática de Escuta"}
            </h3>
            <p className="text-stone-500 font-bold mt-1 line-clamp-1 sm:line-clamp-none">
              <span className="opacity-70 font-medium">Tema:</span>{" "}
              {session.prompt}
            </p>
          </div>
        </div>

        {/* Floating Score Badge */}
        {session.score !== null && (
          <div
            className={cn(
              "flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 shrink-0 shadow-lg rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-[15deg]",
              session.score >= 80
                ? "border-green-400 bg-green-100 text-green-600"
                : session.score >= 50
                  ? "border-amber-400 bg-amber-100 text-amber-600"
                  : "border-red-400 bg-red-100 text-red-600",
            )}
          >
            <span className="text-xl sm:text-2xl font-black tracking-tighter -mb-1">
              {session.score}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-black opacity-80 tracking-widest">
              Score
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 pl-4 sm:pl-8 border-l-4 border-stone-100">
        {/* ── User Input (Chat Bubble) ── */}
        <div className="flex items-end gap-3 relative">
          <div className="flex-1 bg-stone-100 rounded-2xl rounded-bl-sm p-4 sm:p-5 relative">
            <p className="text-stone-700 font-medium leading-relaxed">
              {session.userInput}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-stone-200 border-2 border-white shrink-0 shadow-sm overflow-hidden flex items-center justify-center">
            <span className="font-bold text-stone-400 text-xs">TU</span>
          </div>
        </div>

        {/* ── AI Feedback (Chat Bubble) ── */}
        <div className="flex items-start gap-3 relative mt-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 border-2 border-indigo-200 shrink-0 shadow-sm flex items-center justify-center relative z-10 -ml-10">
            <Bot className="w-6 h-6 text-indigo-500" strokeWidth={2.5} />
          </div>

          <div className="flex-1 bg-indigo-50/50 rounded-2xl rounded-tl-sm p-4 sm:p-5 border-2 border-indigo-100/50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="font-black text-indigo-600 uppercase text-xs tracking-widest">
                Feedback da IA
              </span>
            </div>
            <p className="text-stone-600 font-medium leading-relaxed">
              {feedbackData.feedback}
            </p>

            {/* Key Corrections/Tips Showcase */}
            {session.type === "writing" &&
              feedbackData.corrections &&
              feedbackData.corrections.length > 0 && (
                <div className="mt-5 space-y-3">
                  <span className="font-black text-stone-500 uppercase text-[10px] tracking-widest block">
                    Correções Sugeridas
                  </span>
                  <div className="flex flex-col gap-2">
                    {feedbackData.corrections.map(
                      (
                        c: { original: string; correction: string },
                        i: number,
                      ) => (
                        <div
                          key={i}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-white rounded-xl border-2 border-stone-100"
                        >
                          <div className="flex items-center gap-2 flex-1 line-through decoration-rose-400 decoration-2 text-stone-400 font-medium">
                            <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></div>
                            {c.original}
                          </div>
                          <ChevronRight
                            className="w-4 h-4 text-stone-300 hidden sm:block shrink-0"
                            strokeWidth={3}
                          />
                          <div className="flex items-center gap-2 flex-1 text-emerald-600 font-bold bg-emerald-50/50 p-2 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
                            {c.correction}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {session.type === "speaking" && feedbackData.pronunciationTips && (
              <div className="mt-5 bg-white p-4 rounded-xl border-2 border-indigo-100/50 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Mic className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <span className="font-black text-indigo-600 uppercase text-[10px] tracking-widest block mb-1">
                    Dica de Pronúncia
                  </span>
                  <p className="text-stone-600 font-medium text-sm leading-relaxed">
                    {feedbackData.pronunciationTips}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
