"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Zap, Target, Crown, Flame, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

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
    };
};

export const DashboardClient = ({ data }: Props) => {
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
            {/* Component 1: "Dias de Foco" Bento Box */}
            <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 flex flex-col items-center gap-6">
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
            <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 flex flex-col w-full relative group/chart">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
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
                    <span className="font-black text-4xl text-green-500">85%</span>
                    <p className="font-bold text-stone-400 uppercase tracking-widest text-sm">Precisão</p>
                </div>

                {/* Card C (Words Mastered) */}
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col justify-center items-start gap-2">
                    <Crown className="h-8 w-8 text-yellow-500" />
                    <span className="font-black text-4xl text-stone-700">120</span>
                    <p className="font-bold text-stone-400 uppercase tracking-widest text-sm">Palavras Dominadas</p>
                </div>
            </div>
        </div>
    );
};