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
    if (!content) return;
    try {
        await sendMessage(receiverId, content);
    } catch (error) {
        console.error("Message error:", error);
    }
};
