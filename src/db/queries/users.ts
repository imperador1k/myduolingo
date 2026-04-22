import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { eq, and, inArray, sql, gte } from "drizzle-orm";
import { db } from "../drizzle";
import { userProgress, userDailyStats, courses, userVocabulary, challengeProgress, challengeMistakes } from "../schema";
import { subDays, format, startOfWeek } from "date-fns";
import { createNotification } from "@/lib/notifications";
import { checkSubscription } from "@/lib/subscription";

export const getUserAnalytics = cache(async () => {
    const { userId } = await auth();
    if (!userId) return null;

    const progress = await getUserProgress();
    if (!progress) return null;

    const today = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => format(subDays(today, 6 - i), 'yyyy-MM-dd'));

    const dailyData = await db.query.userDailyStats.findMany({
        where: eq(userDailyStats.userId, userId)
    });

    const weeklyData = last7Days.map(dateStr => {
        const found = dailyData.find(d => d.date === dateStr);
        return {
            date: dateStr,
            xp: found ? found.xpGained : 0,
            lessons: found ? found.lessonsCompleted : 0
        };
    });

    const heatmapData = Array.from({ length: 364 }).map((_, i) => {
        // We start from today and go back 363 days
        const dateStr = format(subDays(today, 363 - i), 'yyyy-MM-dd');
        const found = dailyData.find(d => d.date === dateStr);
        return {
            date: dateStr,
            xp: found ? found.xpGained : 0
        };
    });

    const activeDays = weeklyData.filter(d => d.xp > 0).length;

    // Calculate Palavras Dominadas (Mastered Words)
    const vocabularyList = await db.query.userVocabulary.findMany({
        where: eq(userVocabulary.userId, userId),
        columns: { id: true }
    });
    const wordsMastered = vocabularyList.length;

    // Calculate Precisão (Accuracy)
    const completedChallenges = await db.query.challengeProgress.findMany({
        where: and(
            eq(challengeProgress.userId, userId),
            eq(challengeProgress.completed, true)
        ),
        columns: { id: true }
    });
    const correctCount = completedChallenges.length;

    const mistakes = await db.query.challengeMistakes.findMany({
        where: eq(challengeMistakes.userId, userId),
        columns: { id: true }
    });
    const mistakeCount = mistakes.length;

    const totalAttempts = correctCount + mistakeCount;
    let accuracy = 100;
    if (totalAttempts > 0) {
        accuracy = Math.round((correctCount / totalAttempts) * 100);
    }

    return {
        totalXp: progress.totalXpEarned,
        hearts: progress.hearts,
        lessonsCompleted: weeklyData.reduce((acc, curr) => acc + curr.lessons, 0),
        activeDays,
        weeklyData,
        heatmapData,
        streak: progress.streak,
        longestStreak: progress.longestStreak,
        wordsMastered,
        accuracy
    };
});

export const getUserProgress = cache(async () => {
    const { userId } = await auth();
    if (!userId) return null;

    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        with: { activeCourse: true },
    });

    if (!data) return null;

    const REGEN_MS = 5 * 60 * 60 * 1000;
    if (data.hearts < 5 && data.lastHeartChange) {
        const elapsed = Date.now() - new Date(data.lastHeartChange).getTime();
        if (elapsed >= REGEN_MS) {
            await db
                .update(userProgress)
                .set({ hearts: 5, lastHeartChange: new Date() })
                .where(eq(userProgress.userId, userId));
            (data as any).hearts = 5;
            (data as any).lastHeartChange = new Date();
        }
    }
    return data;
});

import { calculateIsPro } from "@/lib/subscription";

export const getUserProgressById = cache(async (userId: string) => {
    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        with: { 
            activeCourse: true,
            subscription: true,
        },
    });
    
    if (!data) return null;

    return {
        ...data,
        isPro: calculateIsPro(data.subscription),
    };
});

export const createUserProgress = async (courseId: number) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const [existingProgress, course] = await Promise.all([
        db.query.userProgress.findFirst({ where: eq(userProgress.userId, userId) }),
        db.query.courses.findFirst({ where: eq(courses.id, courseId) }),
    ]);

    if (!course) throw new Error("Course not found");

    if (existingProgress) {
        await db
            .update(userProgress)
            .set({ activeCourseId: courseId, activeLanguage: course.language })
            .where(eq(userProgress.userId, userId));
        return { ...existingProgress, activeCourseId: courseId, activeLanguage: course.language };
    }

    const [newProgress] = await db
        .insert(userProgress)
        .values({
            userId,
            userName: "Estudante",
            userImageSrc: "/mascot.svg",
            activeCourseId: courseId,
            activeLanguage: course.language,
            hearts: 5,
            points: 0,
        })
        .returning();

    return newProgress;
};

export const updateUserInfo = async (name: string, imageUrl: string) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    await db
        .update(userProgress)
        .set({ userName: name || "Estudante", userImageSrc: imageUrl || "/mascot.svg" })
        .where(eq(userProgress.userId, userId));
};

export const reduceHearts = async () => {
    const isPro = await checkSubscription();
    if (isPro) {
        return { error: "pro" };
    }

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");
    if (currentProgress.hearts <= 0) return { error: "hearts" };

    await db
        .update(userProgress)
        .set({ hearts: currentProgress.hearts - 1, lastHeartChange: new Date() })
        .where(eq(userProgress.userId, userId));
    return { hearts: currentProgress.hearts - 1 };
};

export const addPoints = async (amount: number) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");

    const currentTotalXp = currentProgress.totalXpEarned || 0;
    await db
        .update(userProgress)
        .set({ points: currentProgress.points + amount, totalXpEarned: currentTotalXp + amount })
        .where(eq(userProgress.userId, userId));
    return { points: currentProgress.points + amount, totalXpEarned: currentTotalXp + amount };
};

