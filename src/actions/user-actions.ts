"use server";

import { followUser, unfollowUser, sendMessage } from "@/db/queries";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { notifications } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export const markNotificationsAsRead = async () => {
    const { userId } = await auth();
    if (!userId) return;

    await db.update(notifications)
        .set({ read: true })
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.read, false)
            )
        );

    revalidatePath("/notifications");
    revalidatePath("/"); // Update sidebar badge everywhere
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


export const onSendMessage = async (receiverId: string, formData: FormData) => {
    const content = formData.get("content") as string;
    const type = (formData.get("type") as "text" | "image" | "file") || "text";
    const fileName = formData.get("fileName") as string | undefined;

    if (!content) return;
    try {
        await sendMessage(receiverId, content, type, fileName);
    } catch (error) {
        console.error("Message error:", error);
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
        console.error("Search error:", error);
        return [];
    }
};
