"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { db } from "@/db/drizzle";
import { userSubscriptions, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { actionError } from "@/lib/action-error";

// Configuração para URL absoluta baseada no ambiente
const returnUrl = absoluteUrl("/shop");

export const createStripeUrl = async () => {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return actionError("UNAUTHORIZED", "Não estás autenticado");
        }

        // Verifica se o user progress existe (obrigatório para subscrever)
        const progress = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, userId),
        });

        if (!progress) {
            return actionError("NOT_FOUND", "Progresso de utilizador não encontrado.");
        }

        // Verifica se já tem subscrição
        const userSubscription = await db.query.userSubscriptions.findFirst({
            where: eq(userSubscriptions.userId, userId),
        });

        // Caso 1: O utilizador já TEM subscrição (ou teve) e tem um card no Stripe
        if (userSubscription && userSubscription.stripeCustomerId && userSubscription.stripeCustomerId.startsWith("cus_")) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCustomerId,
                return_url: returnUrl,
            });

            return { data: stripeSession.url };
        }

        // Obtém o email principal do utilizador (se existir)
        const emailAddress = user.emailAddresses?.[0]?.emailAddress ?? "";

        // Caso 2: O utilizador NÃO TEM subscrição (nova compra)
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: returnUrl,
            cancel_url: returnUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: emailAddress || undefined,
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            custom_text: {
                submit: {
                    message: "Começa a tua jornada PRO hoje. Podes cancelar a qualquer momento diretamente na app.",
                },
                after_submit: {
                    message: "Bem-vindo ao MyDuolingo PRO! Os teus poderes foram ativados.",
                },
            },
            // IMPORTANTE: Metadata para que o Webhook saiba de QUEM é a compra
            metadata: {
                userId,
            },
        });

        return { data: stripeSession.url };

    } catch (error: any) {
        console.error("STRIPE_CHECKOUT_ERROR:", error);
        return actionError("SERVER_ERROR", "Erro ao comunicar com o servidor de pagamentos.");
    }
};
