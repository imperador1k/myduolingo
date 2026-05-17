"use server";

import { db } from "@/db/drizzle";
import { units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateAdmin, logAdminAction } from "@/lib/admin-guard";
import { unitSchema, getFirstZodError } from "@/lib/admin-validators";
import { actionError } from "@/lib/action-error";

export async function saveUnitAction(formData: FormData) {
    await validateAdmin();

    const rawId = formData.get("id") as string | null;
    const rawTitle = formData.get("title") as string;
    const rawDescription = formData.get("description") as string;
    const rawOrder = formData.get("order") as string;
    const rawCourseId = formData.get("courseId") as string;

    const parsed = unitSchema.safeParse({
        id: rawId,
        title: rawTitle,
        description: rawDescription,
        order: rawOrder,
        courseId: rawCourseId,
    });

    if (!parsed.success) {
        return actionError("INVALID_PAYLOAD", getFirstZodError(parsed));
    }

    const { id, title, description, order, courseId } = parsed.data;
    const orderNum = parseInt(order);
    const courseIdNum = parseInt(courseId);

    try {
        if (id) {
            const updateData = {
                title,
                description,
                order: orderNum,
                courseId: courseIdNum,
            };

            await db.update(units)
                .set(updateData)
                .where(eq(units.id, parseInt(id)));

            await logAdminAction("UPDATE_UNIT", id, JSON.stringify({ title, courseId }));
        } else {
            const [newUnit] = await db.insert(units).values({
                title,
                description,
                order: orderNum,
                courseId: courseIdNum,
            }).returning();

            await logAdminAction("CREATE_UNIT", newUnit.id.toString(), JSON.stringify({ title, courseId }));
        }
    } catch (error) {
        console.error("[UNIT_SAVE_ERROR]", error);
        return actionError("SERVER_ERROR", "Erro ao guardar a unidade. Tenta novamente.");
    }

    revalidatePath("/admin/units");
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/learn");
    redirect("/admin/units");
}
