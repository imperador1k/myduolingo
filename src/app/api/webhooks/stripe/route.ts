import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/drizzle";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const processedEvents = new Map<string, number>();
const EVENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isEventProcessed(eventId: string): boolean {
    const cached = processedEvents.get(eventId);
    if (!cached) return false;
    if (Date.now() - cached > EVENT_CACHE_TTL) {
        processedEvents.delete(eventId);
        return false;
    }
    return true;
}

function markEventProcessed(eventId: string) {
    processedEvents.set(eventId, Date.now());
}

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
    } catch (error) {
        console.error("Webhook signature verification failed");
        return new NextResponse("Webhook Error", { status: 400 });
    }

    if (!event.id || isEventProcessed(event.id)) {
        return new NextResponse(null, { status: 200 });
    }

    markEventProcessed(event.id);

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as Stripe.Subscription;

        if (!session?.metadata?.userId) {
            return new NextResponse("Missing user ID", { status: 400 });
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
        } catch (error) {
            console.error("DB error on checkout.session.completed");
            return new NextResponse("Database Error", { status: 500 });
        }
    }

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
        } catch (error) {
            console.error("DB error on invoice.payment_succeeded");
            return new NextResponse("Database Error", { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