export const refillHearts = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");

    if (currentProgress.hearts > 0) return { error: "has_hearts", hearts: currentProgress.hearts };
    const cost = 100;
    if (currentProgress.points < cost) return { error: "not_enough_xp", required: cost, current: currentProgress.points };

    await db
        .update(userProgress)
        .set({ hearts: 5, points: currentProgress.points - cost })
        .where(eq(userProgress.userId, userId));

    createNotification(userId, "system", "Corações restaurados! Estás pronto para aprender. ❤️", "/learn").catch(console.error);
    return { hearts: 5, points: currentProgress.points - cost };
};

export const buyOneHeart = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");

    if (currentProgress.hearts >= 5) return { error: "hearts_full", hearts: currentProgress.hearts };
    const cost = 20;
    if (currentProgress.points < cost) return { error: "not_enough_xp", required: cost, current: currentProgress.points };

    await db
        .update(userProgress)
        .set({ hearts: currentProgress.hearts + 1, points: currentProgress.points - cost })
        .where(eq(userProgress.userId, userId));
    return { hearts: currentProgress.hearts + 1, points: currentProgress.points - cost };
};

export const updateStreak = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");

    const today = new Date().toISOString().split('T')[0];
    const lastStreakDate = currentProgress.lastStreakDate;
    let newStreak = currentProgress.streak || 0;
    let newLongestStreak = currentProgress.longestStreak || 0;

    if (lastStreakDate === today) {
        return { streak: newStreak, longestStreak: newLongestStreak, updated: false, streakExtended: newStreak > 0 };
    }

    if (lastStreakDate) {
        const lastDate = new Date(lastStreakDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            newStreak += 1;
        } else if (diffDays > 1) {
            const freezes = currentProgress.streakFreezes || 0;
            if (diffDays === 2 && freezes > 0) {
                newStreak += 1;
                await db.update(userProgress).set({ streakFreezes: freezes - 1 }).where(eq(userProgress.userId, userId));
            } else {
                newStreak = 1;
            }
        }
    } else {
        newStreak = 1;
    }

    await db.update(userProgress).set({
        streak: newStreak,
        longestStreak: Math.max(newStreak, newLongestStreak),
        lastStreakDate: today,
    }).where(eq(userProgress.userId, userId));

    return { streak: newStreak, longestStreak: Math.max(newStreak, newLongestStreak), updated: true, streakExtended: newStreak > 0 };
};

export const checkStreakReset = async () => {
    const { userId } = await auth();
    if (!userId) return { streakLost: false };
    const currentProgress = await getUserProgress();
    if (!currentProgress || currentProgress.streak === 0 || !currentProgress.lastStreakDate) return { streakLost: false };

    const today = new Date().toISOString().split('T')[0];
    const diffDays = Math.floor((new Date(today).getTime() - new Date(currentProgress.lastStreakDate).getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
        const lostStreak = currentProgress.streak;
        await db.update(userProgress).set({ streak: 0 }).where(eq(userProgress.userId, userId));
        return { streakLost: true, days: lostStreak };
    }
    return { streakLost: false };
};

/**
 * Calculates the weekly leaderboard by summing XP from `userDailyStats`
 * since Monday 00:00 of the current week.
 *
 * Uses a LEFT JOIN so users with zero activity this week still appear
 * with weeklyXp = 0 instead of being omitted entirely.
 */
export const getWeeklyLeaderboard = cache(async () => {
    // Monday of the current week, in YYYY-MM-DD format (locale-agnostic, week starts Monday)
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    const rows = await db
        .select({
            userId: userProgress.userId,
            userName: userProgress.userName,
            userImageSrc: userProgress.userImageSrc,
            league: userProgress.league,
            // SUM xpGained for this week only; COALESCE ensures 0 fallback
            weeklyXp: sql<number>`COALESCE(SUM(CASE WHEN ${userDailyStats.date} >= ${weekStart} THEN ${userDailyStats.xpGained} ELSE 0 END), 0)`,
        })
        .from(userProgress)
        .leftJoin(userDailyStats, eq(userProgress.userId, userDailyStats.userId))
        .groupBy(
            userProgress.userId,
            userProgress.userName,
            userProgress.userImageSrc,
            userProgress.league,
        )
        .orderBy(sql`COALESCE(SUM(CASE WHEN ${userDailyStats.date} >= ${weekStart} THEN ${userDailyStats.xpGained} ELSE 0 END), 0) DESC`)
        .limit(50);

    return rows;
});

/**
 * Fetches the weekly leaderboard for a specific league tier.
 * Used exclusively by the cron job — NOT cached, as it must reflect
 * real-time data at the moment of the weekly reset.
 *
 * @param league - e.g. 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'
 */
export const getWeeklyLeaderboardByLeague = async (league: string) => {
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    const rows = await db
        .select({
            userId: userProgress.userId,
            weeklyXp: sql<number>`COALESCE(SUM(CASE WHEN ${userDailyStats.date} >= ${weekStart} THEN ${userDailyStats.xpGained} ELSE 0 END), 0)`,
        })
        .from(userProgress)
        .leftJoin(userDailyStats, eq(userProgress.userId, userDailyStats.userId))
        .where(eq(userProgress.league, league))
        .groupBy(userProgress.userId)
        .orderBy(sql`COALESCE(SUM(CASE WHEN ${userDailyStats.date} >= ${weekStart} THEN ${userDailyStats.xpGained} ELSE 0 END), 0) DESC`);

    return rows;
};
