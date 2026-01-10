import { cache } from "react";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and, count, ilike, ne } from "drizzle-orm";
import { db } from "./drizzle";
import {
    courses,
    userProgress,
    units,
    lessons,
    challenges,
    challengeOptions,
    challengeProgress,
    follows,
    notifications,
    messages
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

export const getUserProgressById = cache(async (userId: string) => {
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

export const getUnitsForUser = cache(async (userId: string) => {
    const userProgressData = await getUserProgressById(userId);

    if (!userProgressData?.activeCourseId) {
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

    const normalizedData = data.map((unit) => {
        const lessonsWithCompletion = unit.lessons.map((lesson) => {
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

    const currentTotalXp = currentProgress.totalXpEarned || 0;

    await db
        .update(userProgress)
        .set({
            points: currentProgress.points + amount,
            totalXpEarned: currentTotalXp + amount
        })
        .where(eq(userProgress.userId, userId));

    return { points: currentProgress.points + amount, totalXpEarned: currentTotalXp + amount };
};

export const refillHearts = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    // Only allow full refill if hearts = 0
    if (currentProgress.hearts > 0) {
        return { error: "has_hearts", hearts: currentProgress.hearts };
    }

    // Cost: 100 XP for full refill (5 hearts)
    const cost = 100;

    if (currentProgress.points < cost) {
        return { error: "not_enough_xp", required: cost, current: currentProgress.points };
    }

    await db
        .update(userProgress)
        .set({
            hearts: 5,
            points: currentProgress.points - cost
        })
        .where(eq(userProgress.userId, userId));

    return { hearts: 5, points: currentProgress.points - cost };
};

export const buyOneHeart = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    // Already at max hearts
    if (currentProgress.hearts >= 5) {
        return { error: "hearts_full", hearts: currentProgress.hearts };
    }

    // Cost: 20 XP for 1 heart
    const cost = 20;

    if (currentProgress.points < cost) {
        return { error: "not_enough_xp", required: cost, current: currentProgress.points };
    }

    await db
        .update(userProgress)
        .set({
            hearts: currentProgress.hearts + 1,
            points: currentProgress.points - cost
        })
        .where(eq(userProgress.userId, userId));

    return { hearts: currentProgress.hearts + 1, points: currentProgress.points - cost };
};

// ============ LEADERBOARD ============

export const getTopUsers = cache(async (limit: number = 10) => {
    const data = await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit,
    });
    return data;
});

// ============ STREAK SYSTEM ============

export const updateStreak = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const lastStreakDate = currentProgress.lastStreakDate;

    let newStreak = currentProgress.streak || 0;
    let newLongestStreak = currentProgress.longestStreak || 0;
    let streakBroken = false;

    if (lastStreakDate === today) {
        // Already updated today, no change
        return {
            streak: newStreak,
            longestStreak: newLongestStreak,
            updated: false
        };
    }

    if (lastStreakDate) {
        const lastDate = new Date(lastStreakDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day - increase streak
            newStreak += 1;
        } else if (diffDays > 1) {
            // Missed days - check for streak freeze
            const freezes = currentProgress.streakFreezes || 0;

            if (diffDays === 2 && freezes > 0) {
                // Use streak freeze (only protects 1 missed day)
                newStreak += 1; // Continue streak
                await db
                    .update(userProgress)
                    .set({ streakFreezes: freezes - 1 })
                    .where(eq(userProgress.userId, userId));
            } else {
                // Streak broken
                newStreak = 1;
                streakBroken = true;
            }
        }
    } else {
        // First lesson ever
        newStreak = 1;
    }

    // Update longest streak if needed
    if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
    }

    await db
        .update(userProgress)
        .set({
            streak: newStreak,
            longestStreak: newLongestStreak,
            lastStreakDate: today
        })
        .where(eq(userProgress.userId, userId));

    return {
        streak: newStreak,
        longestStreak: newLongestStreak,
        updated: true,
        streakBroken
    };
};

// ============ POWER-UPS ============

// XP Boost: 150 XP for 5 lessons with double XP
export const buyXpBoost = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    const cost = 150;

    if (currentProgress.points < cost) {
        return { error: "not_enough_xp", required: cost, current: currentProgress.points };
    }

    const currentBoost = currentProgress.xpBoostLessons || 0;

    await db
        .update(userProgress)
        .set({
            xpBoostLessons: currentBoost + 5,
            points: currentProgress.points - cost
        })
        .where(eq(userProgress.userId, userId));

    return { xpBoostLessons: currentBoost + 5, points: currentProgress.points - cost };
};

// Heart Shield: 100 XP for 1 shield
export const buyHeartShield = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    const cost = 100;

    if (currentProgress.points < cost) {
        return { error: "not_enough_xp", required: cost, current: currentProgress.points };
    }

    const currentShields = currentProgress.heartShields || 0;

    await db
        .update(userProgress)
        .set({
            heartShields: currentShields + 1,
            points: currentProgress.points - cost
        })
        .where(eq(userProgress.userId, userId));

    return { heartShields: currentShields + 1, points: currentProgress.points - cost };
};

// Streak Freeze: 40 XP for 1 freeze
export const buyStreakFreeze = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    const cost = 300;

    if (currentProgress.points < cost) {
        return { error: "not_enough_xp", required: cost, current: currentProgress.points };
    }

    const currentFreezes = currentProgress.streakFreezes || 0;

    await db
        .update(userProgress)
        .set({
            streakFreezes: currentFreezes + 1,
            points: currentProgress.points - cost
        })
        .where(eq(userProgress.userId, userId));

    return { streakFreezes: currentFreezes + 1, points: currentProgress.points - cost };
};

