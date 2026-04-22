"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const clearLeagueResult = async () => {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    await db
        .update(userProgress)
        .set({
            lastWeekResult: null,
        })
        .where(eq(userProgress.userId, userId));

    revalidatePath("/leaderboard");
    revalidatePath("/");
};
