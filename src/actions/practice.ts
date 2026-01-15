"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { practiceSessions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const getPracticeHistory = async () => {
    const { userId } = await auth();

    if (!userId) {
        return [];
    }

    try {
        const history = await db.query.practiceSessions.findMany({
            where: eq(practiceSessions.userId, userId),
            orderBy: [desc(practiceSessions.createdAt)],
        });

        return history;
    } catch (error) {
        console.error("Failed to get practice history:", error);
        return [];
    }
};

export const savePracticeSession = async (data: {
    type: "writing" | "speaking";
    prompt: string;
    promptData: any; // will be stringified
    userInput: string;
    feedback: any; // will be stringified
    score: number;
    audioUrl?: string; // Optional for speaking
}) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    await db.insert(practiceSessions).values({
        userId,
        type: data.type,
        prompt: data.prompt,
        promptData: JSON.stringify(data.promptData),
        userInput: data.userInput,
        feedback: JSON.stringify(data.feedback),
        score: data.score,
        audioUrl: data.audioUrl,
    });

    revalidatePath("/practice/history");
};
