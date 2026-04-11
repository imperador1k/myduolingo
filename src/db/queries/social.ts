import { cache } from "react";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and, count, ilike, ne, or, asc, inArray } from "drizzle-orm";
import { db } from "../drizzle";
import { 
    follows, 
    notifications, 
    messages, 
    userProgress, 
    feedActivities, 
    highFives, 
    conversationParticipants 
} from "../schema";
import { createNotification } from "@/lib/notifications";

export const getTopUsers = cache(async (limit: number = 10) => {
    return await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit,
    });
});

export const getFollowers = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];
    return await db.query.follows.findMany({
        where: eq(follows.followingId, userId),
        with: { follower: true }
    });
});

export const getFollowing = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];
    return await db.query.follows.findMany({
        where: eq(follows.followerId, userId),
        with: { following: true }
    });
});

export const isFollowingUser = cache(async (targetUserId: string) => {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return false;
    const data = await db.query.follows.findFirst({
        where: and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)),
    });
    return !!data;
});

export const followUser = async (targetUserId: string) => {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) throw new Error("Unauthorized");
    if (currentUserId === targetUserId) throw new Error("Cannot follow self");

    const existing = await db.query.follows.findFirst({
        where: and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)),
    });
    if (existing) return;

    await db.insert(follows).values({ followerId: currentUserId, followingId: targetUserId });

    const currentUser = await db.query.userProgress.findFirst({ where: eq(userProgress.userId, currentUserId) });
    const userName = currentUser?.userName || "Alguém";

    await createNotification(targetUserId, "follow", `${userName} começou a seguir-te! 👀`, `/profile/${currentUserId}`);

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath("/friends");
    revalidatePath("/leaderboard");
};

export const unfollowUser = async (targetUserId: string) => {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) throw new Error("Unauthorized");

    await db.delete(follows).where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)));

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath("/friends");
    revalidatePath("/leaderboard");
};

export const getNotifications = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];
    return await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: (notifications: any, { desc }: any) => [desc(notifications.createdAt)],
    });
});

export const getUnreadNotificationCount = cache(async () => {
    const { userId } = await auth();
    if (!userId) return 0;
    const [result] = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result.count;
});

export const getUnreadMessageCount = cache(async () => {
    const { userId } = await auth();
    if (!userId) return 0;

    const [result] = await db
        .select({ count: count() })
        .from(messages)
        .innerJoin(
            conversationParticipants, 
            eq(messages.conversationId, conversationParticipants.conversationId)
        )
        .where(
            and(
                eq(conversationParticipants.userId, userId),
                ne(messages.senderId, userId),
                eq(messages.read, false)
            )
        );

    return result.count;
});

export const searchUsers = async (query: string) => {
    const { userId } = await auth();
    if (!userId) return [];
    return await db.query.userProgress.findMany({
        where: and(ilike(userProgress.userName, `%${query}%`), ne(userProgress.userId, userId)),
        limit: 10,
    });
};

export const markNotificationAsRead = async (id: number) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
};

// ===== FEED & ACTVITY =====

export const getFeedActivities = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];

    // 1. Get all users I am following + myself
    const following = await db.query.follows.findMany({
        where: eq(follows.followerId, userId),
    });
    
    const userIds = [userId, ...following.map((f: any) => f.followingId)];

    // 2. Fetch recent activities from these users
    const recentActivities = await db.query.feedActivities.findMany({
        where: inArray(feedActivities.userId, userIds),
        orderBy: (feedActivities: any, { desc }: any) => [desc(feedActivities.createdAt)],
        limit: 30, // Get the latest 30 activities
        with: {
            user: true, // Join user data to show names and avatars
            highFives: true // To count high-fives and check if I already gave one
        }
    });

    return recentActivities.map(activity => {
        const hasHighFived = activity.highFives.some((hf: any) => hf.senderId === userId);
        return {
            ...activity,
            highFiveCount: activity.highFives.length,
            hasHighFived
        };
    });
});

export const giveHighFive = async (activityId: number) => {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) throw new Error("Unauthorized");

    // Check if activity exists
    const activity = await db.query.feedActivities.findFirst({
        where: eq(feedActivities.id, activityId),
        with: { user: true }
    });

    if (!activity) throw new Error("Atividade não encontrada");

    // Don't high-five yourself
    if (activity.userId === currentUserId) throw new Error("Não podes dar um High-Five a ti mesmo");

    try {
        await db.insert(highFives).values({
            senderId: currentUserId,
            receiverId: activity.userId,
            activityId: activityId
        });

        // Current User name
        const currentUser = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, currentUserId)
        });
        
        // Notify the receiver
        await createNotification(
            activity.userId,
            "high_five",
            `${currentUser?.userName || "Alguém"} deu-te um High-Five! ✋`,
            `/friends` // Re-direct to friends feed to see it
        );

        revalidatePath("/friends");
    } catch (e) {
        // Likely a duplicate unique constraint error, just ignore
        console.error("Already high-fived or another error", e);
    }
};
