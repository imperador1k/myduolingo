"use server";

import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { db } from "@/db/drizzle";
import { userDailyStats } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Upserts the daily XP and lessons completed for the current authenticated user.
 * If a row for today already exists, it adds to the current totals.
 */
export const recordDailyStatsAction = async (xpGained: number, lessonsCompleted: number = 1) => {
    try {
        const { userId } = await auth();

        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Get today's local date in YYYY-MM-DD format
        const todayDate = format(new Date(), "yyyy-MM-dd");

        await db.insert(userDailyStats)
            .values({
                userId,
                date: todayDate,
                xpGained,
                lessonsCompleted,
            })
            .onConflictDoUpdate({
                target: [userDailyStats.userId, userDailyStats.date],
                set: {
                    xpGained: sql`${userDailyStats.xpGained} + ${xpGained}`,
                    lessonsCompleted: sql`${userDailyStats.lessonsCompleted} + ${lessonsCompleted}`,
                }
            });

        return { success: true };
    } catch (error) {
        console.error("[RECORD_DAILY_STATS_ERROR]", error);
        return { error: "Failed to record daily stats" };
    }
};
