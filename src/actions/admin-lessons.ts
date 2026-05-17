"use server";

import { db } from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateAdmin, logAdminAction } from "@/lib/admin-guard";
import { lessonSchema, getFirstZodError } from "@/lib/admin-validators";
import { actionError } from "@/lib/action-error";

export async function saveLessonAction(formData: FormData) {
    await validateAdmin();

    const rawId = formData.get("id") as string | null;
    const rawTitle = formData.get("title") as string;
    const rawOrder = formData.get("order") as string;
    const rawUnitId = formData.get("unitId") as string;

    const parsed = lessonSchema.safeParse({
        id: rawId,
        title: rawTitle,
        order: rawOrder,
        unitId: rawUnitId,
    });

    if (!parsed.success) {
        return actionError("INVALID_PAYLOAD", getFirstZodError(parsed));
    }

    const { id, title, order, unitId } = parsed.data;
    const orderNum = parseInt(order);
    const unitIdNum = parseInt(unitId);

    try {
        if (id) {
            const updateData = {
                title,
                order: orderNum,
                unitId: unitIdNum,
            };

            await db.update(lessons)
                .set(updateData)
                .where(eq(lessons.id, parseInt(id)));

            await logAdminAction("UPDATE_LESSON", id, JSON.stringify({ title, unitId }));
        } else {
            const [newLesson] = await db.insert(lessons).values({
                title,
                order: orderNum,
                unitId: unitIdNum,
            }).returning();

            await logAdminAction("CREATE_LESSON", newLesson.id.toString(), JSON.stringify({ title, unitId }));
        }
    } catch (error) {
        console.error("[LESSON_SAVE_ERROR]", error);
        return actionError("SERVER_ERROR", "Erro ao guardar a lição. Tenta novamente.");
    }

    revalidatePath("/admin/lessons");
    revalidatePath("/admin/units");
    revalidatePath("/admin");
    revalidatePath("/learn");
    redirect("/admin/lessons");
}
