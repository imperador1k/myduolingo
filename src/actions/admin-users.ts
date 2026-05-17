"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { validateAdmin, logAdminAction } from "@/lib/admin-guard";
import { deleteUserSchema, getFirstZodError } from "@/lib/admin-validators";
import { actionError } from "@/lib/action-error";

export async function deleteUserAction(targetUserId: string) {
    try {
        await validateAdmin();

        const parsed = deleteUserSchema.safeParse({ targetUserId });
        if (!parsed.success) {
            return actionError("INVALID_PAYLOAD", getFirstZodError(parsed));
        }

        const allowedIds = process.env.ADMIN_ALLOWED_USER_IDS?.split(",").map(id => id.trim()) || [];
        if (allowedIds.includes(targetUserId)) {
            return actionError("FORBIDDEN", "Ação impossível: o utilizador-alvo tem proteções de administração.");
        }

        const client = await clerkClient();

        await client.users.deleteUser(targetUserId);

        await db.delete(userProgress).where(eq(userProgress.userId, targetUserId));

        await logAdminAction("DELETE_USER", targetUserId);

        revalidatePath("/admin/users");

        return { success: true };
    } catch (error) {
        console.error("[DELETE_USER_ERROR]");
        return actionError("SERVER_ERROR", "Falha ao eliminar o utilizador. Tenta novamente.");
    }
}
