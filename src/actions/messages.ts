"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import {
  conversations,
  conversationParticipants,
  messages,
  userProgress,
  messageReactions,
  conversationKeys,
} from "@/db/schema";
import { createNotification } from "@/lib/notifications";
import { eq, and, desc, ne, sql, inArray, gte } from "drizzle-orm";
import { calculateIsPro } from "@/lib/subscription";
import type {
  DBConversationParticipant,
  DBMessage,
  FormattedMessage,
  ConversationWithDetails,
} from "@/types";

/**
 * Fetches the current user's inbox list.
 * Includes latest message and participant profiles.
 */
export const getConversations = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Get IDs of conversations the user belongs to
  const userConvParticipations = await db
    .select({
      conversationId: conversationParticipants.conversationId,
    })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

  const conversationIds = userConvParticipations.map((p) => p.conversationId);
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
            },
          },
        },
      },
      messages: {
        orderBy: [desc(messages.createdAt)],
        limit: 1,
      },
    },
    orderBy: [desc(conversations.createdAt)],
    limit: 50,
  });

  // 3. Batch fetch unread counts to avoid N+1 queries
  const unreadCountsRaw = await db
    .select({
      conversationId: messages.conversationId,
      count: sql<number>`count(*)`,
    })
    .from(messages)
    .where(
      and(
        inArray(messages.conversationId, conversationIds),
        ne(messages.senderId, userId),
        eq(messages.read, false),
      ),
    )
    .groupBy(messages.conversationId);

  // Map unread counts for easy lookup
  const unreadMap = new Map(
    unreadCountsRaw.map((row) => [row.conversationId, Number(row.count)]),
  );

  // 4. Format data
  const formatted = data.map((conv) => {
    const lastMsg = conv.messages[0];

    const partner = conv.isGroup
      ? null
      : conv.participants.find((p) => p.userId !== userId)?.user;

    return {
      id: conv.id,
      conversationId: conv.id,
      senderId: "",
      content: lastMsg?.content || "",
      messageType: lastMsg?.type || "text",
      gifUrl: null,
      replyToId: lastMsg?.parentMessageId || null,
      createdAt: lastMsg?.createdAt || conv.createdAt,
      reactions: [],
      name: conv.name,
      isGroup: conv.isGroup,
      groupImageUrl: conv.imageUrl || null,
      partner: partner
        ? {
            userId: partner.userId,
            userName: partner.userName,
            userImageSrc: partner.userImageSrc,
            isPro: calculateIsPro(partner.subscription),
          }
        : null,
      participants: conv.participants.map((p) => ({
        userId: p.userId,
        userName: p.user?.userName,
        userImageSrc: p.user?.userImageSrc,
        isPro: calculateIsPro(p.user?.subscription),
        role: p.role,
      })),
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.content,
            createdAt: lastMsg.createdAt,
            senderId: lastMsg.senderId,
            read: lastMsg.read,
          }
        : null,
      unreadCount: unreadMap.get(conv.id) || 0,
      updatedAt: lastMsg?.createdAt || conv.createdAt,
    };
  });

  // Final sort by most recent activity
  return formatted.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
};

/**
 * Creates a new conversation (DM or Group).
 * For DMs, handles "intelligent" detection of existing conversations.
 */
export const createConversation = async (
  participantIds: string[],
  isGroup: boolean = false,
  name?: string,
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Intelligent check for existing 1-to-1 conversation
  if (!isGroup && participantIds.length === 1) {
    const targetUserId = participantIds[0];

    // Find a conversation that has both participants and is not a group
    const existingConversations =
      await db.query.conversationParticipants.findMany({
        where: inArray(conversationParticipants.userId, [userId, targetUserId]),
        with: {
          conversation: true,
        },
      });

    // Group by conversationId and check if both are present in a non-group chat
    const convCounts = new Map<string, { count: number; isGroup: boolean }>();
    for (const part of existingConversations) {
      const data = convCounts.get(part.conversationId) || {
        count: 0,
        isGroup: part.conversation.isGroup,
      };
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
    const [conv] = await tx
      .insert(conversations)
      .values({
        name: isGroup ? name : null,
        isGroup,
      })
      .returning();

    // 2. Add Participants
    const participantsToAdd = [userId, ...participantIds];
    const uniqueParticipants = Array.from(new Set(participantsToAdd));

    await tx.insert(conversationParticipants).values(
      uniqueParticipants.map((uid) => ({
        conversationId: conv.id,
        userId: uid,
        role: isGroup && uid === userId ? "admin" : "member",
      })),
    );

    revalidatePath("/messages");
    return conv.id;
  });
};

