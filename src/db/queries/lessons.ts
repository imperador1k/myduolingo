import { cache } from "react";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and, inArray } from "drizzle-orm";
import { db } from "../drizzle";
import { units, lessons, challenges, challengeProgress, userProgress, challengeMistakes } from "../schema";
import { getUserProgress, getUserProgressById } from "./users";

export const getUnits = cache(async () => {
    const { userId } = await auth();
    const userProgressData = await getUserProgress();

    if (!userId || !userProgressData?.activeCourseId) return [];

    const data = await db.query.units.findMany({
        where: eq(units.courseId, userProgressData.activeCourseId),
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    challenges: {
                        orderBy: (challenges, { asc }) => [asc(challenges.order)],
                        with: {
                            challengeProgress: {
                                where: eq(challengeProgress.userId, userId),
                            },
                        },
                    },
                },
            },
        },
    });

    return data.map((unit) => {
        const lessonsWithCompletion = unit.lessons.map((lesson) => {
            const hasChallenges = lesson.challenges && lesson.challenges.length > 0;
            const allChallengesCompleted = hasChallenges && lesson.challenges.every((challenge) => {
                return challenge.challengeProgress && challenge.challengeProgress.length > 0 && challenge.challengeProgress.every((p) => p.completed);
            });
            return { ...lesson, completed: allChallengesCompleted };
        });
        return { ...unit, lessons: lessonsWithCompletion };
    });
});

export const getUnitsForUser = cache(async (userId: string) => {
    const userProgressData = await getUserProgressById(userId);
    if (!userProgressData?.activeCourseId) return [];

    const data = await db.query.units.findMany({
        where: eq(units.courseId, userProgressData.activeCourseId),
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    challenges: {
                        orderBy: (challenges, { asc }) => [asc(challenges.order)],
                        with: {
                            challengeProgress: { where: eq(challengeProgress.userId, userId) },
                        },
                    },
                },
            },
        },
    });

    return data.map((unit) => {
        const lessonsWithCompletion = unit.lessons.map((lesson) => {
            const hasChallenges = lesson.challenges && lesson.challenges.length > 0;
            const allChallengesCompleted = hasChallenges && lesson.challenges.every((challenge) => {
                return challenge.challengeProgress && challenge.challengeProgress.length > 0 && challenge.challengeProgress.every((p) => p.completed);
            });
            return { ...lesson, completed: allChallengesCompleted };
        });
        return { ...unit, lessons: lessonsWithCompletion };
    });
});

export const getCurrentUnit = cache(async () => {
    const unitsData = await getUnits();
    const activeUnit = unitsData.find((unit) => unit.lessons.some((lesson) => !lesson.completed));
    if (!activeUnit && unitsData.length > 0) return unitsData[unitsData.length - 1];
    return activeUnit;
});

export const getLesson = cache(async (id?: number) => {
    const { userId } = await auth();
    if (!userId) return null;

    let lessonId = id;
    if (!lessonId) {
        const unitsData = await getUnits();
        for (const unit of unitsData) {
            for (const lesson of unit.lessons) {
                if (!lesson.completed) {
                    lessonId = lesson.id;
                    break;
                }
            }
            if (lessonId) break;
        }
    }

    if (!lessonId) return null;

    const data = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
            challenges: {
                orderBy: (challenges, { asc }) => [asc(challenges.order)],
                with: {
                    challengeOptions: true,
                    challengeProgress: { where: eq(challengeProgress.userId, userId) },
                },
            },
        },
    });

    if (!data || !data.challenges) return null;

    const normalizedChallenges = data.challenges.map((challenge) => {
        const completed = challenge.challengeProgress && challenge.challengeProgress.length > 0 && challenge.challengeProgress.every((p) => p.completed);
        return { ...challenge, completed };
    });

    return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
    const lesson = await getLesson();
    if (!lesson) return 0;
    const completedChallenges = lesson.challenges.filter((c) => c.completed);
    return Math.round((completedChallenges.length / lesson.challenges.length) * 100);
});

export const getHeartClinicLesson = cache(async () => {
    const { userId } = await auth();
    if (!userId) return null;

    const userProgressData = await getUserProgress();
    if (!userProgressData?.activeCourseId) return null;

    const mistakesQuery = await db
        .select({ challengeId: challengeMistakes.challengeId })
        .from(challengeMistakes)
        .innerJoin(challenges, eq(challengeMistakes.challengeId, challenges.id))
        .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
        .innerJoin(units, eq(lessons.unitId, units.id))
        .where(and(eq(challengeMistakes.userId, userId), eq(units.courseId, userProgressData.activeCourseId)))
        .orderBy(desc(challengeMistakes.createdAt))
        .limit(10);

    const mistakeIds = mistakesQuery.map(m => m.challengeId);
    let fillerIds: number[] = [];

    if (mistakeIds.length < 10) {
        const needed = 10 - mistakeIds.length;
        const completedQuery = await db
            .select({ challengeId: challengeProgress.challengeId })
            .from(challengeProgress)
            .innerJoin(challenges, eq(challengeProgress.challengeId, challenges.id))
            .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
            .innerJoin(units, eq(lessons.unitId, units.id))
            .where(and(eq(challengeProgress.userId, userId), eq(challengeProgress.completed, true), eq(units.courseId, userProgressData.activeCourseId)))
            .limit(needed + 20);

        fillerIds = completedQuery.map(c => c.challengeId).filter(id => !mistakeIds.includes(id)).slice(0, needed);
    }

    const allChallengeIds = [...mistakeIds, ...fillerIds];
    if (allChallengeIds.length === 0) return null;

    const clinicChallenges = await db.query.challenges.findMany({
        where: inArray(challenges.id, allChallengeIds),
        with: {
            challengeOptions: true,
            challengeProgress: { where: eq(challengeProgress.userId, userId) },
        },
    });

    return {
        id: -1,
        title: "Clínica de Erros",
        order: 0,
        unitId: 0,
        challenges: clinicChallenges.map(challenge => ({ ...challenge, completed: false })),
    };
});

export const completeClinicLesson = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const progress = await getUserProgress();
    if (!progress) throw new Error("User progress not found");

    const newHearts = Math.min((progress.hearts || 0) + 1, 5);
    await db.update(userProgress).set({ hearts: newHearts }).where(eq(userProgress.userId, userId));

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/shop");
    return { hearts: newHearts };
};
