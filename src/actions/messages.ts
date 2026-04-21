"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { 
    conversations, 
    conversationParticipants, 
    messages, 
    userProgress,
    messageReactions 
} from "@/db/schema";
import { createNotification } from "@/lib/notifications";
import { eq, and, desc, ne, sql, inArray } from "drizzle-orm";
import { calculateIsPro } from "@/lib/subscription";

/**
 * Fetches the current user's inbox list.
 * Includes latest message and participant profiles.
 */
export const getConversations = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Get IDs of conversations the user belongs to
    const userConvParticipations = await db.select({
        conversationId: conversationParticipants.conversationId,
    })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

    const conversationIds = userConvParticipations.map((p: any) => p.conversationId);
    if (conversationIds.length === 0) return [];

    // 2. Fetch full conversation data with relations
    const data = await db.query.conversations.findMany({
        where: inArray(conversations.id, conversationIds),
        with: {
            participants: {
                with: {
                    user: {
                        with: {
                            subscription: true,
                        }
                    },
                }
            },
            messages: {
                orderBy: [desc(messages.createdAt)],
                limit: 1,
            }
        },
        orderBy: [desc(conversations.createdAt)],
        limit: 50,
    });

    // 3. Batch fetch unread counts to avoid N+1 queries
    const unreadCountsRaw = await db.select({
        conversationId: messages.conversationId,
        count: sql<number>`count(*)`
    })
    .from(messages)
    .where(
        and(
            inArray(messages.conversationId, conversationIds),
            ne(messages.senderId, userId),
            eq(messages.read, false)
        )
    )
    .groupBy(messages.conversationId);

    // Map unread counts for easy lookup
    const unreadMap = new Map(unreadCountsRaw.map(row => [row.conversationId, Number(row.count)]));

    // 4. Format data
    const formatted = data.map((conv: any) => {
        const lastMsg = conv.messages[0];
        
        // Find the "other" participant (for 1-to-1 DMs)
        const partner = conv.isGroup 
            ? null 
            : conv.participants.find((p: any) => p.userId !== userId)?.user;

        return {
            id: conv.id,
            name: conv.name,
            isGroup: conv.isGroup,
            partner: partner ? {
                userId: partner.userId,
                userName: partner.userName,
                userImageSrc: partner.userImageSrc,
                isPro: calculateIsPro(partner.subscription),
            } : null,
            participants: conv.participants.map((p: any) => ({
                userId: p.userId,
                userName: p.user?.userName,
                userImageSrc: p.user?.userImageSrc,
                isPro: calculateIsPro(p.user?.subscription),
            })),
            lastMessage: lastMsg ? {
                id: lastMsg.id,
                content: lastMsg.content,
                createdAt: lastMsg.createdAt,
                senderId: lastMsg.senderId,
                read: lastMsg.read,
            } : null,
            unreadCount: unreadMap.get(conv.id) || 0,
            updatedAt: lastMsg?.createdAt || conv.createdAt,
        };
    });

    // Final sort by most recent activity
    return (formatted as any[]).sort((a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime());
};

/**
 * Creates a new conversation (DM or Group).
 * For DMs, handles "intelligent" detection of existing conversations.
 */
export const createConversation = async (participantIds: string[], isGroup: boolean = false, name?: string) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Intelligent check for existing 1-to-1 conversation
    if (!isGroup && participantIds.length === 1) {
        const targetUserId = participantIds[0];

        // Find a conversation that has both participants and is not a group
        const existingConversations = await db.query.conversationParticipants.findMany({
            where: inArray(conversationParticipants.userId, [userId, targetUserId]),
            with: {
                conversation: true,
            }
        });

        // Group by conversationId and check if both are present in a non-group chat
        const convCounts = new Map<string, { count: number, isGroup: boolean }>();
        for (const part of existingConversations) {
            const data = convCounts.get(part.conversationId) || { count: 0, isGroup: part.conversation.isGroup };
            data.count++;
            convCounts.set(part.conversationId, data);
        }

        for (const [convId, data] of Array.from(convCounts.entries())) {
            if (data.count === 2 && !data.isGroup) {
                return convId; // Found existing DM!
            }
        }
    }

    return await db.transaction(async (tx) => {
        // 1. Create Conversation
        const [conv] = await tx.insert(conversations).values({
            name: isGroup ? name : null,
            isGroup,
        }).returning();

        // 2. Add Participants
        const participantsToAdd = [userId, ...participantIds];
        const uniqueParticipants = Array.from(new Set(participantsToAdd));

        await tx.insert(conversationParticipants).values(
            uniqueParticipants.map(uid => ({
                conversationId: conv.id,
                userId: uid,
            }))
        );

        revalidatePath("/messages");
        return conv.id;
    });
};

/**
 * Sends a message to a conversation.
 */
export const sendMessage = async (conversationId: string, content: string, imageUrl?: string, parentMessageId?: number) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const [msg] = await db.insert(messages).values({
        conversationId,
        senderId: userId,
        content,
        imageUrl,
        type: imageUrl ? "image" : "text",
        parentMessageId,
    }).returning();

    // Notify other participants
    try {
        const participants = await db.query.conversationParticipants.findMany({
            where: eq(conversationParticipants.conversationId, conversationId),
            with: { user: true }
        });

        const currentUser = participants.find((p: any) => p.userId === userId)?.user;
        const userName = currentUser?.userName || "Alguém";

        for (const part of participants) {
            if (part.userId !== userId) {
                await createNotification(
                    part.userId,
                    "message",
                    `Nova mensagem de ${userName} 💬`,
                    `/messages?conversationId=${conversationId}`
                );
            }
        }
    } catch (error) {
        console.error("Error sending message notification:", error);
    }

    revalidatePath("/messages");
    return {
        ...msg,
        reactions: [],
    };
};

/**
 * Toggles a reaction for a specific message.
 */
export const toggleReaction = async (messageId: number, emoji: string) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if reaction already exists
    const existing = await db.query.messageReactions.findFirst({
        where: and(
            eq(messageReactions.messageId, messageId),
            eq(messageReactions.userId, userId),
            eq(messageReactions.emoji, emoji)
        )
    });

    if (existing) {
        await db.delete(messageReactions)
            .where(eq(messageReactions.id, existing.id));
    } else {
        await db.insert(messageReactions).values({
            messageId,
            userId,
            emoji,
        });
    }

    revalidatePath("/messages");
    return { success: true };
};

/**
 * Marks all messages in a conversation as read for the current user.
 */
export const markAsRead = async (conversationId: string) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(messages)
        .set({ read: true })
        .where(
            and(
                eq(messages.conversationId, conversationId),
                ne(messages.senderId, userId),
                eq(messages.read, false)
            )
        );

    revalidatePath("/messages");
    return { success: true };
};

/**
 * Fetches messages for a specific conversation.
 */
export const getMessages = async (conversationId: string) => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Security: Check if user is a participant
    const participation = await db.query.conversationParticipants.findFirst({
        where: and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId)
        )
    });

    if (!participation) throw new Error("Forbidden");

    const data = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [desc(messages.createdAt)],
        limit: 100,
        with: {
            reactions: true,
            parent: true,
            sender: {
                with: {
                    subscription: true,
                }
            }
        }
    });

    return data.map((msg: any) => ({
        ...msg,
        sender: {
            ...msg.sender,
            isPro: calculateIsPro(msg.sender?.subscription),
        }
    }));
};

/**
 * Server Action wrapper to get following for Client Components
 */
export const getFriendsAction = async () => {
    const { getFollowing } = await import("@/db/queries/social");
    return await getFollowing();
};
