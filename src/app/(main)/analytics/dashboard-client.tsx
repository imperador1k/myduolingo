"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Zap, Target, Crown, Flame, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type WeeklyData = {
    date: string;
    xp: number;
    lessons: number;
};

type Props = {
    data: {
        totalXp: number;
        hearts: number;
        lessonsCompleted: number;
        activeDays: number;
        weeklyData: WeeklyData[];
        heatmapData: { date: string, xp: number }[];
        streak: number;
        longestStreak: number;
        wordsMastered: number;
        accuracy: number;
    };
};

export const DashboardClient = ({ data }: Props) => {
    const [activeTab, setActiveTab] = useState<"overview" | "heatmap">("overview");

    // Format date for the X-axis (e.g., "seg", "ter")
    const chartData = data.weeklyData.map((d) => {
        let dayName = "";
        try {
            // date-fns format day of week short in Portuguese
            dayName = format(parseISO(d.date), "EEEE", { locale: ptBR })
                .split("-")[0]
                .substring(0, 3)
                .toUpperCase();
        } catch (e) {
            dayName = d.date;
        }
        return {
            ...d,
            dayName,
        };
    });

    const maxXP = Math.max(...chartData.map(d => d.xp)) || 100;

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Tabs Switcher */}
            <div className="flex gap-2 bg-stone-100 p-2 rounded-2xl border-2 border-stone-200 border-b-4 mb-2 mx-auto sm:mx-0 w-fit">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={cn(
                        "transition-all",
                        activeTab === "overview" 
                            ? "bg-white border-2 border-stone-200 border-b-4 rounded-xl px-6 py-2 font-bold text-[#1CB0F6]" 
                            : "px-6 py-2 font-bold text-stone-400 hover:text-stone-600 cursor-pointer"
                    )}
                >
                    Visão Geral
                </button>
                <button
                    onClick={() => setActiveTab("heatmap")}
                    className={cn(
                        "transition-all",
                        activeTab === "heatmap" 
                            ? "bg-white border-2 border-stone-200 border-b-4 rounded-xl px-6 py-2 font-bold text-[#1CB0F6]" 
                            : "px-6 py-2 font-bold text-stone-400 hover:text-stone-600 cursor-pointer"
                    )}
                >
                    Consistência
                </button>
            </div>

            {activeTab === "overview" && (
                <>
                    {/* Component 1: "Dias de Foco" Bento Box */}
                    <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2">
                            <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
                            <h2 className="font-black text-2xl text-stone-700">Dias de Foco</h2>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
                            {chartData.map((d, i) => (
                                <div key={i}>
                                    {d.xp > 0 ? (
                                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-orange-400 border-2 border-orange-500 border-b-4 flex items-center justify-center shadow-sm">
                                            <Flame className="h-6 w-6 sm:h-8 sm:w-8 fill-white text-white" />
                                        </div>
                                    ) : (
                                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-stone-100 border-t-4 border-stone-200 flex items-center justify-center">
                                            <span className="font-bold text-stone-400 text-lg">{d.dayName.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-orange-100 border-2 border-orange-200 rounded-2xl px-6 py-3">
                            <span className="font-black text-orange-500 text-lg">🔥 {data.activeDays} / 7 Dias esta semana</span>
                        </div>

                        <p className="text-stone-400 font-bold text-sm">Consegues fazer melhor, volta amanhã! ⏰</p>
                    </div>

                    {/* Gamified Bar Chart: XP Semanal */}
                    <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 flex flex-col w-full relative group/chart animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-8 w-8 text-sky-500" />
                            <h2 className="font-black text-2xl text-stone-700">XP Semanal</h2>
                        </div>
                        <p className="text-stone-400 font-bold text-sm mb-8">O teu desempenho ao longo da semana.</p>

                        <div className="flex items-end justify-between h-48 sm:h-56 w-full gap-2 sm:gap-4">
                            {chartData.map((d, i) => {
                                const heightPercent = d.xp > 0 ? Math.max((d.xp / maxXP) * 100, 10) : 0; 
                                return (
                                    <div key={i} className="flex flex-col items-center flex-1 gap-3 group h-full">
                                        <div className="relative w-full flex flex-col justify-end h-full">
                                            {/* Tooltip */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-700 text-white font-black text-sm px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none drop-shadow-md">
                                                {d.xp} XP
                                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-stone-700 rotate-45" />
                                            </div>

                                            {/* Bar */}
                                            <div className="w-full relative flex items-end justify-center h-full">
                                                {d.xp === 0 ? (
                                                    <div className="w-full h-4 bg-stone-100 border-2 border-stone-200 border-b-0 rounded-t-[10px] rounded-b-none" />
                                                ) : (
                                                    <div 
                                                        className="w-full bg-[#1CB0F6] border-x-2 border-t-2 border-[#1899D6] border-b-[8px] border-b-[#0092d6] rounded-t-[14px] rounded-b-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:brightness-110"
                                                        style={{ height: `${heightPercent}%` }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-xs md:text-sm font-black uppercase tracking-widest", 
                                            d.xp > 0 ? "text-stone-500" : "text-stone-300"
                                        )}>
                                            {d.dayName}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Component 2: "Other Analytics" */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Card A (Total XP) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex items-center gap-6">
                            <div className="relative flex items-center justify-center h-16 w-16 shrink-0">
                                <svg className="absolute inset-0 h-full w-full -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        className="stroke-stone-200"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        className="stroke-amber-400"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="175.93"
                                        strokeDashoffset="44"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <Zap className="h-10 w-10 text-amber-500 fill-amber-500 z-10" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-black text-4xl text-stone-700">{data.totalXp}</h3>
                                <p className="font-bold text-stone-400 uppercase tracking-widest text-sm">Total XP</p>
                            </div>
                        </div>

                        {/* Card B (Precisão) */}
                        <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col justify-center items-start gap-2">
                            <Target className="h-8 w-8 text-green-500" />
                            <span className="font-black text-4xl text-green-500">{data.accuracy}%</span>
                            <p className="font-bold text-stone-400 uppercase tracking-widest text-sm">Precisão</p>
                        </div>

                        {/* Card C (Words Mastered) */}
                        <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col justify-center items-start gap-2">
                            <Crown className="h-8 w-8 text-yellow-500" />
                            <span className="font-black text-4xl text-stone-700">{data.wordsMastered}</span>
                            <p className="font-bold text-stone-400 uppercase tracking-widest text-sm">Palavras Dominadas</p>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "heatmap" && (
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 w-full animate-in fade-in slide-in-from-bottom-2">
                    <h2 className="text-xl font-black text-stone-700 mb-6 flex items-center gap-2">
                        <Activity className="h-6 w-6 text-emerald-500" />
                        A Tua Consistência
                    </h2>
                    
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                        {/* Day labels */}
                        <div className="flex flex-col gap-[3px] text-[10px] font-bold text-stone-400 uppercase leading-[16px] xl:leading-[18px] pr-2 mt-1">
                            <span>S</span>
                            <span>M</span>
                            <span>T</span>
                            <span>W</span>
                            <span>T</span>
                            <span>F</span>
                            <span>S</span>
                        </div>
                        
                        {/* Heatmap Grid */}
                        <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                            {data.heatmapData.map((d, i) => {
                                let bgColor = "bg-stone-100"; // Empty / 0 XP
                                if (d.xp >= 50) bgColor = "bg-[#46a302]"; // Verde Escuro
                                else if (d.xp >= 21) bgColor = "bg-[#58CC02]"; // Verde Duolingo
                                else if (d.xp >= 1) bgColor = "bg-[#d7ffb8]"; // Verde Claro

                                // Format title string
                                let titleStr = `${d.xp} XP`;
                                try {
                                    const formattedDate = format(parseISO(d.date), "d 'de' MMMM", { locale: ptBR });
                                    titleStr = `${d.xp} XP a ${formattedDate}`;
                                } catch (e) {
                                    titleStr = `${d.xp} XP a ${d.date}`;
                                }

                                return (
                                    <div 
                                        key={i} 
                                        className={cn("w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all cursor-crosshair hover:ring-2 hover:ring-offset-1 hover:ring-stone-400", bgColor)}
                                        title={titleStr}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-end gap-2 mt-4 text-xs font-bold text-stone-400 pb-8 border-b-2 border-stone-100">
                        Menos
                        <div className="w-[14px] h-[14px] rounded-[3px] bg-stone-100" />
                        <div className="w-[14px] h-[14px] rounded-[3px] bg-[#d7ffb8]" />
                        <div className="w-[14px] h-[14px] rounded-[3px] bg-[#58CC02]" />
                        <div className="w-[14px] h-[14px] rounded-[3px] bg-[#46a302]" />
                        Mais
                    </div>

                    {/* Consistency Summary Stats */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 border-2 border-stone-100">
                            <span className="text-stone-400 font-bold text-xs uppercase tracking-widest mb-1 text-center">Série Atual</span>
                            <span className="text-2xl font-black text-orange-500 drop-shadow-sm">{data.streak}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 border-2 border-stone-100">
                            <span className="text-stone-400 font-bold text-xs uppercase tracking-widest mb-1 text-center">Série Máxima</span>
                            <span className="text-2xl font-black text-stone-700 drop-shadow-sm">{data.longestStreak}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 border-2 border-stone-100">
                            <span className="text-stone-400 font-bold text-xs uppercase tracking-widest mb-1 text-center">Este Mês</span>
                            <span className="text-2xl font-black text-sky-500 drop-shadow-sm">
                                {data.heatmapData.slice(-30).filter(d => d.xp > 0).length}
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-50 border-2 border-stone-100">
                            <span className="text-stone-400 font-bold text-xs uppercase tracking-widest mb-1 text-center">Total XP</span>
                            <span className="text-2xl font-black text-amber-500 drop-shadow-sm">{data.totalXp}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};