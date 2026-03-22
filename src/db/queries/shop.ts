import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "../drizzle";
import { userProgress } from "../schema";
import { getUserProgress } from "./users";

export const buyXpBoost = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");

    const cost = 150;
    if (currentProgress.points < cost) return { error: "not_enough_xp", required: cost, current: currentProgress.points };

    const currentBoost = currentProgress.xpBoostLessons || 0;
    await db
        .update(userProgress)
        .set({ xpBoostLessons: currentBoost + 5, points: currentProgress.points - cost })
        .where(eq(userProgress.userId, userId));

    return { xpBoostLessons: currentBoost + 5, points: currentProgress.points - cost };
};

export const buyHeartShield = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");

    const cost = 100;
    if (currentProgress.points < cost) return { error: "not_enough_xp", required: cost, current: currentProgress.points };

    const currentShields = currentProgress.heartShields || 0;
    await db
        .update(userProgress)
        .set({ heartShields: currentShields + 1, points: currentProgress.points - cost })
        .where(eq(userProgress.userId, userId));

    return { heartShields: currentShields + 1, points: currentProgress.points - cost };
};

export const buyStreakFreeze = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");

    const cost = 300;
    if (currentProgress.points < cost) return { error: "not_enough_xp", required: cost, current: currentProgress.points };

    const currentFreezes = currentProgress.streakFreezes || 0;
    await db
        .update(userProgress)
        .set({ streakFreezes: currentFreezes + 1, points: currentProgress.points - cost })
        .where(eq(userProgress.userId, userId));

    return { streakFreezes: currentFreezes + 1, points: currentProgress.points - cost };
};

export const consumeHeartShield = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");

    const shields = currentProgress.heartShields || 0;
    if (shields > 0) {
        await db.update(userProgress).set({ heartShields: shields - 1 }).where(eq(userProgress.userId, userId));
        return { shieldUsed: true, shieldsRemaining: shields - 1 };
    }
    return { shieldUsed: false, shieldsRemaining: 0 };
};

export const consumeXpBoost = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const currentProgress = await getUserProgress();
    if (!currentProgress) throw new Error("User progress not found");

    const boostLessons = currentProgress.xpBoostLessons || 0;
    if (boostLessons > 0) {
        await db.update(userProgress).set({ xpBoostLessons: boostLessons - 1 }).where(eq(userProgress.userId, userId));
        return { boostActive: true, boostRemaining: boostLessons - 1 };
    }
    return { boostActive: false, boostRemaining: 0 };
};
