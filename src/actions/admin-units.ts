"use server";

import { db } from "@/db/drizzle";
import { units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateAdmin, logAdminAction } from "@/lib/admin-guard";

export async function saveUnitAction(formData: FormData) {
    await validateAdmin();

    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const order = formData.get("order") as string;
    const courseId = formData.get("courseId") as string;

    if (!title || !description || !order || !courseId) {
        throw new Error("Faltam campos obrigatórios para guardar a Unidade.");
    }

    if (id) {
        // UPDATE
        const updateData = {
            title,
            description,
            order: parseInt(order),
            courseId: parseInt(courseId),
        };

        await db.update(units)
            .set(updateData)
            .where(eq(units.id, parseInt(id)));

        await logAdminAction("UPDATE_UNIT", id, JSON.stringify(updateData));
    } else {
        // CREATE
        const [newUnit] = await db.insert(units).values({
            title,
            description,
            order: parseInt(order),
            courseId: parseInt(courseId),
        }).returning();

        await logAdminAction("CREATE_UNIT", newUnit.id.toString(), JSON.stringify({ title, courseId }));
    }

    revalidatePath("/admin/units");
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/learn");
    redirect("/admin/units");
}
