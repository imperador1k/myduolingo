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
};

export const AchievementsList = ({ achievements }: Props) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    const displayedAchievements = isExpanded ? achievements : achievements.slice(0, 6);

    return (
        <div className="mb-10">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-600">🏆 Conquistas</h2>
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-sm font-semibold text-slate-500">
                    {unlockedCount}/{achievements.length}
                </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {displayedAchievements.map((achievement, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex flex-col items-center rounded-2xl border-2 p-3 text-center transition-all",
                            achievement.unlocked
                                ? "border-amber-200 bg-amber-50"
                                : "border-slate-200 bg-slate-100 opacity-40"
                        )}
                    >
                        <span className={cn("text-3xl", !achievement.unlocked && "grayscale")}>{achievement.icon}</span>
                        <p className="mt-1 text-sm font-bold text-slate-700">{achievement.title}</p>
                        <p className="text-xs text-slate-400">{achievement.description}</p>
                    </div>
                ))}
            </div>
            
            {achievements.length > 6 && (
                <div className="flex justify-center mt-6">
                    <Button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        variant="primary" 
                        className="w-full md:w-auto text-white font-black uppercase tracking-wide px-10 py-6 text-sm"
                    >
                        {isExpanded ? "Mostrar Menos" : "Ver todas as conquistas"}
                    </Button>
                </div>
            )}
        </div>
    );
};
