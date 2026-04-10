"use server";

import { db } from "../db/drizzle";
import { supportTickets, userReviews, userProgress } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { getSupportReplyEmail } from "@/lib/email-templates";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type InboxItemType = "ticket" | "review";

export type InboxItem = {
    id: string; // "ticket_1" vs "review_2" for unique frontend keys
    realId: number;
    type: InboxItemType;
    userName: string;
    userEmail?: string;
    userImageSrc?: string;
    subject: string;
    message: string;
    createdAt: Date | null;
    isUnread: boolean;
    rating?: number; // Só para reviews
};

export async function getInboxItems(showArchived: boolean = false): Promise<InboxItem[]> {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Obter tickets
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

        // Obter reviews
        const reviews = await db.query.userReviews.findMany({
            where: showArchived 
                ? and(eq(userReviews.read, true), gte(userReviews.createdAt, sevenDaysAgo))
                : eq(userReviews.read, false),
            orderBy: [desc(userReviews.createdAt)],
        });

        // Formatar para a InboxItem partilhada
        const formattedTickets: InboxItem[] = tickets.map(t => ({
            id: `ticket_${t.id}`,
            realId: t.id,
            type: "ticket" as const,
            userName: t.userName,
            userEmail: t.userEmail,
            userImageSrc: t.user?.userImageSrc || "/mascot.svg",
            subject: t.subject,
            message: t.message,
            createdAt: t.createdAt,
            isUnread: true, // Se está open, assumimos como unread na UI
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

        // Juntar e ordenar por data decrescente (mais recentes primeiro)
        const allItems = [...formattedTickets, ...formattedReviews].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        return allItems;
    } catch (error) {
        console.error("Failed to get inbox items:", error);
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
        return { success: false, error: "Failed to resolve ticket" };
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
        return { success: false, error: "Failed to dismiss review" };
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
        return { success: false, error: "Failed to reopen ticket" };
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
        return { success: false, error: "Failed to reopen review" };
    }
}

export async function replyToTicket(ticketId: number, userEmail: string, subject: string, messageContent: string, userName: string = "Estudante") {
    if (!resend) {
        return { success: false, error: "Serviço de email indisponível" };
    }

    try {
        const htmlContent = getSupportReplyEmail(userName, messageContent, subject);

        await resend.emails.send({
            from: "Equipa MyDuolingo <suporte@miguelweb.dev>",
            to: userEmail,
            subject: `Re: ${subject}`,
            html: htmlContent,
        });

        // Marcar como resolvido na base de dados
        await resolveSupportTicket(ticketId);

        return { success: true };
    } catch (error) {
        console.error("Failed to send reply:", error);
        return { success: false, error: "Falha ao enviar o email de resposta" };
    }
}
