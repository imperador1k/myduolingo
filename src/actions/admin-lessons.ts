"use server";

import { db } from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateAdmin, logAdminAction } from "@/lib/admin-guard";

export async function saveLessonAction(formData: FormData) {
    await validateAdmin();

    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const order = formData.get("order") as string;
    const unitId = formData.get("unitId") as string;

    if (!title || !order || !unitId) {
        throw new Error("Faltam campos obrigatórios para guardar a Lição.");
    }

    if (id) {
        // UPDATE
        const updateData = {
            title,
            order: parseInt(order),
            unitId: parseInt(unitId),
        };

        await db.update(lessons)
            .set(updateData)
            .where(eq(lessons.id, parseInt(id)));

        await logAdminAction("UPDATE_LESSON", id, JSON.stringify(updateData));
    } else {
        // CREATE
        const [newLesson] = await db.insert(lessons).values({
            title,
            order: parseInt(order),
            unitId: parseInt(unitId),
        }).returning();

        await logAdminAction("CREATE_LESSON", newLesson.id.toString(), JSON.stringify({ title, unitId }));
    }

    revalidatePath("/admin/lessons");
    revalidatePath("/admin/units");
    revalidatePath("/admin");
    revalidatePath("/learn");
    redirect("/admin/lessons");
}
