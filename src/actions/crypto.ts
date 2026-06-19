"use server";

import { db } from "@/db/drizzle";
import { userProgress, conversationKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getE2EPublicKey(targetUserId: string) {
  const user = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, targetUserId),
    columns: {
      e2ePublicKey: true,
    },
  });

  return user?.e2ePublicKey || null;
}

export async function getConversationKey(conversationId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const keyRecord = await db.query.conversationKeys.findFirst({
    where: and(
      eq(conversationKeys.conversationId, conversationId),
      eq(conversationKeys.userId, userId),
    ),
  });

  return keyRecord?.encryptedRoomKey || null;
}

export async function saveConversationKeys(
  conversationId: string,
  keys: { userId: string; encryptedRoomKey: string }[],
) {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) return false;

  try {
    const values = keys.map((k) => ({
      conversationId,
      userId: k.userId,
      encryptedRoomKey: k.encryptedRoomKey,
    }));

    await db.insert(conversationKeys).values(values);
    return true;
  } catch (error) {
    console.error("Failed to save conversation keys", error);
    return false;
  }
}

export async function getMyE2EBundle() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    columns: {
      e2ePublicKey: true,
      e2eEncryptedPrivateKey: true,
      e2eSalt: true,
    },
  });

  if (
    !user ||
    !user.e2ePublicKey ||
    !user.e2eEncryptedPrivateKey ||
    !user.e2eSalt
  ) {
    return null;
  }

  return {
    publicKey: user.e2ePublicKey,
    encryptedPrivateKey: user.e2eEncryptedPrivateKey,
    salt: user.e2eSalt,
  };
}
