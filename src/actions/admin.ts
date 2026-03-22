"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { courses, units, lessons } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Deletes a course by ID. Admin-only.
 * Relations (units, lessons, challenges, etc.) should cascade via DB foreign keys.
 */
export const deleteCourse = async (id: number) => {
    const user = await currentUser();
    const isAdmin = (user?.publicMetadata as any)?.role === "admin";

    if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required.");
    }

    await db.delete(courses).where(eq(courses.id, id));

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
    const user = await currentUser();
    const isAdmin = (user?.publicMetadata as any)?.role === "admin";

    if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required.");
    }

    await db.delete(units).where(eq(units.id, id));

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
    const user = await currentUser();
    const isAdmin = (user?.publicMetadata as any)?.role === "admin";

    if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required.");
    }

    await db.delete(lessons).where(eq(lessons.id, id));

    revalidatePath("/admin/lessons");
    revalidatePath("/admin/units");
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/courses");

    return { success: true };
};
