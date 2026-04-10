"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { userReviews, userProgress } from "@/db/schema";

export const upsertReviewAction = async (rating: number, comment: string) => {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Unauthorized");

        const progress = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, user.id)
        });

        if (!progress) throw new Error("User progress not found");

        const existingReview = await db.query.userReviews.findFirst({
            where: eq(userReviews.userId, user.id)
        });

        if (existingReview) {
            await db.update(userReviews)
                .set({
                    rating,
                    comment,
                    userName: progress.userName,
                    userImageSrc: progress.userImageSrc,
                    createdAt: new Date(), // update timestamp so it pops back to top
                })
                .where(eq(userReviews.userId, user.id));
        } else {
            await db.insert(userReviews).values({
                userId: user.id,
                userName: progress.userName,
                userImageSrc: progress.userImageSrc,
                rating,
                comment,
            });
        }

        revalidatePath("/reviews");
        revalidatePath("/learn");

        return { success: true };
    } catch (error) {
        console.error("[UPSERT_REVIEW_ERROR]", error);
        return { success: false, error: "Failed to submit review" };
    }
};

export const getLatestReviewsAction = async (limitNum: number = 20) => {
    try {
        return await db.query.userReviews.findMany({
            orderBy: [desc(userReviews.createdAt)],
            limit: limitNum,
        });
    } catch (error) {
        console.error("[GET_REVIEWS_ERROR]", error);
        return [];
    }
};
