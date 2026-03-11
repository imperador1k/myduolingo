"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabaseClient";

export const updateCourseDetails = async (courseId: number, formData: FormData) => {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;

    let publicUrlStr: string | undefined;

    if (file && file.size > 0 && file.name) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${courseId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('course_images')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error("Supabase Storage Error:", uploadError);
            throw new Error("Failed to upload image");
        }

        const { data: publicUrlData } = supabase.storage
            .from('course_images')
            .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
            publicUrlStr = publicUrlData.publicUrl;
        }
    }

    const updates: any = {};
    if (publicUrlStr) updates.imageSrc = publicUrlStr;
    if (title) updates.title = title;

    if (Object.keys(updates).length > 0) {
        await db.update(courses)
            .set(updates)
            .where(eq(courses.id, courseId));
    }

    revalidatePath("/courses");
    revalidatePath("/learn");
    
    return { success: true, url: publicUrlStr, title };
};
