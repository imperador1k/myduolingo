import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { userSubscriptions } from "@/db/schema";

/** 1 day in milliseconds — grace period after Stripe period ends */
export const DAY_IN_MS = 86_400_000;

/**
 * Helper to determine if a subscription object represents an active PRO user.
 * It uses the same grace period logic.
 */
export const calculateIsPro = (subscription: any): boolean => {
    if (!subscription?.stripeCurrentPeriodEnd) return false;
    
    // Ensure it's a Date object if it comes as a string from DB mapping in some places
    const periodEnd = subscription.stripeCurrentPeriodEnd instanceof Date 
        ? subscription.stripeCurrentPeriodEnd 
        : new Date(subscription.stripeCurrentPeriodEnd);

    return periodEnd.getTime() + DAY_IN_MS > Date.now();
};

/**
 * Checks whether the current authenticated user holds an active PRO subscription.
 *
 * WHY the 1-day grace period:
 * Stripe webhooks can arrive with a slight delay on renewal. Without a buffer,
 * a user whose subscription renews at midnight could briefly lose PRO access
 * until the webhook lands. The DAY_IN_MS cushion prevents this edge case.
 */
export const checkSubscription = cache(async (): Promise<boolean> => {
    const { userId } = await auth();
    if (!userId) return false;

    const subscription = await db.query.userSubscriptions.findFirst({
        where: eq(userSubscriptions.userId, userId),
    });

    return calculateIsPro(subscription);
});
