import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/drizzle";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // EVENT 1: Checkout Session Completed (New Subscription First Time)
    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as Stripe.Subscription;

        if (!session?.metadata?.userId) {
            return new NextResponse("User ID is required", { status: 400 });
        }

        try {
            await db.insert(userSubscriptions).values({
                userId: session.metadata.userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    (subscription as any).current_period_end * 1000
                ),
            });
        } catch (error: any) {
            console.error("DB_INSERT_ERROR (checkout.session.completed):", error);
            // It might already exist if the webhook fired twice or a glitch happened, 
            // Postgres unique constraints would throw an error here.
            return new NextResponse("Database Error Insert", { status: 500 });
        }
    }

    // EVENT 2: Invoice Payment Succeeded (Subscription Renewal Monthly)
    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as Stripe.Subscription;

        try {
            await db
                .update(userSubscriptions)
                .set({
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCurrentPeriodEnd: new Date(
                        (subscription as any).current_period_end * 1000
                    ),
                })
                .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
        } catch (error: any) {
            console.error("DB_UPDATE_ERROR (invoice.payment_succeeded):", error);
            return new NextResponse("Database Error Update", { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
