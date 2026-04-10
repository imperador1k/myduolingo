"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db/drizzle";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ── Helpers ──────────────────────────────────────────────

import { validateAdmin, logAdminAction } from "@/lib/admin-guard";

async function assertAdmin() {
    await validateAdmin();
}

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key);
}

// ── Image Upload ─────────────────────────────────────────

async function uploadCourseImage(file: File): Promise<string> {
    const supabase = getSupabaseAdmin();

    const ext = file.name.split(".").pop() || "png";
    const fileName = `course_${Date.now()}.${ext}`;
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
        console.error("[UPLOAD_ERROR]", error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from("course_images")
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

// ── Save Course (Create or Update) ───────────────────────

export async function saveCourseAction(formData: FormData) {
    await assertAdmin();

    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const language = formData.get("language") as string;
    const languageCode = formData.get("languageCode") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !languageCode || !language) {
        throw new Error("Missing required fields: title, language, languageCode.");
    }

    let imageSrc: string | undefined;

    // Upload image if a new file was provided
    if (imageFile && imageFile.size > 0) {
        imageSrc = await uploadCourseImage(imageFile);
    }

    if (id) {
        // ── UPDATE ──
        const updateData: Record<string, any> = { title, language, languageCode };
        if (imageSrc) updateData.imageSrc = imageSrc;

        await db.update(courses)
            .set(updateData)
            .where(eq(courses.id, parseInt(id)));
            
        await logAdminAction("UPDATE_COURSE", id, JSON.stringify(updateData));
    } else {
        // ── CREATE ──
        if (!imageSrc) {
            throw new Error("Image is required when creating a new course.");
        }

        const [newCourse] = await db.insert(courses).values({
            title,
            language,
            languageCode,
            imageSrc,
        }).returning();

        await logAdminAction("CREATE_COURSE", newCourse.id.toString(), JSON.stringify({ title, language, languageCode }));
    }

    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/courses");
    redirect("/admin/courses");
}
