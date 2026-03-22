import { cache } from "react";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and, count, ilike, ne, or, asc, inArray } from "drizzle-orm";
import { db } from "../drizzle";
import { follows, notifications, messages, userProgress } from "../schema";
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
        orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
});

export const getMessages = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];
    return await db.query.messages.findMany({
        where: eq(messages.receiverId, userId),
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        with: { sender: true }
    });
});

export const sendMessage = async (receiverId: string, content: string, type: "text" | "image" | "file" = "text", fileName?: string) => {
    const { userId: senderId } = await auth();
    if (!senderId) throw new Error("Unauthorized");

    const [insertedMsg] = await db.insert(messages).values({ senderId, receiverId, content, type, fileName }).returning();
    const actualSenderId = (insertedMsg as any).sender_id || insertedMsg.senderId;

    const currentUser = await db.query.userProgress.findFirst({ where: eq(userProgress.userId, actualSenderId) });
    const userName = currentUser?.userName || "Alguém";

    await createNotification(receiverId, "message", `Nova mensagem de ${userName} 💬`, `/messages`);
    revalidatePath("/messages");
};

export const getUnreadNotificationCount = cache(async () => {
    const { userId } = await auth();
    if (!userId) return 0;
    const [result] = await db.select({ count: count() }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result.count;
});

export const getUnreadMessageCount = cache(async () => {
    const { userId } = await auth();
    if (!userId) return 0;
    const [result] = await db.select({ count: count() }).from(messages).where(and(eq(messages.receiverId, userId), eq(messages.read, false)));
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

export const getConversations = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];

    const userMessages = await db.query.messages.findMany({
        where: or(eq(messages.senderId, userId), eq(messages.receiverId, userId)),
        orderBy: [desc(messages.createdAt)],
    });

    const partnerIds = Array.from(new Set(userMessages.map(msg => {
        const mSenderId = (msg as any).sender_id || msg.senderId;
        const mReceiverId = (msg as any).receiver_id || msg.receiverId;
        return mSenderId === userId ? mReceiverId : mSenderId;
    })));

    let partners: any[] = [];
    if (partnerIds.length > 0) {
        partners = await db.query.userProgress.findMany({ where: inArray(userProgress.userId, partnerIds) });
    }

    const chatList = partners.map(partner => {
        const lastMessage = userMessages.find(m => {
            const mSenderId = (m as any).sender_id || m.senderId;
            const mReceiverId = (m as any).receiver_id || m.receiverId;
            return mSenderId === partner.userId || mReceiverId === partner.userId;
        });

        const unreadCount = userMessages.filter(m => {
            const mSenderId = (m as any).sender_id || m.senderId;
            const mReceiverId = (m as any).receiver_id || m.receiverId;
            return mSenderId === partner.userId && mReceiverId === userId && !m.read;
        }).length;

        let mappedSenderId = "system";
        if (lastMessage) {
            const lSenderId = (lastMessage as any).sender_id || lastMessage.senderId;
            mappedSenderId = lSenderId === userId ? "me" : lSenderId;
        }

        return {
            partner,
            lastMessage: lastMessage ? { ...lastMessage, senderId: mappedSenderId, createdAt: lastMessage.createdAt || new Date() } : { id: -1, content: "Nenhuma mensagem", senderId: "system", read: true, createdAt: new Date() },
            unreadCount
        };
    });

    const following = await db.query.follows.findMany({
        where: eq(follows.followerId, userId),
        with: { following: true }
    });

    const existingPartnerIds = new Set(partners.map(p => p.userId));
    for (const follow of following) {
        if (!existingPartnerIds.has(follow.followingId) && follow.following) {
            chatList.push({
                partner: follow.following,
                lastMessage: { id: -1, content: "Começa uma conversa!", senderId: "system", read: true, createdAt: new Date() },
                unreadCount: 0,
            });
        }
    }

    chatList.sort((a, b) => {
        const dateA = a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const dateB = b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    return chatList;
});

export const getMessagesForThread = cache(async (otherUserId: string) => {
    const { userId } = await auth();
    if (!userId) return [];
    return await db.query.messages.findMany({
        where: or(
            and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
            and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
        ),
        orderBy: [asc(messages.createdAt)],
    });
});

export const markMessagesAsRead = async (partnerId: string) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    await db.update(messages).set({ read: true }).where(and(eq(messages.receiverId, userId), eq(messages.senderId, partnerId), eq(messages.read, false)));
};

export const markNotificationAsRead = async (id: number) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    await db.update(notifications).set({ read: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
};