/**
 * Sends a message to a conversation.
 */
export const sendMessage = async (
  conversationId: string,
  content: string,
  imageUrl?: string,
  parentMessageId?: number,
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [msg] = await db
    .insert(messages)
    .values({
      conversationId,
      senderId: userId,
      content,
      imageUrl,
      type: imageUrl ? "image" : "text",
      parentMessageId,
    })
    .returning();

  // Notify other participants
  try {
    const participants = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.conversationId, conversationId),
      with: { user: true },
    });

    const currentUser = participants.find((p) => p.userId === userId)?.user;
    const userName = currentUser?.userName || "Alguém";

    for (const part of participants) {
      if (part.userId !== userId) {
        await createNotification(
          part.userId,
          "message",
          `Nova mensagem de ${userName}`,
          `/messages?conversationId=${conversationId}`,
          currentUser?.userImageSrc
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
      eq(messageReactions.emoji, emoji),
    ),
  });

  if (existing) {
    await db
      .delete(messageReactions)
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

  await db
    .update(messages)
    .set({ read: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderId, userId),
        eq(messages.read, false),
      ),
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
      eq(conversationParticipants.userId, userId),
    ),
  });

  if (!participation) throw new Error("Forbidden");

  const conditions = [eq(messages.conversationId, conversationId)];
  if (participation.clearedAt) {
    conditions.push(gte(messages.createdAt, participation.clearedAt));
  }

  const data = await db.query.messages.findMany({
    where: and(...conditions),
    orderBy: [desc(messages.createdAt)],
    limit: 100,
    with: {
      reactions: true,
      parent: true,
      sender: {
        with: {
          subscription: true,
        },
      },
    },
  });

  return data
    .map((msg) => ({
      ...msg,
      sender: {
        ...msg.sender,
        isPro: calculateIsPro(msg.sender?.subscription),
      },
    }))
    .reverse(); // Reverse because we fetched desc to get latest, but UI expects ascending
};

/**
 * Clears the chat history for the current user (soft delete).
 */
export const clearHistory = async (conversationId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(conversationParticipants)
    .set({ clearedAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    );

  revalidatePath("/messages");
  return { success: true };
};

/**
 * Server Action wrapper to get following for Client Components
 */
export const getFriendsAction = async () => {
  const { getFollowing } = await import("@/db/queries/social");
  return await getFollowing();
};

/**
 * Updates the name or image of a group conversation. Must be an admin.
 */
export const updateGroupInfo = async (
  conversationId: string,
  name?: string | null,
  imageUrl?: string | null,
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check if user is admin
  const [participant] = await db
    .select({ role: conversationParticipants.role })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    );

  if (!participant || participant.role !== "admin") {
    throw new Error("Must be an admin to update group info");
  }

  await db
    .update(conversations)
    .set({
      ...(name !== undefined ? { name } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    })
    .where(eq(conversations.id, conversationId));

  revalidatePath("/messages");
  return { success: true };
};

/**
 * Kicks a user from a group conversation. Must be an admin.
 */
export const kickParticipant = async (
  conversationId: string,
  targetUserId: string,
  newKeys?: { userId: string; encryptedRoomKey: string }[],
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check if user is admin
  const [participant] = await db
    .select({ role: conversationParticipants.role })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    );

  if (!participant || participant.role !== "admin") {
    throw new Error("Must be an admin to kick members");
  }

  // Ensure target is not an admin
  const [targetParticipant] = await db
    .select({ role: conversationParticipants.role })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, targetUserId),
      ),
    );

  if (targetParticipant?.role === "admin") {
    throw new Error("Cannot kick an admin");
  }

  await db.transaction(async (tx) => {
    // 1. Remove the user from the group
    await tx
      .delete(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, targetUserId),
        ),
      );

    // 2. If new E2EE keys are provided, rotate them
    if (newKeys && newKeys.length > 0) {
      await tx
        .delete(conversationKeys)
        .where(eq(conversationKeys.conversationId, conversationId));

      const values = newKeys.map((k) => ({
        conversationId,
        userId: k.userId,
        encryptedRoomKey: k.encryptedRoomKey,
      }));

      await tx.insert(conversationKeys).values(values);

      // Optional: Add a system message notifying about the key rotation
      await tx.insert(messages).values({
        conversationId,
        senderId: userId,
        content: "[e2ee-system]: A chave de segurança do grupo foi atualizada.",
        type: "text",
        read: true,
      });
    }
  });

  revalidatePath("/messages");
  return { success: true };
};

