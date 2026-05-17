"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { adminAuthAttempts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createVaultToken } from "@/lib/vault-token";

export async function authenticateVault(prevState: any, formData: FormData) {
    const { userId } = await auth();
    if (!userId) {
        return { error: "Acesso Negado (No Auth)" };
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const [record] = await db.select().from(adminAuthAttempts).where(eq(adminAuthAttempts.userId, userId));

    const now = new Date();

    if (record && record.lockoutUntil && record.lockoutUntil > now) {
        const remainingMillis = record.lockoutUntil.getTime() - now.getTime();
        const remainingMinutes = Math.ceil(remainingMillis / (1000 * 60));
        return { error: `Cofre Bloqueado. Tenta novamente em ${remainingMinutes} minuto(s).` };
    }

    const password = formData.get("password") as string;
    const sudoHash = process.env.ADMIN_SUDO_HASH;

    if (!sudoHash) {
        return { error: "Erro de Configuração do Servidor" };
    }

    const isMatch = bcrypt.compareSync(password, sudoHash);

    if (!isMatch) {
        const currentAttempts = record ? record.attempts + 1 : 1;
        let lockout: Date | null = null;
        let errorMsg = `Acesso Negado. Tentativa ${currentAttempts}/5.`;

        if (currentAttempts >= 5) {
            lockout = new Date(now.getTime() + 30 * 60 * 1000);
            errorMsg = "Cofre Bloqueado. Tenta novamente em 30 minutos.";
        }

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

    if (record) {
        await db.update(adminAuthAttempts)
            .set({ attempts: 0, lockoutUntil: null })
            .where(eq(adminAuthAttempts.id, record.id));
    }

    const vaultToken = createVaultToken(userId);

    cookies().set("admin_vault_session", vaultToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
        sameSite: "strict",
    });

    redirect("/admin");
}

const COOKIE_MAX_AGE = 3600;
