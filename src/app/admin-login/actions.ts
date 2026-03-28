"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { adminAuthAttempts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function authenticateVault(prevState: any, formData: FormData) {
    const { userId } = await auth();
    if (!userId) {
        return { error: "Acesso Negado (No Auth)" };
    }

    // Small delay to simulate secure terminal check and prevent brute-force feeling
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Get the user's attempt record
    const [record] = await db.select().from(adminAuthAttempts).where(eq(adminAuthAttempts.userId, userId));

    const now = new Date();
    
    // Check if locked out
    if (record && record.lockoutUntil && record.lockoutUntil > now) {
        const remainingMillis = record.lockoutUntil.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMillis / (1000 * 60));
        return { error: `Cofre Bloqueado. Tenta novamente em ${remainingMinutes} minuto(s).` };
    }

    const password = formData.get("password") as string;
    const sudoHash = process.env.ADMIN_SUDO_HASH;

    if (!sudoHash) {
        return { error: "Erro de Configuração: Admin Hash não existe no servidor." };
    }

    const isMatch = bcrypt.compareSync(password, sudoHash);

    if (!isMatch) {
        const currentAttempts = record ? record.attempts + 1 : 1;
        let lockout: Date | null = null;
        let errorMsg = `Acesso Negado. Tentativa ${currentAttempts}/5.`;

        // Apply Lockout if reached 5 attempts
        if (currentAttempts >= 5) {
            lockout = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
            errorMsg = "Cofre Bloqueado. Tenta novamente em 30 minutos.";
        }

        // Upsert DB Record
        if (record) {
            await db.update(adminAuthAttempts)
                .set({ attempts: currentAttempts, lockoutUntil: lockout })
                .where(eq(adminAuthAttempts.id, record.id));
        } else {
            await db.insert(adminAuthAttempts)
                .values({ userId, attempts: currentAttempts, lockoutUntil: lockout });
        }

        return { error: errorMsg };
    }

    // Success -> Reset attempts
    if (record) {
        await db.update(adminAuthAttempts)
            .set({ attempts: 0, lockoutUntil: null })
            .where(eq(adminAuthAttempts.id, record.id));
    }

    cookies().set("admin_vault_session", "authorized", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600, // 1 hour
        path: "/",
        sameSite: "lax",
    });

    redirect("/admin");
}