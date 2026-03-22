import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and, asc } from "drizzle-orm";
import { db } from "../drizzle";
import { userVocabulary } from "../schema";
import { getUserProgress } from "./users";

export const getUserVocabulary = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];

    const progress = await getUserProgress();
    const activeLanguage = progress?.activeLanguage;
    if (!activeLanguage) return [];

    const data = await db.query.userVocabulary.findMany({
        where: and(eq(userVocabulary.userId, userId), eq(userVocabulary.language, activeLanguage)),
        orderBy: [desc(userVocabulary.createdAt)],
    });

    return data;
});

export const getWeakVocabulary = cache(async () => {
    const { userId } = await auth();
    if (!userId) return [];

    const progress = await getUserProgress();
    const activeLanguage = progress?.activeLanguage;
    if (!activeLanguage) return [];

    const data = await db.query.userVocabulary.findMany({
        where: and(eq(userVocabulary.userId, userId), eq(userVocabulary.language, activeLanguage)),
        orderBy: [asc(userVocabulary.strength), desc(userVocabulary.createdAt)],
        limit: 10,
    });

    return data;
});
