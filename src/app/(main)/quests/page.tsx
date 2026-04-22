import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { userProgress, userDailyStats } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getDailyQuests, getQuestProgress } from "@/lib/quests";
import { ACHIEVEMENTS } from "@/constants/achievements";

import { BookOpen, Check, Crown, Flame, Shield, Star, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChestClient } from "./chest-client";

// Map string icon references to Lucide components
const IconMap: Record<string, React.ElementType> = {
    zap: Zap,
    target: Target,
    flame: Flame,
    shield: Shield,
    star: Star,
    crown: Crown,
    book: BookOpen
};

export const dynamic = "force-dynamic";

export default function QuestsPage() {
    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-16 pb-32">
            {/* Header (Synchronous) */}
            <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-stone-700 uppercase">
                    Missões e Troféus
                </h1>
                <p className="text-stone-400 font-bold text-lg">
                    Completa missões diárias e domina a sala das tuas conquistas.
                </p>
            </div>

            <Suspense fallback={<QuestsSkeleton />}>
                <QuestsData />
            </Suspense>
        </div>
    );
}

async function QuestsData() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    // Fetch user progress
    const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
    });

    if (!progress) {
        redirect("/");
    }

    // Fetch today's stats for Daily Quests
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStats = await db.query.userDailyStats.findFirst({
        where: and(
            eq(userDailyStats.userId, userId),
            eq(userDailyStats.date, todayStr)
        )
    });

    // 1. Generate Deterministic Daily Quests
    const dailyQuests = getDailyQuests(userId, todayStr).map(quest => {
        const current = getQuestProgress(quest.type, todayStats ?? undefined);
        return {
            ...quest,
            current
        };
    });

    const completedQuestsCount = dailyQuests.filter(q => q.current >= q.target).length;

    // 2. Evaluate Achievements
    const evaluatedAchievements = ACHIEVEMENTS.map(achievement => {
        return {
            ...achievement,
            unlocked: achievement.condition(progress)
        };
    });

    // Sort achievements: Unlocked first, then by title (or keep original order for locked)
    const sortedAchievements = [...evaluatedAchievements].sort((a, b) => {
        if (a.unlocked === b.unlocked) return 0;
        return a.unlocked ? -1 : 1;
    });

    return (
        <>
            {/* Section 1: Daily Quests */}
            <section className="space-y-6">
                <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
                    
                    {/* Baú Header (Client Interactive Component) */}
                    <ChestClient 
                        completedQuestsCount={completedQuestsCount} 
                        chestClaimed={todayStats?.chestClaimed ?? false} 
                    />

                    {/* Quest Items list */}
                    <div className="flex flex-col">
                        {dailyQuests.map((quest, idx) => {
                            const isCompleted = quest.current >= quest.target;
                            const percent = Math.min((quest.current / quest.target) * 100, 100);
                            const IconComponent = IconMap[quest.iconType] || Star;

                            return (
                                <div key={quest.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b-2 border-stone-100 last:border-0 group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-14 w-14 shrink-0 rounded-2xl border-2 border-b-4 flex items-center justify-center transition-transform group-hover:scale-105",
                                            isCompleted ? "bg-emerald-100 border-emerald-200" : cn(quest.bgColor, quest.borderColor)
                                        )}>
                                            {isCompleted ? (
                                                <Check className="h-6 w-6 text-emerald-500" strokeWidth={4} />
                                            ) : (
                                                <IconComponent className={cn("h-6 w-6", quest.borderColor.replace("border-", "text-").replace("-200", "-500").replace("-300", "-600"))} />
                                            )}
                                        </div>
                                        <h3 className={cn(
                                            "font-black text-lg",
                                            isCompleted ? "text-emerald-500" : "text-stone-700"
                                        )}>
                                            {quest.title}
                                        </h3>
                                    </div>
                                    
                                    <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto mt-2 sm:mt-0">
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="flex-1 sm:w-40 h-6 bg-stone-200 rounded-full overflow-hidden border-2 border-stone-300 relative shadow-inner">
                                                <div 
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        isCompleted ? "bg-[#58CC02] border-r-2 border-[#46a302]" : "bg-[#FFC800] border-r-2 border-amber-500"
                                                    )}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className={cn(
                                                "font-black text-sm min-w-[45px] text-right",
                                                isCompleted ? "text-[#58CC02]" : "text-stone-400"
                                            )}>
                                                {quest.current}/{quest.target}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section 2: Trophy Room */}
            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-3 px-2 mb-8">
                    <Crown className="h-8 w-8 text-amber-500 fill-amber-200" />
                    <h2 className="text-2xl font-black text-stone-700 uppercase">
                        Sala de Troféus
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {sortedAchievements.map((trophy, index) => {
                        if (trophy.unlocked) {
                            return (
                                <div key={index} className="bg-gradient-to-b from-yellow-50 to-amber-50/50 border-2 border-amber-200 border-b-8 rounded-3xl p-6 flex flex-col items-center text-center transition-all hover:border-b-[6px] hover:translate-y-[2px] cursor-pointer group shadow-sm">
                                    <div className="text-6xl mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] group-hover:scale-110 transition-transform duration-300 relative">
                                        {trophy.icon}
                                        {/* Sparkles effect container */}
                                        <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-0 group-hover:opacity-100 animate-pulse bg-cover pointer-events-none mix-blend-screen" />
                                    </div>
                                    <h3 className="font-black text-xl md:text-2xl text-amber-700 tracking-tight leading-tight mb-2">{trophy.title}</h3>
                                    <p className="text-xs font-bold text-amber-600/80 leading-relaxed">{trophy.description}</p>
                                </div>
                            );
                        } else {
                            return (
                                <div key={index} className="bg-stone-50 border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col items-center text-center grayscale opacity-60 hover:opacity-80 transition-opacity cursor-not-allowed group">
                                    <div className="text-5xl md:text-6xl mb-4 opacity-50 group-hover:opacity-80 transition-opacity drop-shadow-sm">
                                        {trophy.icon}
                                    </div>
                                    <h3 className="font-black text-lg md:text-xl text-stone-500 tracking-tight leading-tight mb-2">{trophy.title}</h3>
                                    <div className="mt-auto px-3 py-1.5 bg-stone-200 rounded-lg border-2 border-stone-300">
                                        <p className="text-[10px] uppercase tracking-widest font-black text-stone-500 leading-tight">
                                            Bloqueado
                                        </p>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            </section>
        </>
    );
}

// --- SKELETON FALLBACK ---
const QuestsSkeleton = () => {
    return (
        <div className="animate-in fade-in duration-500 w-full space-y-6">
            {/* Daily Quests Skeleton */}
            <section className="space-y-6">
                <div className="bg-stone-50 border-2 border-stone-200 border-b-8 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-sm">
                    {/* Chest Header Skeleton */}
                    <div className="flex flex-col items-center justify-center mb-8 border-b-2 border-stone-100 pb-8">
                        <div className="w-24 h-24 bg-stone-200 rounded-3xl mb-4 animate-pulse" />
                        <div className="h-6 w-48 bg-stone-200 rounded-lg animate-pulse mb-2" />
                        <div className="h-4 w-32 bg-stone-200 rounded-md animate-pulse" />
                    </div>

                    {/* Quest Items list Skeleton */}
                    <div className="flex flex-col">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-b-2 border-stone-100 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-stone-200 border-2 border-stone-300 border-b-4 animate-pulse" />
                                    <div className="h-6 w-32 bg-stone-200 rounded-md animate-pulse" />
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="flex-1 sm:w-40 h-6 bg-stone-200 rounded-full border-2 border-stone-300 animate-pulse" />
                                        <div className="h-5 w-10 bg-stone-200 rounded-md animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trophy Room Skeleton */}
            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-3 px-2 mb-8">
                    <div className="h-8 w-8 rounded-full bg-stone-200 animate-pulse" />
                    <div className="h-8 w-48 bg-stone-200 rounded-lg animate-pulse" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-stone-50 border-2 border-stone-200 border-b-8 rounded-3xl p-6 flex flex-col items-center text-center h-[220px]">
                            <div className="w-16 h-16 bg-stone-200 rounded-full mb-4 animate-pulse" />
                            <div className="h-6 w-24 bg-stone-200 rounded-md mb-2 animate-pulse" />
                            <div className="h-4 w-32 bg-stone-200 rounded-md mb-1 animate-pulse" />
                            <div className="h-4 w-20 bg-stone-200 rounded-md animate-pulse" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
