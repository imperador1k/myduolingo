import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { adminAuditLogs } from "@/db/schema";

/**
 * Validação rigorosa para Server Actions de Administração.
 * Deve ser invocada no início de qualquer função que altere o estado do sistema 
 * de forma administrativa (ex: CMS, AI Generators, Edição de Utilizadores).
 * 
 * Lança um erro se o utilizador não estiver autenticado ou não estiver na allowlist.
 */
export async function validateAdmin() {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("Não autorizado: É necessário iniciar sessão.");
    }

    const allowedIds = process.env.ADMIN_ALLOWED_USER_IDS?.split(",").map(id => id.trim()) || [];
    
    if (!allowedIds.includes(userId)) {
        console.warn(`[SECURITY WARNING] Tentativa de acesso administrativo não autorizada. UserId: ${userId}`);
        throw new Error("Acesso Negado: Privilégios insuficientes.");
    }

    return { userId };
}

/**
 * Registos Atómicos para conformidade empresarial (Audit Tracking).
 * Executado invisivelmente após uma ação sensível para criar um paper trail.
 * Os logs não sofrem caching para garantir consistência.
 */
export async function logAdminAction(action: string, entityId?: string, metadata?: string) {
    try {
        const { userId } = await validateAdmin();
        
        await db.insert(adminAuditLogs).values({
            userId,
            action,
            entityId,
            metadata
        });
    } catch (e) {
        console.error("[AUDIT LOG FAILED] - Impossível guardar atividade:", e);
    }
}
