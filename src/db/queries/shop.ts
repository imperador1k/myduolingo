import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { db } from "../drizzle";
import { userProgress } from "../schema";
import { getUserProgress } from "./users";

export const buyXpBoost = async () => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const currentProgress = await getUserProgress();
    if (!currentProgress) return { error: "User progress not found" };

    const cost = 150;
    if (currentProgress.points < cost) return { error: "not_enough_xp", required: cost, current: currentProgress.points };

    const [updatedProgress] = await db
        .update(userProgress)
        .set({ 
            xpBoostLessons: sql`${userProgress.xpBoostLessons} + 5`, 
            points: sql`${userProgress.points} - ${cost}` 
        })
        .where(eq(userProgress.userId, userId))
        .returning({ xpBoostLessons: userProgress.xpBoostLessons, points: userProgress.points });

    return { xpBoostLessons: updatedProgress.xpBoostLessons, points: updatedProgress.points };
};

export const buyHeartShield = async () => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const currentProgress = await getUserProgress();
    if (!currentProgress) return { error: "User progress not found" };

    const cost = 100;
    if (currentProgress.points < cost) return { error: "not_enough_xp", required: cost, current: currentProgress.points };

    const [updatedProgress] = await db
        .update(userProgress)
        .set({ 
            heartShields: sql`${userProgress.heartShields} + 1`, 
            points: sql`${userProgress.points} - ${cost}` 
        })
        .where(eq(userProgress.userId, userId))
        .returning({ heartShields: userProgress.heartShields, points: userProgress.points });

    return { heartShields: updatedProgress.heartShields, points: updatedProgress.points };
};

export const buyStreakFreeze = async () => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const currentProgress = await getUserProgress();
    if (!currentProgress) return { error: "User progress not found" };

    const cost = 300;
    if (currentProgress.points < cost) return { error: "not_enough_xp", required: cost, current: currentProgress.points };

    const [updatedProgress] = await db
        .update(userProgress)
        .set({ 
            streakFreezes: sql`${userProgress.streakFreezes} + 1`, 
            points: sql`${userProgress.points} - ${cost}` 
        })
        .where(eq(userProgress.userId, userId))
        .returning({ streakFreezes: userProgress.streakFreezes, points: userProgress.points });

    return { streakFreezes: updatedProgress.streakFreezes, points: updatedProgress.points };
};

export const consumeHeartShield = async () => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const currentProgress = await getUserProgress();
    if (!currentProgress) return { error: "User progress not found" };

    const shields = currentProgress.heartShields || 0;
    if (shields > 0) {
        const [updatedProgress] = await db
            .update(userProgress)
            .set({ heartShields: sql`${userProgress.heartShields} - 1` })
            .where(eq(userProgress.userId, userId))
            .returning({ heartShields: userProgress.heartShields });
        return { shieldUsed: true, shieldsRemaining: updatedProgress.heartShields };
    }
    return { shieldUsed: false, shieldsRemaining: 0 };
};

export const consumeXpBoost = async () => {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const currentProgress = await getUserProgress();
    if (!currentProgress) return { error: "User progress not found" };

    const boostLessons = currentProgress.xpBoostLessons || 0;
    if (boostLessons > 0) {
        const [updatedProgress] = await db
            .update(userProgress)
            .set({ xpBoostLessons: sql`${userProgress.xpBoostLessons} - 1` })
            .where(eq(userProgress.userId, userId))
            .returning({ xpBoostLessons: userProgress.xpBoostLessons });
        return { boostActive: true, boostRemaining: updatedProgress.xpBoostLessons };
    }
    return { boostActive: false, boostRemaining: 0 };
};
