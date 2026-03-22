"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Zap, BookOpen, Flame, Activity } from "lucide-react";

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

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-2xl shadow-md border-2 border-slate-100 flex flex-col gap-1">
                <p className="font-bold text-slate-700">{label}</p>
                <p className="text-emerald-500 font-bold flex items-center gap-1">
                    <Zap className="h-4 w-4 fill-emerald-500" />
                    {payload[0].value} XP
                </p>
                <p className="text-sky-500 font-bold flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {payload[0].payload.lessons} Lições
                </p>
            </div>
        );
    }
    return null;
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* CARD 1: Energia Semanal (Chart) - Spans 2 cols on Desktop */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-6 w-6 text-emerald-500" />
                    <h2 className="text-xl font-extrabold text-slate-700">Energia Semanal</h2>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="dayName" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} 
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area
                                type="monotone"
                                dataKey="xp"
                                stroke="#10b981"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorXp)"
                                activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* CARD 2: Estatísticas Vitais (Stats Stack) - 1 col */}
            <div className="flex flex-col gap-6">
                {/* Total XP */}
                <div className="bg-emerald-50 rounded-3xl p-6 shadow-sm border-2 border-emerald-100 flex flex-col gap-2 flex-1 justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-6 w-6 fill-emerald-500 text-emerald-500 shadow-emerald-200 drop-shadow-sm" />
                        <h2 className="text-lg font-extrabold text-emerald-700">Total XP</h2>
                    </div>
                    <span className="text-4xl font-black text-emerald-600 tracking-tight">
                        {data.totalXp}
                    </span>
                    <p className="text-emerald-600/70 font-medium text-sm">Experiência acumulada</p>
                </div>

                {/* Lessons Completed (Weekly) */}
                <div className="bg-sky-50 rounded-3xl p-6 shadow-sm border-2 border-sky-100 flex flex-col gap-2 flex-1 justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-6 w-6 text-sky-500 drop-shadow-sm" />
                        <h2 className="text-lg font-extrabold text-sky-700">Lições (7D)</h2>
                    </div>
                    <span className="text-4xl font-black text-sky-600 tracking-tight">
                        {data.lessonsCompleted}
                    </span>
                    <p className="text-sky-600/70 font-medium text-sm">Concluídas nesta semana</p>
                </div>
            </div>

            {/* CARD 3: Dias de Foco (Banner) - Spans full width */}
            <div className="md:col-span-3 bg-gradient-to-r from-orange-400 to-rose-400 rounded-3xl p-6 shadow-md border-2 border-orange-200/50 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute -right-6 -top-6 opacity-20">
                    <Flame className="w-48 h-48 text-white" />
                </div>
                
                <div className="flex flex-col gap-2 z-10 text-white">
                    <div className="flex items-center gap-2">
                        <Flame className="h-8 w-8 fill-white drop-shadow-md" />
                        <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">Dias de Foco</h2>
                    </div>
                    <p className="text-white/90 font-medium text-lg max-w-md leading-tight">
                        Focaste-te em <span className="font-bold underline decoration-2 underline-offset-4">{data.activeDays} de 7 dias</span> esta semana.
                        {data.activeDays === 7 ? " Uau! Estás invencível! 🔥" : data.activeDays >= 4 ? " Bom ritmo, continua assim! 💪" : " Consegues fazer melhor, volta amanhã! ⏰"}
                    </p>
                </div>

                <div className="z-10 flex gap-2">
                    {/* Heatmap Mini-Dots */}
                    {chartData.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div 
                                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-sm shadow-sm transition-all
                                    ${d.xp > 0 
                                        ? "bg-white/20 border-white text-white backdrop-blur-sm" 
                                        : "bg-black/10 border-transparent text-white/50"}`}
                            >
                                {d.xp > 0 ? "✓" : ""}
                            </div>
                            <span className="text-xs font-bold text-white/80">{d.dayName}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
