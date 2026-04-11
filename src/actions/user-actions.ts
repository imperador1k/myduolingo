"use server";

import { followUser, unfollowUser, markNotificationAsRead } from "@/db/queries";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { notifications } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, inArray } from "drizzle-orm";

export const markNotificationsAsRead = async (category?: string) => {
    const { userId } = await auth();
    if (!userId) return;

    let targetTypes: string[] | null = null;
    if (category === "messages") targetTypes = ["message"];
    if (category === "social") targetTypes = ["follow", "streak"]; // extend as needed

    const conditions = [
        eq(notifications.userId, userId),
        eq(notifications.read, false)
    ];

    if (targetTypes) {
        conditions.push(inArray(notifications.type, targetTypes));
    }

    await db.update(notifications)
        .set({ read: true })
        .where(and(...conditions));

    revalidatePath("/notifications");
    revalidatePath("/"); // Update sidebar badge everywhere
};

export const deleteAllNotifications = async (category?: string) => {
    const { userId } = await auth();
    if (!userId) return;

    let targetTypes: string[] | null = null;
    if (category === "messages") targetTypes = ["message"];
    if (category === "social") targetTypes = ["follow", "streak"]; 

    const conditions = [
        eq(notifications.userId, userId)
    ];

    if (targetTypes) {
        conditions.push(inArray(notifications.type, targetTypes));
    }

    await db.delete(notifications).where(and(...conditions));

    revalidatePath("/notifications");
    revalidatePath("/");
};

export const onFollow = async (id: string) => {
    try {
        await followUser(id);
        revalidatePath(`/profile/${id}`);
        revalidatePath("/friends");
        revalidatePath("/leaderboard");
    } catch (error) {
        console.error("Follow error:", error);
    }
};

export const onUnfollow = async (id: string) => {
    try {
        await unfollowUser(id);
        revalidatePath(`/profile/${id}`);
        revalidatePath("/friends");
        revalidatePath("/leaderboard");
    } catch (error) {
        console.error("Unfollow error:", error);
    }
};

export const onSearchUsers = async (query: string) => {
    // We can reuse the query logic but need to import it or reimplement.
    // Importing 'searchUsers' from queries.ts is fine as this is a Server Action file.
    if (!query) return [];
    try {
        const { searchUsers } = await import("@/db/queries");
        return await searchUsers(query);
    } catch (error) {
        return [];
    }
};

export const onMarkNotificationAsRead = async (id: number) => {
    try {
        await markNotificationAsRead(id);
        revalidatePath("/notifications");
        revalidatePath("/"); // Update global unread badges
    } catch (error) {
        console.error("Mark notification as read error:", error);
    }
};

export const onGiveHighFive = async (activityId: number) => {
    try {
        const { giveHighFive } = await import("@/db/queries");
        await giveHighFive(activityId);
        revalidatePath("/friends");
    } catch (error) {
        console.error("Give high five error:", error);
    }
};
