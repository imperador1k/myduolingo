import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { db } from "../drizzle";
import { challengeProgress, challengeMistakes } from "../schema";

export const upsertChallengeProgress = async (challengeId: number) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const existingProgress = await db.query.challengeProgress.findFirst({
        where: eq(challengeProgress.challengeId, challengeId),
    });

    if (existingProgress) {
        await db
            .update(challengeProgress)
            .set({ completed: true })
            .where(eq(challengeProgress.id, existingProgress.id));
        return;
    }

    await db.insert(challengeProgress).values({ challengeId, userId, completed: true });
};

export const logMistake = async (challengeId: number) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const existing = await db.query.challengeMistakes.findFirst({
        where: and(eq(challengeMistakes.userId, userId), eq(challengeMistakes.challengeId, challengeId)),
    });

    if (!existing) {
        await db.insert(challengeMistakes).values({ userId, challengeId });
    }
};

export const resolveMistake = async (challengeId: number) => {
    const { userId } = await auth();
    if (!userId) return;

    await db.delete(challengeMistakes).where(and(eq(challengeMistakes.userId, userId), eq(challengeMistakes.challengeId, challengeId)));
};
