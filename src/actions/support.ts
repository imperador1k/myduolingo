"use server";

import { z } from "zod";
import { Resend } from "resend";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../db/drizzle";
import { supportTickets } from "@/db/schema";
import { getAdminNotificationEmail, getUserReceiptEmail } from "@/lib/email-templates";

const supportSchema = z.object({
    subject: z.string().min(3, "O assunto tem de ter pelo menos 3 caracteres."),
    message: z.string().min(10, "A mensagem tem de ter pelo menos 10 caracteres."),
});

// Avoid initializing resend if env var is missing during build time
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function submitSupportTicket(prevState: any, formData: FormData) {
    // 🍯 HONEYPOT TRAP: Bots vão preencher 'user_contact_number'. Humanos não o conseguem ver.
    const honeypot = formData.get("user_contact_number") as string;
    if (honeypot) {
        console.warn("[SECURITY] Spam Bot detetado a atacar a página de Suporte. Ticket descartado silenciosamente.");
        // Retornamos um sucesso "falso". O bot desiste, e as nossas caixas de correio agradecem.
        return {
            success: true,
            message: "O teu bilhete voou até nós! Obrigado pelo feedback. 🕊️",
        };
    }

    const rawData = {
        subject: formData.get("subject") as string,
        message: formData.get("message") as string,
    };

    const validatedFields = supportSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Por favor, verifica os campos do formulário.",
        };
    }

    const { subject, message } = validatedFields.data;

    // Fetch authenticated user
    const user = await currentUser();
    if (!user) {
        return {
            message: "Precisas de ter sessão iniciada para enviar pedidos de suporte.",
            errors: { message: ["Acesso não autorizado"] }
        };
    }

    const userEmail = user.emailAddresses[0]?.emailAddress || "sem_email@user.com";
    const userName = user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Utilizador";

    if (!resend) {
        return {
            message: "A API do Resend não está configurada corretamente no servidor.",
            errors: { message: ["Erro de configuração no servidor"] }
        };
    }

    const targetEmail = process.env.SUPPORT_EMAIL;

    if (!targetEmail) {
        return {
            message: "O email de suporte destino não está listado nas configurações do sistema.",
            errors: { message: ["Erro de configuração no servidor"] }
        };
    }

    try {
        // 1. PRIMEIRO: Tentar gravar na Base de Dados. 
        // Mesmo que o email falhe, o admin vê o ticket na Inbox!
        await db.insert(supportTickets).values({
            userId: user.id,
            userName,
            userEmail,
            subject,
            message,
            status: "open",
        });

        const adminEmailHtml = getAdminNotificationEmail(userName, userEmail, subject, message);
        const userReceiptHtml = getUserReceiptEmail(userName, subject);

        // 2. ENVIAR EMAILS (Usando o remetente oficial verificado)
        try {
            await resend.emails.send({
                from: "MyDuolingo <suporte@miguelweb.dev>",
                to: targetEmail,
                subject: `[Bug Report] ${subject}`,
                replyTo: userEmail,
                html: adminEmailHtml,
            });

            await resend.emails.send({
                from: "MyDuolingo <suporte@miguelweb.dev>",
                to: userEmail,
                subject: "Recebemos a tua mensagem! 🚀",
                html: userReceiptHtml,
            });
        } catch (emailError) {
            console.error("Email send failed but ticket was saved to DB:", emailError);
            // Não bloqueamos o sucesso aqui porque o ticket foi gravado na BD!
        }

        return {
            success: true,
            message: "O teu bilhete voou até nós! Obrigado pelo feedback. 🕊️",
        };
    } catch (error) {
        console.error("Support Ticket Error:", error);
        return {
            message: "Ocorreu um erro ao processar o teu pedido na Base de Dados. Verifica se a tabela existe.",
            errors: { message: ["Erro de processamento"] }
        };
    }
}
