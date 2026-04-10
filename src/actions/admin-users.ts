"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ── Helpers ──────────────────────────────────────────────

import { validateAdmin, logAdminAction } from "@/lib/admin-guard";

export async function deleteUserAction(targetUserId: string) {
    try {
        await validateAdmin();

        // Safety Catch: Prevent deleting users defined as admins in env vars (self-destruction check)
        const allowedIds = process.env.ADMIN_ALLOWED_USER_IDS?.split(",").map(id => id.trim()) || [];
        if (allowedIds.includes(targetUserId)) {
            throw new Error("Ação Impossível: O utilizador-alvo tem proteções inabaláveis de Administração.");
        }

        const client = await clerkClient();

        // 1. Delete from robust Clerk Backend
        await client.users.deleteUser(targetUserId);

        // 2. Delete user's progress gracefully from local DB 
        // (Due to foreign keys and ON DELETE CASCADE on our schema, deleting userProgress 
        // cleans up feed_activities, high_fives, etc. If something doesn't cascade, we might need a broader purge here).
        await db.delete(userProgress).where(eq(userProgress.userId, targetUserId));

        // 3. Log the surgical strike
        await logAdminAction("DELETE_USER", targetUserId, "Database and Clerk authentication completely purged.");

        revalidatePath("/admin/users");
        
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE_USER_ERROR]", error);
        return { success: false, error: error.message || "Failed to delete user" };
    }
}
