import { z } from "zod";

/**
 * Extracts the first human-readable error message from a Zod v4 safeParse failure.
 * Zod v4 stores issues as a JSON string in error.message.
 */
export function getFirstZodError(result: { success: boolean; error?: { message: string } }): string {
    if (result.success) return "Dados inválidos";
    try {
        const issues = JSON.parse(result.error?.message || "[]");
        if (Array.isArray(issues) && issues.length > 0) {
            return issues[0].message || "Dados inválidos";
        }
    } catch {
        // Fallback: use the raw message
    }
    return "Dados inválidos";
}

export const courseSchema = z.object({
    id: z.string().nullable().optional(),
    title: z.string().min(2, "Título deve ter pelo menos 2 caracteres").max(100, "Título não pode exceder 100 caracteres").regex(/^[a-zA-ZÀ-ÿ0-9\s\-'.]+$/, "Título contém caracteres inválidos"),
    language: z.string().min(2, "Idioma deve ter pelo menos 2 caracteres").max(50, "Idioma não pode exceder 50 caracteres").regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Idioma contém caracteres inválidos"),
    languageCode: z.string().length(2, "Código de idioma deve ter exatamente 2 caracteres (ex: en, pt, es)").regex(/^[a-z]{2}$/, "Código de idioma deve ser 2 letras minúsculas (ex: en, pt, es)"),
    image: z.instanceof(File).optional().nullable(),
});

export const unitSchema = z.object({
    id: z.string().nullable().optional(),
    title: z.string().min(2, "Título deve ter pelo menos 2 caracteres").max(100, "Título não pode exceder 100 caracteres"),
    description: z.string().min(2, "Descrição deve ter pelo menos 2 caracteres").max(500, "Descrição não pode exceder 500 caracteres"),
    order: z.string().regex(/^\d+$/, "Ordem deve ser um número inteiro positivo"),
    courseId: z.string().regex(/^\d+$/, "ID do curso deve ser um número inteiro positivo"),
});

export const lessonSchema = z.object({
    id: z.string().nullable().optional(),
    title: z.string().min(2, "Título deve ter pelo menos 2 caracteres").max(100, "Título não pode exceder 100 caracteres"),
    order: z.string().regex(/^\d+$/, "Ordem deve ser um número inteiro positivo"),
    unitId: z.string().regex(/^\d+$/, "ID da unidade deve ser um número inteiro positivo"),
});

export const ticketReplySchema = z.object({
    ticketId: z.number().positive("ID do ticket deve ser positivo"),
    userEmail: z.string().email("Email inválido").max(255, "Email demasiado longo"),
    subject: z.string().min(1, "Assunto é obrigatório").max(200, "Assunto não pode exceder 200 caracteres"),
    messageContent: z.string().min(1, "Mensagem é obrigatória").max(5000, "Mensagem não pode exceder 5000 caracteres"),
    userName: z.string().min(1, "Nome é obrigatório").max(100, "Nome não pode exceder 100 caracteres").optional(),
});

export const deleteUserSchema = z.object({
    targetUserId: z.string().min(1, "ID do utilizador é obrigatório").max(128, "ID do utilizador inválido"),
});

export const adminPasswordSchema = z.object({
    password: z.string().min(1, "Password é obrigatória").max(256, "Password demasiado longa"),
});
