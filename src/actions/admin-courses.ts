"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db/drizzle";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateAdmin, logAdminAction } from "@/lib/admin-guard";
import { courseSchema, getFirstZodError } from "@/lib/admin-validators";
import { actionError } from "@/lib/action-error";
import { sanitizeFileName, validateFileType, validateFileSize } from "@/lib/html-sanitizer";

async function assertAdmin() {
    await validateAdmin();
}

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key);
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

async function uploadCourseImage(file: File): Promise<string> {
    if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
        throw new Error("Tipo de ficheiro não suportado. Apenas JPG, PNG, WebP e GIF são permitidos.");
    }

    if (!validateFileSize(file, MAX_IMAGE_SIZE)) {
        throw new Error("Ficheiro demasiado grande. Tamanho máximo: 5MB.");
    }

    const supabase = getSupabaseAdmin();

    const sanitizedFileName = sanitizeFileName(file.name.split(".")[0] || "image");
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${sanitizedFileName}_${Date.now()}.${ext}`;
    const filePath = `${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
        .from("course_images")
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
        });

    if (error) {
        console.error("[UPLOAD_ERROR]", error.message);
        throw new Error("Falha ao carregar a imagem. Tenta novamente.");
    }

    const { data: urlData } = supabase.storage
        .from("course_images")
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

export async function saveCourseAction(formData: FormData) {
    await assertAdmin();

    const rawId = formData.get("id") as string | null;
    const rawTitle = formData.get("title") as string;
    const rawLanguage = formData.get("language") as string;
    const rawLanguageCode = formData.get("languageCode") as string;
    const imageFile = formData.get("image") as File | null;

    const parsed = courseSchema.safeParse({
        id: rawId,
        title: rawTitle,
        language: rawLanguage,
        languageCode: rawLanguageCode,
        image: imageFile && imageFile.size > 0 ? imageFile : null,
    });

    if (!parsed.success) {
        return actionError("INVALID_PAYLOAD", getFirstZodError(parsed));
    }

    const { id, title, language, languageCode } = parsed.data;

    let imageSrc: string | undefined;

    if (imageFile && imageFile.size > 0) {
        try {
            imageSrc = await uploadCourseImage(imageFile);
        } catch (error) {
            return actionError("SERVER_ERROR", error instanceof Error ? error.message : "Falha ao carregar imagem");
        }
    }

    try {
        if (id) {
            const updateData: Record<string, any> = { title, language, languageCode };
            if (imageSrc) updateData.imageSrc = imageSrc;

            await db.update(courses)
                .set(updateData)
                .where(eq(courses.id, parseInt(id)));

            await logAdminAction("UPDATE_COURSE", id, JSON.stringify({ title, language, languageCode }));
        } else {
            if (!imageSrc) {
                return actionError("BAD_REQUEST", "Imagem é obrigatória ao criar um novo curso.");
            }

            const [newCourse] = await db.insert(courses).values({
                title,
                language,
                languageCode,
                imageSrc,
            }).returning();

            await logAdminAction("CREATE_COURSE", newCourse.id.toString(), JSON.stringify({ title, language, languageCode }));
        }
    } catch (error) {
        console.error("[COURSE_SAVE_ERROR]", error);
        return actionError("SERVER_ERROR", "Erro ao guardar o curso. Tenta novamente.");
    }

    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/courses");
    redirect("/admin/courses");
}
