"use server";

import { db } from "@/db/drizzle";
import { courses, units, lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { validateAdmin, logAdminAction } from "@/lib/admin-guard";

/**
 * Deletes a course by ID. Admin-only.
 * Relations (units, lessons, challenges, etc.) should cascade via DB foreign keys.
 */
export const deleteCourse = async (id: number) => {
    await validateAdmin();

    await db.delete(courses).where(eq(courses.id, id));
    await logAdminAction("DELETE_COURSE", id.toString());

    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/courses");

    return { success: true };
};

/**
 * Deletes a unit by ID. Admin-only.
 * Relations (lessons, challenges, etc.) should cascade via DB foreign keys.
 */
export const deleteUnit = async (id: number) => {
    await validateAdmin();

    await db.delete(units).where(eq(units.id, id));
    await logAdminAction("DELETE_UNIT", id.toString());

    revalidatePath("/admin/units");
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/courses");

    return { success: true };
};

/**
 * Deletes a lesson by ID. Admin-only.
 * Relations (challenges, options, progress) should cascade via DB foreign keys.
 */
export const deleteLesson = async (id: number) => {
    await validateAdmin();

    await db.delete(lessons).where(eq(lessons.id, id));
    await logAdminAction("DELETE_LESSON", id.toString());

    revalidatePath("/admin/lessons");
    revalidatePath("/admin/units");
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/courses");

    return { success: true };
};