// Use heart shield (called when wrong answer)
export const useHeartShield = async () => {
    // ... existing implementation ... (wait, I should not delete content if I can't match exact block easily, but here I am appending at end mostly)
    // Actually I'll append the new queries at the very end of file.

    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    const shields = currentProgress.heartShields || 0;

    if (shields > 0) {
        await db
            .update(userProgress)
            .set({ heartShields: shields - 1 })
            .where(eq(userProgress.userId, userId));

        return { shieldUsed: true, shieldsRemaining: shields - 1 };
    }

    return { shieldUsed: false, shieldsRemaining: 0 };
};

// Consume XP boost lesson (called when lesson completed)
export const consumeXpBoost = async () => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const currentProgress = await getUserProgress();

    if (!currentProgress) {
        throw new Error("User progress not found");
    }

    const boostLessons = currentProgress.xpBoostLessons || 0;

    if (boostLessons > 0) {
        await db
            .update(userProgress)
            .set({ xpBoostLessons: boostLessons - 1 })
            .where(eq(userProgress.userId, userId));

        return { boostActive: true, boostRemaining: boostLessons - 1 };
    }

    return { boostActive: false, boostRemaining: 0 };
};

// ============ SOCIAL ============

export const getFollowers = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];

    const data = await db.query.follows.findMany({
        where: eq(follows.followingId, userId),
        with: {
            follower: true
        }
    });

    return data;
});

export const getFollowing = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];

    const data = await db.query.follows.findMany({
        where: eq(follows.followerId, userId),
        with: {
            following: true
        }
    });

    return data;
});

export const isFollowingUser = cache(async (targetUserId: string) => {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return false;

    const data = await db.query.follows.findFirst({
        where: and(
            eq(follows.followerId, currentUserId),
            eq(follows.followingId, targetUserId)
        ),
    });

    return !!data;
});

export const followUser = async (targetUserId: string) => {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) throw new Error("Unauthorized");

    if (currentUserId === targetUserId) throw new Error("Cannot follow self");

    const existing = await db.query.follows.findFirst({
        where: and(
            eq(follows.followerId, currentUserId),
            eq(follows.followingId, targetUserId)
        ),
    });

    if (existing) return;

    await db.insert(follows).values({
        followerId: currentUserId,
        followingId: targetUserId,
    });

    await db.insert(notifications).values({
        userId: targetUserId,
        type: "FOLLOW",
        message: `Novo seguidor!`,
        link: `/profile/${currentUserId}`,
    });

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath("/friends");
    revalidatePath("/leaderboard");
};

export const unfollowUser = async (targetUserId: string) => {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) throw new Error("Unauthorized");

    await db.delete(follows).where(
        and(
            eq(follows.followerId, currentUserId),
            eq(follows.followingId, targetUserId)
        )
    );

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath("/friends");
    revalidatePath("/leaderboard");
};

export const getNotifications = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];

    const data = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });

    return data;
});

export const getMessages = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];

    const data = await db.query.messages.findMany({
        where: eq(messages.receiverId, userId),
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        with: {
            sender: true
        }
    });

    return data;
});

export const sendMessage = async (receiverId: string, content: string) => {
    const { userId: senderId } = await auth();
    if (!senderId) throw new Error("Unauthorized");

    await db.insert(messages).values({
        senderId,
        receiverId,
        content,
    });

    revalidatePath("/messages");
};

export const getUnreadNotificationCount = cache(async () => {
    const { userId } = await auth();
    if (!userId) return 0;

    const [result] = await db
        .select({ count: count() })
        .from(notifications)
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.read, false)
            )
        );

    return result.count;
});

export const searchUsers = async (query: string) => {
    const { userId } = await auth();
    if (!userId) return [];

    const data = await db.query.userProgress.findMany({
        where: and(
            ilike(userProgress.userName, `%${query}%`),
            ne(userProgress.userId, userId)
        ),
        limit: 10,
    }); // Needs userProgress imported in queries.ts - it is.

    return data;
};
