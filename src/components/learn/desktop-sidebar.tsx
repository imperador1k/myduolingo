"use client";

import { Zap, Heart, Trophy, ChevronRight, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

export const DesktopSidebar = ({
    points, hearts, streak, activeCourse, progressPct, completedLessons, totalLessons, isPro,
}: {
    points: number; hearts: number; streak: number;
    activeCourse?: { title: string; imageSrc?: string | null };
    progressPct: number; completedLessons: number; totalLessons: number;
    isPro?: boolean;
}) => {
    const dailyGoal = 200;
    const todayXp = points % dailyGoal;

    const containerVariants: Variants = {
        hidden: { opacity: 0, x: 20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { 
                staggerChildren: 0.1,
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full lg:w-[368px] relative lg:sticky lg:top-6 lg:self-start z-10 font-sans"
        >
            <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border-2 border-slate-200 border-b-[8px] p-6 shadow-xl flex flex-col gap-6 w-full text-slate-700 relative overflow-hidden">
                
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-0 opacity-50" />
                
                {/* Header / Brand */}
                <motion.div variants={itemVariants} className="flex items-center justify-between border-b-2 border-slate-100 pb-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]" />
                        <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">O Teu Progresso</h2>
                    </div>
                </motion.div>

                {/* ── Visual Metrics Grid ── */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    
                    {/* Ring XP Widget */}
                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="col-span-1 bg-white rounded-[24px] border-2 border-amber-200 border-b-[6px] shadow-sm flex flex-col items-center justify-center p-5 relative group transition-all cursor-default overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-amber-50 opacity-50" />
                        <div className="relative w-20 h-20 flex items-center justify-center mb-1">
                            {/* Background track */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-sm">
                                <circle cx="40" cy="40" r="34" className="fill-none stroke-amber-200/50 stroke-[6]" />
                                {/* Progress track */}
                                <motion.circle 
                                    initial={{ strokeDashoffset: 214 }}
                                    animate={{ strokeDashoffset: ((dailyGoal - todayXp) / dailyGoal) * 214 }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                    cx="40" 
                                    cy="40" 
                                    r="34" 
                                    className="fill-none stroke-amber-400 stroke-[6] drop-shadow-[0_2px_4px_rgba(251,191,36,0.5)]" 
                                    strokeDasharray="214"
                                    strokeLinecap="round" 
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-black text-xl tracking-tighter text-amber-500">{todayXp}</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-amber-500" /> XP Diário
                            </span>
                        </div>
                    </motion.div>

                    {/* Streak & Hearts Column */}
                    <div className="col-span-1 flex flex-col gap-4">
                        {/* Streak Box */}
                        <motion.div 
                            variants={itemVariants} 
                            whileHover={{ scale: 1.05 }}
                            className="flex-1 bg-white rounded-[20px] border-2 border-orange-200 border-b-[6px] p-3 flex flex-col justify-center relative overflow-hidden group transition-transform"
                        >
                            {streak > 0 && <div className="absolute inset-0 bg-orange-50 opacity-50 transition-colors" />}
                            <div className="relative z-10 flex items-center justify-between px-1">
                                <p className="font-black text-2xl tracking-tighter text-orange-500">{streak}</p>
                                <span className={cn("text-2xl drop-shadow-sm", streak > 0 ? "animate-pulse origin-bottom" : "grayscale opacity-50")}>
                                    {streak > 0 ? "🔥" : "💤"}
                                </span>
                            </div>
                            <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-orange-400 mt-1 px-1">Série</span>
                        </motion.div>

                        {/* Hearts Box */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            className="flex-1 bg-white rounded-[20px] border-2 border-rose-200 border-b-[6px] p-3 flex flex-col justify-center relative group transition-transform overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-rose-50 opacity-50" />
                            <div className="relative z-10 flex items-center justify-between px-1">
                                {isPro ? (
                                    <Infinity className="w-8 h-8 text-rose-500 shrink-0 stroke-[3]" />
                                ) : (
                                    <p className="font-black text-2xl tracking-tighter text-rose-500">{hearts}</p>
                                )}
                                <Heart className={cn("w-6 h-6", (isPro || hearts > 0) ? "text-rose-500 fill-rose-500 group-hover:scale-110 group-hover:animate-pulse transition-all drop-shadow-sm" : "text-slate-300")} />
                            </div>
                             <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-rose-400 mt-1 px-1">Vidas</span>
                        </motion.div>
                    </div>
                </div>

                {/* Active Course Module */}
                {activeCourse && (
                    <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="bg-white rounded-[24px] border-2 border-slate-200 border-b-[6px] p-4 flex items-center gap-4 transition-transform relative z-10 shadow-sm">
                        <div className="bg-slate-50 border-2 border-slate-200 rounded-[18px] w-14 h-14 shrink-0 flex items-center justify-center p-2 shadow-inner">
                             {activeCourse.imageSrc
                                ? <Image src={activeCourse.imageSrc} alt={activeCourse.title} width={40} height={40} className="w-full h-full object-cover" />
                                : <span className="text-2xl drop-shadow-sm">🌍</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="truncate">{activeCourse.title}</span>
                                <span className="text-emerald-500">{progressPct}%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-full border-2 border-slate-200 overflow-hidden relative shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
                                    className="absolute inset-y-0 left-0 bg-emerald-400"
                                >
                                    <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Leaderboard Portal */}
                <Link href="/leaderboard" className="block w-full relative z-10">
                    <motion.div 
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-indigo-50 rounded-[24px] border-2 border-indigo-200 border-b-[6px] p-4 flex items-center gap-4 transition-all group active:border-b-[2px] active:translate-y-[4px]"
                    >
                        <div className="bg-white border-2 border-indigo-200 rounded-[18px] w-12 h-12 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                            <Trophy className="w-6 h-6 text-indigo-400 group-hover:text-indigo-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 font-sans">
                            <h3 className="font-black text-sm uppercase tracking-wider text-indigo-500 leading-tight">Leaderboard</h3>
                            <p className="text-xs font-bold text-indigo-400 opacity-80 mt-0.5">Defende a tua glória</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-indigo-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" strokeWidth={3} />
                    </motion.div>
                </Link>

            </div>
        </motion.div>
    );
};
