"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
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
    consumeHeartShield,
    checkStreakReset,
    logMistake,
    resolveMistake,
    completeClinicLesson
} from "@/db/queries";

/**
 * Handles a correctly answered challenge.
 *
 * Orchestrates five side-effects in sequence:
 * 1. Marks the challenge as completed in `challenge_progress`.
 * 2. Resolves the challenge from the `challenge_mistakes` table (Heart Clinic).
 * 3. Awards XP (10 base, 20 if an active XP Boost power-up is detected).
 * 4. Updates the user's daily streak (idempotent per calendar day).
 * 5. Revalidates `/learn`, `/lesson`, `/leaderboard`, `/shop`.
 *
 * @param challengeId - The ID of the challenge that was answered correctly.
 * @returns `{ success, xpGained, boosted }` — the XP earned and whether a boost was active.
 * @throws {Error} If the user is not authenticated.
 */
export const onChallengeComplete = async (challengeId: number) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Mark challenge as complete
    await upsertChallengeProgress(challengeId);

    // Resolve from mistakes table (if it was a previous error, they mastered it now)
    await resolveMistake(challengeId);

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

/**
 * Finalises a completed lesson.
 *
 * Called once when the user finishes all challenges in a lesson.
 * Consumes one XP Boost charge (if active), updates the streak,
 * and fires a non-blocking push notification via OneSignal.
 *
 * @returns `{ success, boostConsumed, streak, streakExtended }`
 * @throws {Error} If the user is not authenticated.
 */
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

    // Update streak (ensure it counts only if not already updated today)
    // Actually, onChallengeComplete calls it too? check line 39.
    // Yes, onChallengeComplete calls updateStreak. 
    // But we want to return the status to show the modal here.
    // Calling it again is safe (checks date).
    const streakResult = await updateStreak();

    // 🏆 Congratulate user on lesson completion
    createNotification(
        userId,
        "streak",
        streakResult.streakExtended
            ? `Incrível! Ofensiva em ${streakResult.streak} dias! 🔥`
            : `Lição concluída! Continua assim! 💪`,
        "/leaderboard"
    ).catch(console.error); // Non-blocking: don't await, just fire-and-forget

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/shop");

    return {
        success: true,
        boostConsumed: hasXpBoost,
        streak: streakResult.streak,
        streakExtended: streakResult.streakExtended
    };
};

/**
 * Handles an incorrectly answered challenge.
 *
 * Implements a two-tier defence system:
 * 1. If the user owns a Heart Shield power-up, consumes one shield instead of a heart.
 * 2. Otherwise, reduces hearts by 1 and timestamps `lastHeartChange` for passive regen.
 *
 * Additionally logs the mistake in `challenge_mistakes` for the Heart Clinic feature.
 *
 * @param challengeId - Optional challenge ID to log in the mistakes table.
 * @returns `{ hearts, shieldUsed, shieldsRemaining? }` — remaining hearts and whether a shield absorbed the hit.
 * @throws {Error} If the user is not authenticated.
 */
export const onChallengeWrong = async (challengeId?: number) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Log the mistake for the Heart Clinic
    if (challengeId) {
        await logMistake(challengeId);
    }

    // Check for heart shield first
    const shieldResult = await consumeHeartShield();

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

/**
 * Selects (or switches to) a language course.
 *
 * Creates a new `user_progress` row for first-time users, or updates
 * the `activeCourseId` and `activeLanguage` for returning users.
 * Syncs Clerk profile data (name, avatar) into the DB so it can be
 * displayed on leaderboards without additional Clerk API calls.
 *
 * @param courseId - The ID of the course to activate.
 * @throws {Error} If the user is not authenticated or the course does not exist.
 */
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

/**
 * Refills all hearts to 5. Costs 100 XP.
 * Only available when hearts are at 0 to prevent abuse.
 *
 * @returns `{ hearts, points }` on success, or `{ error }` if insufficient XP or hearts > 0.
 */
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

/**
 * Purchases a single heart for 20 XP.
 * Capped at 5 hearts maximum.
 *
 * @returns `{ hearts, points }` on success, or `{ error }` if at max or insufficient XP.
 */
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

/**
 * Synchronises Clerk user metadata (name, avatar) into the local DB.
 * Designed to be called on every login to keep leaderboard data fresh
 * without requiring runtime Clerk API lookups.
 */
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

/**
 * Purchases an XP Boost power-up (150 XP → 5 lessons at 2× XP).
 * Sends a system notification on success. Charges are consumed one
 * per lesson inside `onLessonComplete`.
 */
export const onBuyXpBoost = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const result = await buyXpBoost();

    createNotification(userId, "system", "Boost de XP ativado! As próximas lições valem o dobro! ⚡", "/learn").catch(console.error);

    revalidatePath("/shop");
    revalidatePath("/learn");
    revalidatePath("/lesson");

    return result;
};

/**
 * Purchases a Heart Shield power-up (100 XP → 1 shield).
 * Shields are consumed automatically inside `onChallengeWrong`
 * before any heart is deducted.
 */
export const onBuyHeartShield = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const result = await buyHeartShield();

    createNotification(userId, "system", "Escudo de Corações equipado! A tua próxima resposta errada está protegida. 🛡️", "/learn").catch(console.error);

    revalidatePath("/shop");
    revalidatePath("/learn");

    return result;
};

/**
 * Purchases a Streak Freeze power-up (300 XP → 1 freeze).
 * Freezes are consumed automatically inside `updateStreak` when
 * exactly one calendar day is missed.
 */
export const onBuyStreakFreeze = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const result = await buyStreakFreeze();

    createNotification(userId, "system", "Escudo de Ofensiva equipado! A tua ofensiva está protegida por 1 dia. 🛡️", "/learn").catch(console.error);

    revalidatePath("/shop");
    revalidatePath("/learn");

    return result;
};

/**
 * Checks whether the user's streak has been broken due to inactivity.
 * Called on app load to trigger the streak-loss modal if applicable.
 */
export const checkStreakStatus = async () => {
    const { userId } = await auth();
    if (!userId) return { streakLost: false };

    // This query will check dates and reset if needed
    const result = await checkStreakReset();
    return result;
};

// ============ HEART CLINIC ============

/**
 * Completes a Heart Clinic remedial session.
 *
 * The Heart Clinic presents previously-missed challenges. Completing
 * one rewards the user with +1 heart (bypassing XP cost). This encourages
 * error correction over purchasing hearts in the shop.
 *
 * @returns `{ hearts }` — the user's updated heart count.
 */
export const onClinicComplete = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const result = await completeClinicLesson();

    createNotification(
        userId,
        "system",
        `Clínica concluída! Ganhaste 1 vida. Agora tens ${result.hearts} ❤️`,
        "/learn"
    ).catch(console.error);

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/shop");

    return result;
};
