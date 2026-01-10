import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { db } from "./drizzle";
import {
    courses,
    userProgress,
    units,
    lessons,
    challenges,
    challengeOptions,
    challengeProgress,
} from "./schema";

// ============ USER PROGRESS ============

export const getUserProgress = cache(async () => {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        with: {
            activeCourse: true,
        },
    });

    return data;
});

export const createUserProgress = async (courseId: number) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Check if user already has progress
    const existingProgress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
    });

    if (existingProgress) {
        // Update active course
        await db
            .update(userProgress)
            .set({ activeCourseId: courseId })
            .where(eq(userProgress.userId, userId));
        return { ...existingProgress, activeCourseId: courseId };
    }

    // For new users, we'll use default values
    // The actual name/image comes from Clerk, shown via currentUser() in components
    const [newProgress] = await db
        .insert(userProgress)
        .values({
            userId,
            userName: "Estudante",
            userImageSrc: "/mascot.svg",
            activeCourseId: courseId,
            hearts: 5,
            points: 0,
        })
        .returning();

    return newProgress;
};

// Update user info from Clerk (call after sign-in)
export const updateUserInfo = async (name: string, imageUrl: string) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    await db
        .update(userProgress)
        .set({
            userName: name || "Estudante",
            userImageSrc: imageUrl || "/mascot.svg"
        })
        .where(eq(userProgress.userId, userId));
};

// ============ COURSES ============

export const getCourses = cache(async () => {
    const data = await db.query.courses.findMany();
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

// ============ UNITS & LESSONS ============

export const getUnits = cache(async () => {
    const { userId } = await auth();
    const userProgressData = await getUserProgress();

    if (!userId || !userProgressData?.activeCourseId) {
        return [];
    }

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

    // Calculate completion status for each lesson
    const normalizedData = data.map((unit) => {
        const lessonsWithCompletion = unit.lessons.map((lesson) => {
            // A lesson is only complete if it has challenges AND all are completed
            const hasChallenges = lesson.challenges && lesson.challenges.length > 0;

            const allChallengesCompleted = hasChallenges && lesson.challenges.every((challenge) => {
                return (
                    challenge.challengeProgress &&
                    challenge.challengeProgress.length > 0 &&
                    challenge.challengeProgress.every((progress) => progress.completed)
                );
            });

            return { ...lesson, completed: allChallengesCompleted };
        });

        return { ...unit, lessons: lessonsWithCompletion };
    });

    return normalizedData;
});

export const getLesson = cache(async (id?: number) => {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const userProgressData = await getUserProgress();

    // If no id provided, get the first incomplete lesson
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

    if (!lessonId) {
        return null;
    }

    const data = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
            challenges: {
                orderBy: (challenges, { asc }) => [asc(challenges.order)],
                with: {
                    challengeOptions: true,
                    challengeProgress: {
                        where: eq(challengeProgress.userId, userId),
                    },
                },
            },
        },
    });

    if (!data || !data.challenges) {
        return null;
    }

    // Normalize challenges with completion status
    const normalizedChallenges = data.challenges.map((challenge) => {
        const completed =
            challenge.challengeProgress &&
            challenge.challengeProgress.length > 0 &&
            challenge.challengeProgress.every((progress) => progress.completed);

        return { ...challenge, completed };
    });

    return { ...data, challenges: normalizedChallenges };
});

// ============ CHALLENGE PROGRESS ============

export const getLessonPercentage = cache(async () => {
    const lesson = await getLesson();

    if (!lesson) {
        return 0;
    }

    const completedChallenges = lesson.challenges.filter(
        (challenge) => challenge.completed
    );
    const percentage = Math.round(
        (completedChallenges.length / lesson.challenges.length) * 100
    );

    return percentage;
});

export const upsertChallengeProgress = async (challengeId: number) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const existingProgress = await db.query.challengeProgress.findFirst({
        where: eq(challengeProgress.challengeId, challengeId),
    });

    if (existingProgress) {
        await db
            .update(challengeProgress)
            .set({ completed: true })
            .where(eq(challengeProgress.id, existingProgress.id));
        return;
    }

    await db.insert(challengeProgress).values({
        challengeId,
        userId,
        completed: true,
    });
};

export const reduceHearts = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    if (currentProgress.hearts <= 0) {
        return { error: "hearts" };
    }

    await db
        .update(userProgress)
        .set({ hearts: currentProgress.hearts - 1 })
        .where(eq(userProgress.userId, userId));

    return { hearts: currentProgress.hearts - 1 };
};

export const addPoints = async (amount: number) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    await db
        .update(userProgress)
        .set({ points: currentProgress.points + amount })
        .where(eq(userProgress.userId, userId));

    return { points: currentProgress.points + amount };
};

export const refillHearts = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    await db
        .update(userProgress)
        .set({ hearts: 5 })
        .where(eq(userProgress.userId, userId));

    return { hearts: 5 };
};

// ============ LEADERBOARD ============

export const getTopUsers = cache(async (limit: number = 10) => {
    const data = await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit,
    });
    return data;
});

