"use server";

import { db } from "@/db/drizzle";
import {
  knowledgeLikes,
  knowledgeSaves,
  knowledgePosts,
  userReadHistory,
  follows,
  userProgress,
  messages,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, notInArray, desc, sql } from "drizzle-orm";
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
  const convId = await createConversation([friendId]);

  // Send the message
  await sendMessage(convId, `[SHARED_POST:${postId}]`);

  return { success: true };
};

// Gets feed posts that the user hasn't seen yet
export const getFeedPosts = async (limit = 15) => {
  const { userId } = await auth();
  if (!userId) return [];

  // Get IDs of posts the user has already read
  const readHistory = await db.query.userReadHistory.findMany({
    where: eq(userReadHistory.userId, userId),
    columns: { postId: true },
  });
  const readPostIds = readHistory.map((r) => r.postId);

  // Fetch approved posts that are not in the read history
  const posts = await db.query.knowledgePosts.findMany({
    where: (posts, { eq, and, notInArray }) => {
      const conditions = [eq(posts.status, "APPROVED")];
      if (readPostIds.length > 0) {
        conditions.push(notInArray(posts.id, readPostIds));
      }
      return and(...conditions);
    },
    with: {
      creator: true,
      likes: true,
      saves: true,
    },
    orderBy: sql`RANDOM()`, // Randomize for the TikTok feel
    limit,
  });

  return posts;
};

// Marks a post as read
export const markPostAsRead = async (postId: string) => {
  const { userId } = await auth();
  if (!userId) return { success: false };

  try {
    await db
      .insert(userReadHistory)
      .values({
        userId,
        postId,
      })
      .onConflictDoNothing(); // Prevent duplicate read entries
    return { success: true };
  } catch (error) {
    console.error("Error marking post as read:", error);
    return { success: false };
  }
};

// Gets the posts saved by the user
export const getSavedPosts = async () => {
  const { userId } = await auth();
  if (!userId) return [];

  const saves = await db.query.knowledgeSaves.findMany({
    where: eq(knowledgeSaves.userId, userId),
    with: {
      post: {
        with: {
          creator: true,
        },
      },
    },
    orderBy: desc(knowledgeSaves.savedAt),
  });

  return saves.map((save) => ({
    ...save.post,
    savedAt: save.savedAt,
  }));
};
