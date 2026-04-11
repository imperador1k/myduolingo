"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type AchievementItem = {
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
};

type Props = {
    achievements: AchievementItem[];
    userProgress: any;
};

import { Zap, Trophy, Flame, Target, Star } from "lucide-react";

export const AchievementsList = ({ achievements, userProgress }: Props) => {
    const [mounted, setMounted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    // Categorization logic parsing descriptions
    const categories = {
        "Mestre de XP": achievements.filter(a => a.description.includes("XP")),
        "Série de Fogo": achievements.filter(a => a.description.includes("Streak")),
        "Colecionador": achievements.filter(a => !a.description.includes("XP") && !a.description.includes("Streak")),
    };

    const extractTargetValue = (desc: string) => {
        const numStr = desc.replace(/\./g, "").match(/\d+/);
        return numStr ? parseInt(numStr[0]) : 1;
    };

    const getProgressValue = (category: string) => {
        if (category === "Mestre de XP") return userProgress.totalXpEarned || userProgress.points || 0;
        if (category === "Série de Fogo") return userProgress.longestStreak || 0;
        return userProgress.hearts || 1; 
    };

    const renderAchievementGroup = (title: string, items: AchievementItem[], limit?: number) => {
        const displayedItems = limit && !isExpanded ? items.slice(0, limit) : items;
        if (displayedItems.length === 0) return null;

        const CategoryIcon = title === "Mestre de XP" ? Zap : title === "Série de Fogo" ? Flame : Star;

        return (
            <div className="mb-10" key={title}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-stone-100 rounded-xl border-2 border-stone-200 border-b-4">
                        <CategoryIcon className="h-5 w-5 text-stone-600" />
                    </div>
                    <h3 className="text-xl font-black text-stone-700 uppercase tracking-tight">{title}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedItems.map((achievement, i) => {
                        const target = extractTargetValue(achievement.description);
                        const current = Math.min(getProgressValue(title), target);
                        const progressPercent = Math.round((current / target) * 100);

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "group relative flex items-center gap-5 rounded-[2.5rem] border-2 p-6 transition-all duration-300",
                                    achievement.unlocked
                                        ? "border-amber-200 bg-white border-b-8 shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:border-b-0 active:mb-[8px]"
                                        : "border-stone-200 bg-stone-50/50 border-b-8 grayscale opacity-70"
                                )}
                            >
                                <div className={cn(
                                    "flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] text-4xl shadow-sm transition-all border-2",
                                    achievement.unlocked 
                                        ? "bg-amber-50 border-amber-100 border-b-4 text-amber-500 group-hover:bounce" 
                                        : "bg-stone-200 border-stone-300 text-stone-400"
                                )}>
                                    {achievement.icon}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className={cn("font-black text-xl tracking-tight leading-none mb-1", achievement.unlocked ? "text-stone-700" : "text-stone-500")}>
                                        {achievement.title}
                                    </h4>
                                    <p className="text-sm font-bold text-stone-400 truncate mb-3">
                                        {achievement.description}
                                    </p>
                                    
                                    {!achievement.unlocked && (
                                        <div className="w-full h-4 rounded-full bg-stone-200 overflow-hidden mt-1 relative border border-stone-300 shadow-inner">
                                            <div 
                                                className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out border-r-2 border-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference tracking-widest">
                                                {mounted ? `${current.toLocaleString()} / ${target.toLocaleString()}` : ""}
                                            </span>
                                        </div>
                                    )}
                                    {achievement.unlocked && (
                                        <div className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest text-emerald-500 uppercase px-3 py-1 bg-emerald-50 rounded-xl border-2 border-emerald-100">
                                            <Star className="h-3 w-3 fill-emerald-500" />
                                            Completado
                                        </div>
                                    )}
                                </div>

                                {/* Unlocking Glow */}
                                {achievement.unlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_2s_infinite] pointer-events-none rounded-[2.5rem]" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="mb-10 w-full animate-in fade-in duration-700 delay-300">
            <div className="mb-8 flex flex-col sm:flex-row items-center justify-between border-b-4 border-stone-100 pb-6 gap-6 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
                    <div className="h-14 w-14 bg-amber-100 rounded-2xl flex items-center justify-center border-2 border-amber-200 border-b-4 shadow-sm shrink-0">
                        <Trophy className="h-8 w-8 text-amber-500 fill-amber-200" />
                    </div>
                   <div className="flex flex-col">
                        <h2 className="text-2xl sm:text-3xl font-black text-stone-700 tracking-tight uppercase leading-none">
                            Conquistas
                        </h2>
                        <p className="text-stone-400 font-bold text-sm mt-1">O teu percurso de glória</p>
                   </div>
                </div>
                <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
                    <span className="rounded-2xl bg-amber-400 border-b-4 border-amber-600 px-5 py-2 text-sm font-black tracking-wide text-white shadow-sm whitespace-nowrap">
                        {unlockedCount} / {achievements.length}
                    </span>
                </div>
            </div>
            
            <div className="flex flex-col gap-2">
                {renderAchievementGroup("Mestre de XP", categories["Mestre de XP"], 4)}
                {renderAchievementGroup("Série de Fogo", categories["Série de Fogo"], 4)}
                {renderAchievementGroup("Colecionador", categories["Colecionador"], 4)}
            </div>
            
            <div className="flex justify-center mt-10">
                <Button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="super" 
                    className="w-full md:w-auto h-auto min-h-[64px] py-4 rounded-[2rem] border-b-8 text-white font-black uppercase tracking-wider sm:tracking-widest px-4 sm:px-12 text-sm sm:text-base active:translate-y-1 active:border-b-0 transition-all shadow-lg shadow-green-500/20 whitespace-normal text-center"
                >
                    {isExpanded ? "Esconder Grelha" : "Ver grelha completa de conquistas"}
                </Button>
            </div>
        </div>
    );
};
