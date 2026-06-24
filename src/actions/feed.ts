"use server";

import { db } from "@/db/drizzle";
import {
  knowledgeLikes,
  knowledgeSaves,
  follows,
  userProgress,
  messages,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createConversation, sendMessage } from "./messages";

export const toggleLike = async (postId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existingLike = await db.query.knowledgeLikes.findFirst({
    where: and(
      eq(knowledgeLikes.userId, userId),
      eq(knowledgeLikes.postId, postId),
    ),
  });

  if (existingLike) {
    await db
      .delete(knowledgeLikes)
      .where(
        and(
          eq(knowledgeLikes.userId, userId),
          eq(knowledgeLikes.postId, postId),
        ),
      );
  } else {
    await db.insert(knowledgeLikes).values({
      userId,
      postId,
    });
  }

  revalidatePath("/feed");
};

export const toggleSave = async (postId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existingSave = await db.query.knowledgeSaves.findFirst({
    where: and(
      eq(knowledgeSaves.userId, userId),
      eq(knowledgeSaves.postId, postId),
    ),
  });

  if (existingSave) {
    await db
      .delete(knowledgeSaves)
      .where(
        and(
          eq(knowledgeSaves.userId, userId),
          eq(knowledgeSaves.postId, postId),
        ),
      );
  } else {
    await db.insert(knowledgeSaves).values({
      userId,
      postId,
    });
  }

  revalidatePath("/feed");
};

// Gets mutual friends for sharing
export const getShareableContacts = async () => {
  const { userId } = await auth();
  if (!userId) return [];

  // Get people I follow
  const followingRows = await db.query.follows.findMany({
    where: eq(follows.followerId, userId),
  });
  const followingIds = followingRows.map((f) => f.followingId);

  // Get people who follow me
  const followerRows = await db.query.follows.findMany({
    where: eq(follows.followingId, userId),
  });
  const followerIds = followerRows.map((f) => f.followerId);

  // Mutual friends
  const mutualIds = followingIds.filter((id) => followerIds.includes(id));

  if (mutualIds.length === 0) return [];

  const friendsData = await db.query.userProgress.findMany({
    where: (users, { inArray }) => inArray(users.userId, mutualIds),
  });

  return friendsData;
};

// Shares a post to a direct message
export const sharePostToChat = async (friendId: string, postId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Create or get 1-on-1 conversation
  const conv = await createConversation([friendId]);

  // Send the message
  await sendMessage(conv.id, `[SHARED_POST:${postId}]`);

  return { success: true };
};
