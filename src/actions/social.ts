"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { feedActivities, highFives, userProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/db/queries";

export const toggleHighFive = async (activityId: number) => {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) throw new Error("Unauthorized");

    // Check if activity exists
    const activity = await db.query.feedActivities.findFirst({
        where: eq(feedActivities.id, activityId),
    });

    if (!activity) throw new Error("Atividade não encontrada");

    // Don't high-five yourself
    if (activity.userId === currentUserId) throw new Error("Não podes dar um High-Five a ti mesmo");

    // Check if the high five already exists
    const existingHighFive = await db.query.highFives.findFirst({
        where: and(
            eq(highFives.senderId, currentUserId),
            eq(highFives.activityId, activityId)
        )
    });

    try {
        if (existingHighFive) {
            // Toggle OFF: Delete the existing high five
            await db.delete(highFives)
                .where(and(
                    eq(highFives.senderId, currentUserId),
                    eq(highFives.activityId, activityId)
                ));
            
            revalidatePath("/friends");
            return { action: "removed" };
        } else {
            // Toggle ON: Insert the high five
            await db.insert(highFives).values({
                senderId: currentUserId,
                receiverId: activity.userId,
                activityId: activityId
            });

            // Current User name
            const currentUser = await db.query.userProgress.findFirst({
                where: eq(userProgress.userId, currentUserId)
            });
            
            // Notify the receiver (only when added)
            await createNotification(
                activity.userId,
                "high_five",
                `${currentUser?.userName || "Alguém"} deu-te um High-Five! ✋`,
                `/friends` 
            );

            revalidatePath("/friends");
            return { action: "added" };
        }
    } catch (e) {
        console.error("Toggle high-five error", e);
        throw new Error("Erro ao processar o High-Five");
    }
};
