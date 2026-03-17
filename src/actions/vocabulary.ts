"use server";

import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { userVocabulary } from "@/db/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

/**
 * Smart translation: checks the DB first (instant if saved),
 * only calls AI on cache miss.
 */
export const getWordTranslation = async (
    word: string,
    context: string,
    language: string = "English"
) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // ── Step 1: DB Check ─────────────────────────────────
        const existing = await db.query.userVocabulary.findFirst({
            where: and(
                eq(userVocabulary.userId, userId),
                eq(userVocabulary.word, word.toLowerCase()),
                eq(userVocabulary.language, language)
            ),
        });

        if (existing) {
            return {
                translation: existing.translation,
                explanation: existing.explanation || "",
                isAlreadySaved: true,
            };
        }

        // ── Step 2: AI Call (Cache Miss) ─────────────────────
        const prompt = `És um dicionário bilíngue rigoroso. Traduz a palavra '${word}' do idioma ${language} para Português de Portugal, com base neste contexto: '${context}'. Retorna um JSON estrito: 'translation' (APENAS 1 ou 2 palavras diretas, sem pontuação), 'explanation' (MÁXIMO 1 frase curta explicando a nuance no contexto, sem saudações).`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanText = responseText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

        const data = JSON.parse(cleanText);

        return {
            translation: data.translation || `Tradução de "${word}"`,
            explanation: data.explanation || "",
            isAlreadySaved: false,
        };
    } catch (error) {
        console.error("[GET_WORD_TRANSLATION_ERROR]", error);
        return {
            translation: "Erro ao traduzir",
            explanation: "Tenta novamente.",
            isAlreadySaved: false,
        };
    }
};

/**
 * Saves a word to the user's personal vault (userVocabulary table).
 * Prevents duplicates by checking first.
 */
export const saveWordToVault = async (
    word: string,
    translation: string,
    contextSentence: string,
    language: string = "English",
    explanation: string = ""
) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Duplicate guard
        const existing = await db.query.userVocabulary.findFirst({
            where: and(
                eq(userVocabulary.userId, userId),
                eq(userVocabulary.word, word.toLowerCase()),
                eq(userVocabulary.language, language)
            ),
        });

        if (existing) {
            return { success: true, alreadyExists: true };
        }

        await db.insert(userVocabulary).values({
            userId,
            word: word.toLowerCase(),
            translation,
            contextSentence,
            explanation,
            language,
            strength: 1,
        });

        revalidatePath("/vocabulary");

        return { success: true, alreadyExists: false };
    } catch (error) {
        console.error("[SAVE_WORD_TO_VAULT_ERROR]", error);
        throw new Error("Failed to save word to vault");
    }
};

/**
 * Update a word's strength level after a Sprint practice round.
 * knewIt = true → increment (max 4). knewIt = false → decrement (min 1).
 */
export const updateWordStrength = async (id: number, knewIt: boolean) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const existing = await db.query.userVocabulary.findFirst({
            where: and(
                eq(userVocabulary.id, id),
                eq(userVocabulary.userId, userId)
            ),
        });

        if (!existing) {
            throw new Error("Word not found");
        }

        const currentStrength = existing.strength;
        const newStrength = knewIt
            ? Math.min(currentStrength + 1, 4)
            : Math.max(currentStrength - 1, 1);

        await db
            .update(userVocabulary)
            .set({ strength: newStrength })
            .where(eq(userVocabulary.id, id));

        revalidatePath("/vocabulary");
        revalidatePath("/practice/vocabulary");

        return { success: true, newStrength };
    } catch (error) {
        console.error("[UPDATE_WORD_STRENGTH_ERROR]", error);
        throw new Error("Failed to update word strength");
    }
};

/**
 * AI Lifeline: gives a creative hint WITHOUT revealing the direct translation.
 */
export const getAIHint = async (word: string, language: string) => {
    try {
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const prompt = `O utilizador esqueceu-se da tradução de '${word}' em ${language}. Dá-lhe uma pista criativa, uma mnemónica engraçada ou um significado alternativo em Português para o ajudar a adivinhar, MAS NÃO digas a tradução direta! Responde APENAS com a dica em 1-2 frases curtas, sem saudações nem formatação JSON.`;

        const result = await model.generateContent(prompt);
        const hint = result.response.text().trim();

        return { hint };
    } catch (error) {
        console.error("[GET_AI_HINT_ERROR]", error);
        return { hint: "Não consegui gerar uma dica. Tenta revelar a resposta!" };
    }
};
