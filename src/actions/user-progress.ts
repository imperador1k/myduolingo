"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
    getUserProgress,
    upsertChallengeProgress,
    reduceHearts,
    addPoints,
    createUserProgress,
    refillHearts,
    buyOneHeart,
    updateUserInfo,
    updateStreak,
    consumeXpBoost,
    useHeartShield
} from "@/db/queries";

export const onChallengeComplete = async (challengeId: number) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Mark challenge as complete
    await upsertChallengeProgress(challengeId);

    // Check for XP boost
    const userProgressData = await getUserProgress();
    const hasXpBoost = userProgressData && (userProgressData.xpBoostLessons || 0) > 0;

    // Add XP (10 normal, 20 with boost)
    const xpAmount = hasXpBoost ? 20 : 10;
    await addPoints(xpAmount);

    // Update streak (once per day)
    await updateStreak();

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/leaderboard");
    revalidatePath("/shop");

    return { success: true, xpGained: xpAmount, boosted: hasXpBoost };
};

export const onLessonComplete = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const start = Date.now();

    // Check for XP boost
    const userProgressData = await getUserProgress();
    const hasXpBoost = userProgressData && (userProgressData.xpBoostLessons || 0) > 0;

    if (hasXpBoost) {
        // Consume 1 boost lesson only at the END of the lesson
        await consumeXpBoost();
    }

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/shop");

    return { success: true, boostConsumed: hasXpBoost };
};

export const onChallengeWrong = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Check for heart shield first
    const shieldResult = await useHeartShield();

    if (shieldResult.shieldUsed) {
        // Shield protected the heart!
        revalidatePath("/learn");
        revalidatePath("/lesson");
        revalidatePath("/shop");

        const userProgressData = await getUserProgress();
        return {
            hearts: userProgressData?.hearts || 0,
            shieldUsed: true,
            shieldsRemaining: shieldResult.shieldsRemaining
        };
    }

    // No shield - lose 1 heart
    const result = await reduceHearts();

    revalidatePath("/learn");
    revalidatePath("/lesson");

    return { ...result, shieldUsed: false };
};

export const onSelectCourse = async (courseId: number) => {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    // Create or update user progress
    await createUserProgress(courseId);

    // Sync Clerk user data to DB (name and image)
    const userName = user.firstName
        ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
        : user.username || "Estudante";

    await updateUserInfo(userName, user.imageUrl || "/mascot.svg");

    revalidatePath("/learn");
    revalidatePath("/courses");
    revalidatePath("/leaderboard");

    return { success: true };
};

// Refill all hearts - costs 100 XP
export const onRefillHearts = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const result = await refillHearts();

    revalidatePath("/learn");
    revalidatePath("/shop");
    revalidatePath("/profile");

    return result;
};

// Buy one heart - costs 20 XP
export const onBuyOneHeart = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const result = await buyOneHeart();

    revalidatePath("/learn");
    revalidatePath("/shop");
    revalidatePath("/profile");

    return result;
};

// Sync user info action (can be called on login)
export const onSyncUserInfo = async () => {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const userName = user.firstName
        ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
        : user.username || "Estudante";

    await updateUserInfo(userName, user.imageUrl || "/mascot.svg");

    revalidatePath("/leaderboard");
    revalidatePath("/profile");

    return { success: true };
};

// ============ POWER-UPS ============

import { buyXpBoost, buyHeartShield, buyStreakFreeze } from "@/db/queries";

// Buy XP Boost - 50 XP for 5 lessons with double XP
export const onBuyXpBoost = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const result = await buyXpBoost();

    revalidatePath("/shop");
    revalidatePath("/learn");
    revalidatePath("/lesson");

    return result;
};

// Buy Heart Shield - 30 XP for 1 shield
export const onBuyHeartShield = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const result = await buyHeartShield();

    revalidatePath("/shop");
    revalidatePath("/learn");

    return result;
};

// Buy Streak Freeze - 40 XP for 1 freeze
export const onBuyStreakFreeze = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const result = await buyStreakFreeze();

    revalidatePath("/shop");
    revalidatePath("/learn");

    return result;
};
