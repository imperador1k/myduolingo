"use server";

import { db } from "../db/drizzle";
import { supportTickets, userReviews, userProgress } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { getSupportReplyEmail } from "@/lib/email-templates";
import { validateAdmin } from "@/lib/admin-guard";
import { ticketReplySchema, getFirstZodError } from "@/lib/admin-validators";
import { actionError } from "@/lib/action-error";
import { sanitizeHtml } from "@/lib/html-sanitizer";
import { emailRateLimit } from "@/lib/ratelimit";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type InboxItemType = "ticket" | "review";

export type InboxItem = {
    id: string;
    realId: number;
    type: InboxItemType;
    userName: string;
    userEmail?: string;
    userImageSrc?: string;
    subject: string;
    message: string;
    createdAt: Date | null;
    isUnread: boolean;
    rating?: number;
};

export async function getInboxItems(showArchived: boolean = false): Promise<InboxItem[]> {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const tickets = await db.query.supportTickets.findMany({
            where: showArchived
                ? and(eq(supportTickets.status, "resolved"), gte(supportTickets.createdAt, sevenDaysAgo))
                : eq(supportTickets.status, "open"),
            orderBy: [desc(supportTickets.createdAt)],
            with: {
                user: {
                    columns: { userImageSrc: true }
                }
            }
        });

        const reviews = await db.query.userReviews.findMany({
            where: showArchived
                ? and(eq(userReviews.read, true), gte(userReviews.createdAt, sevenDaysAgo))
                : eq(userReviews.read, false),
            orderBy: [desc(userReviews.createdAt)],
        });

        const formattedTickets: InboxItem[] = tickets.map(t => ({
            id: `ticket_${t.id}`,
            realId: t.id,
            type: "ticket" as const,
            userName: t.userName,
            userEmail: t.userEmail,
            userImageSrc: t.user?.userImageSrc || "/duo_crying.png",
            subject: t.subject,
            message: t.message,
            createdAt: t.createdAt,
            isUnread: true,
        }));

        const formattedReviews: InboxItem[] = reviews.map(r => ({
            id: `review_${r.id}`,
            realId: r.id,
            type: "review" as const,
            userName: r.userName,
            userImageSrc: r.userImageSrc,
            subject: `Avaliação de ${r.rating} Estrelas`,
            message: r.comment,
            createdAt: r.createdAt,
            isUnread: true,
            rating: r.rating,
        }));

        const allItems = [...formattedTickets, ...formattedReviews].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        return allItems;
    } catch (error) {
        console.error("Failed to get inbox items");
        return [];
    }
}

export async function resolveSupportTicket(id: number) {
    try {
        await db.update(supportTickets)
            .set({ status: "resolved" })
            .where(eq(supportTickets.id, id));
        revalidatePath("/admin/inbox");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Falha ao resolver ticket" };
    }
}

export async function dismissUserReview(id: number) {
    try {
        await db.update(userReviews)
            .set({ read: true })
            .where(eq(userReviews.id, id));
        revalidatePath("/admin/inbox");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Falha ao descartar avaliação" };
    }
}

export async function reopenSupportTicket(id: number) {
    try {
        await db.update(supportTickets)
            .set({ status: "open" })
            .where(eq(supportTickets.id, id));
        revalidatePath("/admin/inbox");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Falha ao reabrir ticket" };
    }
}

export async function reopenUserReview(id: number) {
    try {
        await db.update(userReviews)
            .set({ read: false })
            .where(eq(userReviews.id, id));
        revalidatePath("/admin/inbox");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Falha ao reabrir avaliação" };
    }
}

export async function replyToTicket(ticketId: number, userEmail: string, subject: string, messageContent: string, userName: string = "Estudante") {
    await validateAdmin();

    if (!resend) {
        return actionError("SERVER_ERROR", "Serviço de email indisponível");
    }

    const parsed = ticketReplySchema.safeParse({
        ticketId,
        userEmail,
        subject,
        messageContent,
        userName,
    });

    if (!parsed.success) {
        return actionError("INVALID_PAYLOAD", getFirstZodError(parsed));
    }

    const { userId } = await validateAdmin();
    const rateLimitResult = await emailRateLimit.limit(userId);

    if (!rateLimitResult.success) {
        return actionError("RATE_LIMIT_EXCEEDED", "Demasiados emails enviados. Aguarda antes de tentar novamente.");
    }

    try {
        const sanitizedContent = sanitizeHtml(messageContent);
        const sanitizedSubject = subject.replace(/[<>]/g, "");
        const sanitizedName = userName.replace(/[<>]/g, "");

        const htmlContent = getSupportReplyEmail(sanitizedName, sanitizedContent, sanitizedSubject);

        await resend.emails.send({
            from: "Equipa MyDuolingo <suporte@miguelweb.dev>",
            to: parsed.data.userEmail,
            subject: `Re: ${sanitizedSubject}`,
            html: htmlContent,
        });

        await resolveSupportTicket(ticketId);

        return { success: true };
    } catch (error) {
        console.error("Failed to send reply");
        return actionError("SERVER_ERROR", "Falha ao enviar o email de resposta");
    }
}
