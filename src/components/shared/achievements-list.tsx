"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export const AchievementsList = ({ achievements, userProgress }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    // Categorization logic parsing descriptions
    const categories = {
        "Sábio": achievements.filter(a => a.description.includes("XP")),
        "Incansável": achievements.filter(a => a.description.includes("Streak")),
        "Colecionador": achievements.filter(a => !a.description.includes("XP") && !a.description.includes("Streak")),
    };

    const extractTargetValue = (desc: string) => {
        const numStr = desc.replace(/\./g, "").match(/\d+/);
        return numStr ? parseInt(numStr[0]) : 1;
    };

    const getProgressValue = (category: string) => {
        if (category === "Sábio") return userProgress.totalXpEarned || userProgress.points || 0;
        if (category === "Incansável") return userProgress.longestStreak || 0;
        // Approximation for collectors (like shields/hearts/boosts)
        return userProgress.hearts || 1; 
    };

    const renderAchievementGroup = (title: string, items: AchievementItem[], limit?: number) => {
        const displayedItems = limit && !isExpanded ? items.slice(0, limit) : items;
        if (displayedItems.length === 0) return null;

        return (
            <div className="mb-8" key={title}>
                <h3 className="text-lg font-extrabold text-slate-700 mb-4">{title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedItems.map((achievement, i) => {
                        const target = extractTargetValue(achievement.description);
                        const current = Math.min(getProgressValue(title), target);
                        const progressPercent = Math.round((current / target) * 100);

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-300",
                                    achievement.unlocked
                                        ? "border-amber-200 bg-amber-50 shadow-sm hover:shadow-md hover:-translate-y-1"
                                        : "border-slate-200 bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl shadow-sm transition-all",
                                    achievement.unlocked ? "bg-white border-2 border-amber-100" : "bg-slate-200 grayscale opacity-60"
                                )}>
                                    {achievement.icon}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className={cn("font-bold truncate", achievement.unlocked ? "text-amber-700" : "text-slate-600")}>
                                        {achievement.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 truncate mb-2">
                                        {achievement.description}
                                    </p>
                                    
                                    {!achievement.unlocked && (
                                        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden mt-1 relative">
                                            <div 
                                                className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white mix-blend-difference">
                                                {current} / {target}
                                            </span>
                                        </div>
                                    )}
                                    {achievement.unlocked && (
                                        <div className="inline-flex text-[10px] font-black tracking-widest text-amber-500 uppercase px-2 py-0.5 bg-amber-100 rounded-md">
                                            Completado
                                        </div>
                                    )}
                                </div>

                                {/* Gamified Glow Hover if unlocked */}
                                {achievement.unlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] hover:animate-[shimmer_1.5s_infinite] pointer-events-none rounded-2xl" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="mb-10 w-full animate-in fade-in duration-700">
            <div className="mb-6 flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <h2 className="text-2xl font-extrabold text-slate-700 flex items-center gap-2">
                    <span className="text-3xl">🏆</span> Conquistas
                </h2>
                <div className="flex flex-col items-end">
                    <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-black tracking-wide text-amber-600">
                        {unlockedCount} de {achievements.length}
                    </span>
                </div>
            </div>
            
            <div className="flex flex-col gap-2">
                {renderAchievementGroup("Sábio", categories["Sábio"], 4)}
                {renderAchievementGroup("Incansável", categories["Incansável"], 4)}
                {renderAchievementGroup("Colecionador", categories["Colecionador"], 4)}
            </div>
            
            <div className="flex justify-center mt-6">
                <Button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="super" 
                    className="w-full md:w-auto text-white font-black uppercase tracking-wide px-10 py-6 text-sm active:scale-95 transition-transform"
                >
                    {isExpanded ? "Esconder Grelha Completa" : "Ver grelha completa de conquistas"}
                </Button>
            </div>
        </div>
    );
};
