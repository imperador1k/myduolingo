import { cache } from "react";
import { count, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { courses, userProgress } from "../schema";

export const getCourses = cache(async () => {
    const data = await db
        .select({
            id: courses.id,
            title: courses.title,
            imageSrc: courses.imageSrc,
            languageCode: courses.languageCode,
            language: courses.language,
            studentCount: count(userProgress.id),
        })
        .from(courses)
        .leftJoin(userProgress, eq(courses.id, userProgress.activeCourseId))
        .groupBy(courses.id);

    return data;
});

export const getCourseById = cache(async (courseId: number) => {
    const data = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
        with: {
            units: {
                orderBy: (units, { asc }) => [asc(units.order)],
                with: {
                    lessons: {
                        orderBy: (lessons, { asc }) => [asc(lessons.order)],
                    },
                },
            },
        },
    });
    return data;
});
