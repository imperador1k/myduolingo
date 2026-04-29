"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const clearLeagueResult = async () => {
    try {
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

        return { success: true };
    } catch (error) {
        console.error("[CLEAR_LEAGUE_RESULT]", error);
        return { success: false, error: "Internal Server Error" };
    }
};
