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
    updateUserInfo
} from "@/db/queries";

export const onChallengeComplete = async (challengeId: number) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Mark challenge as complete
    await upsertChallengeProgress(challengeId);

    // Add 10 XP for correct answer
    await addPoints(10);

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/leaderboard");

    return { success: true };
};

export const onChallengeWrong = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Lose 1 heart for wrong answer
    const result = await reduceHearts();

    revalidatePath("/learn");
    revalidatePath("/lesson");

    return result;
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

export const onRefillHearts = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    await refillHearts();

    revalidatePath("/learn");
    revalidatePath("/shop");

    return { success: true };
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