/**
 * Leaves a group conversation. If the user is the last admin, promotes the oldest member.
 * If the user is the last member, deletes the conversation.
 */
export const leaveGroup = async (conversationId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const participantsData = await db
    .select()
    .from(conversationParticipants)
    .where(eq(conversationParticipants.conversationId, conversationId));

  const participant = participantsData.find((p) => p.userId === userId);

  if (!participant) {
    throw new Error("User not found or is the only member");
  }

  const isLeavingAdmin = participant.role === "admin";
  const remainingParticipants = participantsData.filter(
    (p) => p.userId !== userId,
  );

  await db.transaction(async (tx) => {
    // 1. Remove the user from participants
    await tx
      .delete(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId),
        ),
      );

    // 2. Remove their E2EE keys for this conversation
    await tx
      .delete(conversationKeys)
      .where(
        and(
          eq(conversationKeys.conversationId, conversationId),
          eq(conversationKeys.userId, userId),
        ),
      );

    // 3. Promote oldest member if leaving user was the only admin
    if (isLeavingAdmin && remainingParticipants.length > 0) {
      const remainingAdmins = remainingParticipants.filter(
        (p) => p.role === "admin",
      );
      if (remainingAdmins.length === 0) {
        // Promote the one who joined earliest
        const oldestMember = remainingParticipants.reduce((prev, current) => {
          return new Date(prev.joinedAt) < new Date(current.joinedAt)
            ? prev
            : current;
        });

        await tx
          .update(conversationParticipants)
          .set({ role: "admin" })
          .where(
            and(
              eq(conversationParticipants.conversationId, conversationId),
              eq(conversationParticipants.userId, oldestMember.userId),
            ),
          );
      }
    } else if (remainingParticipants.length === 0) {
      // Delete the conversation if no one is left
      await tx
        .delete(conversations)
        .where(eq(conversations.id, conversationId));
    }
  });

  revalidatePath("/messages");
  return { success: true };
};

/**
 * Promotes a participant to admin. Must be an admin.
 */
export const promoteToAdmin = async (
  conversationId: string,
  targetUserId: string,
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check if current user is admin
  const [participant] = await db
    .select({ role: conversationParticipants.role })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    );

  if (!participant || participant.role !== "admin") {
    throw new Error("Must be an admin to promote members");
  }

  // Update target user's role to admin
  await db
    .update(conversationParticipants)
    .set({ role: "admin" })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, targetUserId),
      ),
    );

  revalidatePath("/messages");
  return { success: true };
};

/**
 * Adds new participants to an existing group. Must be an admin.
 */
export const addParticipants = async (
  conversationId: string,
  newParticipants: { userId: string; encryptedRoomKey: string }[],
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check if current user is admin
  const [me] = await db
    .select({ role: conversationParticipants.role })
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    );

  if (!me || me.role !== "admin") {
    throw new Error("Must be an admin to add members");
  }

  await db.transaction(async (tx) => {
    // 1. Insert new participants
    if (newParticipants.length > 0) {
      await tx.insert(conversationParticipants).values(
        newParticipants.map((p) => ({
          conversationId,
          userId: p.userId,
          role: "member",
        })),
      );

      // 2. Insert their keys
      await tx.insert(conversationKeys).values(
        newParticipants.map((p) => ({
          conversationId,
          userId: p.userId,
          encryptedRoomKey: p.encryptedRoomKey,
        })),
      );
    }
  });

  revalidatePath("/messages");
  return { success: true };
};
