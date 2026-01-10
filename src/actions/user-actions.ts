"use server";

import { followUser, unfollowUser } from "@/db/queries";
import { revalidatePath } from "next/cache";

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

import { sendMessage } from "@/db/queries";

export const onSendMessage = async (receiverId: string, formData: FormData) => {
    const content = formData.get("content") as string;
    if (!content) return;
    try {
        await sendMessage(receiverId, content);
    } catch (error) {
        console.error("Message error:", error);
    }
};
