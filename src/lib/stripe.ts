import Stripe from "stripe";

/**
 * Singleton Stripe instance for server-side operations.
 *
 * WHY singleton: Stripe SDK recommends reusing a single instance
 * across the application to maintain connection pooling.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
});
