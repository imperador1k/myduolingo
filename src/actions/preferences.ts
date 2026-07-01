"use server";

import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const syncClientPreferences = async (newPrefs: Record<string, any>) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      columns: {
        clientPreferences: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const currentPrefs = (user.clientPreferences as Record<string, any>) || {};
    const updatedPrefs = {
      ...currentPrefs,
      ...newPrefs,
    };

    await db
      .update(userProgress)
      .set({
        clientPreferences: updatedPrefs,
      })
      .where(eq(userProgress.userId, userId));

    return { success: true, clientPreferences: updatedPrefs };
  } catch (error) {
    console.error("Failed to sync preferences:", error);
    return { success: false, error: "Failed to sync preferences" };
  }
};

export const getClientPreferences = async () => {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      columns: {
        clientPreferences: true,
      },
    });

    return (user?.clientPreferences as Record<string, any>) || null;
  } catch (error) {
    return null;
  }
};
