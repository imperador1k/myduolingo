"use server";

import { generateTextWithFallback } from "@/lib/ai-manager";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { userProgress, placementTestHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserProgress } from "@/db/queries";
import { revalidatePath } from "next/cache";

// ============================================================
// Helper: Get user's active course language (for pre-selection)
// ============================================================
export async function getActiveLanguage(): Promise<string | null> {
    try {
        const progress = await getUserProgress();
        return progress?.activeLanguage || null;
    } catch {
        return null;
    }
}

// ============================================================
// Helper: Robust JSON extraction from LLM response
// ============================================================
function extractJSON(text: string): string {
    let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    const firstBracket = clean.indexOf("[");
    const firstBrace = clean.indexOf("{");

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        const lastBracket = clean.lastIndexOf("]");
        if (lastBracket > firstBracket) {
            return clean.substring(firstBracket, lastBracket + 1);
        }
    }

    if (firstBrace !== -1) {
        const lastBrace = clean.lastIndexOf("}");
        if (lastBrace > firstBrace) {
            return clean.substring(firstBrace, lastBrace + 1);
        }
    }

    return clean;
}

// ============================================================
// Helper: Single LLM call with JSON parsing + error handling
// ============================================================
async function safeLLMCall<T>(prompt: string, validator: (data: unknown) => data is T): Promise<T | null> {
    try {
        const text = await generateTextWithFallback(prompt);
        const cleanJSON = extractJSON(text);
        const parsed = JSON.parse(cleanJSON);
        if (validator(parsed)) return parsed;
        console.warn("LLM response failed validation");
        return null;
    } catch (error) {
        console.error("LLM call failed:", error);
        return null;
    }
}

// ============================================================
// 1. GENERATE PLACEMENT BATCH — 3× Micro-Batched → 45 Questions
// ============================================================

export type PlacementQuestion = {
    level: string;
    question: string;
    options: { text: string; is_correct: boolean }[];
};

function isQuestionArray(data: unknown): data is PlacementQuestion[] {
    return Array.isArray(data) && data.length >= 5 && data.every(
        (q: any) => q.level && q.question && Array.isArray(q.options) && q.options.length >= 3
    );
}

export const generatePlacementBatch = async (
    targetLanguage: string
): Promise<{ questions: PlacementQuestion[] }> => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const prompt = `You are an expert CEFR Language Assessor.

Generate a JSON array of exactly 15 multiple-choice grammar and vocabulary questions for **${targetLanguage}**.

Requirements:
- Exactly 3 questions per CEFR level: A1, A2, B1, B2, C1
- Each question must have exactly 4 options
- Exactly 1 option per question must be correct (is_correct: true)
- Questions should test grammar and vocabulary appropriate for each level
- Distractors must be plausible and not obviously wrong
- Questions should be written IN ${targetLanguage} (not translations)
- A1: basic vocabulary, present tense, greetings
- A2: past tense, daily routines, prepositions
- B1: conditionals, connectors, opinions
- B2: subjunctive, passive voice, abstract topics
- C1: idioms, nuance, academic register
- Make each question UNIQUE and different from typical textbook questions

Return ONLY a raw JSON array (no markdown, no backticks, no explanation):
[{ "level": "A1", "question": "...", "options": [{ "text": "...", "is_correct": false }] }]`;

    // Fire 3 parallel LLM calls
    const results = await Promise.all([
        safeLLMCall<PlacementQuestion[]>(prompt, isQuestionArray),
        safeLLMCall<PlacementQuestion[]>(prompt, isQuestionArray),
        safeLLMCall<PlacementQuestion[]>(prompt, isQuestionArray),
    ]);

    // Merge successful results
    const merged: PlacementQuestion[] = [];
    for (const batch of results) {
        if (batch) merged.push(...batch);
    }

    // If we got at least some questions, return them
    if (merged.length >= 10) {
        return { questions: merged };
    }

    // Full fallback
    console.warn("All LLM batches failed or insufficient, using fallback questions");
    const fallback: PlacementQuestion[] = [
        { level: "A1", question: "She ___ a student.", options: [{ text: "is", is_correct: true }, { text: "are", is_correct: false }, { text: "am", is_correct: false }, { text: "be", is_correct: false }] },
        { level: "A1", question: "I ___ from Brazil.", options: [{ text: "is", is_correct: false }, { text: "am", is_correct: true }, { text: "are", is_correct: false }, { text: "be", is_correct: false }] },
        { level: "A1", question: "They ___ happy.", options: [{ text: "is", is_correct: false }, { text: "am", is_correct: false }, { text: "are", is_correct: true }, { text: "be", is_correct: false }] },
        { level: "A2", question: "She ___ to the store yesterday.", options: [{ text: "go", is_correct: false }, { text: "goes", is_correct: false }, { text: "went", is_correct: true }, { text: "going", is_correct: false }] },
        { level: "A2", question: "I have ___ finished my homework.", options: [{ text: "already", is_correct: true }, { text: "yet", is_correct: false }, { text: "still", is_correct: false }, { text: "never", is_correct: false }] },
        { level: "A2", question: "The book is ___ the table.", options: [{ text: "in", is_correct: false }, { text: "on", is_correct: true }, { text: "at", is_correct: false }, { text: "to", is_correct: false }] },
        { level: "B1", question: "If I ___ more time, I would travel.", options: [{ text: "have", is_correct: false }, { text: "had", is_correct: true }, { text: "has", is_correct: false }, { text: "having", is_correct: false }] },
        { level: "B1", question: "She speaks French ___ she lived in Paris.", options: [{ text: "so", is_correct: false }, { text: "because", is_correct: true }, { text: "but", is_correct: false }, { text: "and", is_correct: false }] },
        { level: "B1", question: "I ___ never been to Japan.", options: [{ text: "has", is_correct: false }, { text: "have", is_correct: true }, { text: "had", is_correct: false }, { text: "am", is_correct: false }] },
        { level: "B2", question: "The report ___ by the committee last week.", options: [{ text: "was reviewed", is_correct: true }, { text: "reviewed", is_correct: false }, { text: "is reviewed", is_correct: false }, { text: "reviewing", is_correct: false }] },
        { level: "B2", question: "Had I known, I ___ differently.", options: [{ text: "would act", is_correct: false }, { text: "would have acted", is_correct: true }, { text: "will act", is_correct: false }, { text: "acted", is_correct: false }] },
        { level: "B2", question: "It is essential that he ___ on time.", options: [{ text: "arrives", is_correct: false }, { text: "arrive", is_correct: true }, { text: "arrived", is_correct: false }, { text: "arriving", is_correct: false }] },
        { level: "C1", question: "Not only ___ the exam, but she also got the highest score.", options: [{ text: "she passed", is_correct: false }, { text: "did she pass", is_correct: true }, { text: "she did pass", is_correct: false }, { text: "passed she", is_correct: false }] },
        { level: "C1", question: "The project was completed ___ budget and ahead of schedule.", options: [{ text: "under", is_correct: true }, { text: "below", is_correct: false }, { text: "beneath", is_correct: false }, { text: "within", is_correct: false }] },
        { level: "C1", question: "He tends to ___ his problems under the carpet.", options: [{ text: "brush", is_correct: false }, { text: "sweep", is_correct: true }, { text: "push", is_correct: false }, { text: "throw", is_correct: false }] },
    ];
    return { questions: fallback };
};

// ============================================================
// 2. GENERATE COMPREHENSION — 3× Micro-Batched → 3 Exercises
// ============================================================

export type ComprehensionData = {
    text: string;
    questions: {
        question: string;
        options: { text: string; is_correct: boolean }[];
    }[];
};

function isComprehensionData(data: unknown): data is ComprehensionData {
    const d = data as any;
    return d && typeof d.text === "string" && d.text.length > 20 &&
        Array.isArray(d.questions) && d.questions.length >= 2 &&
        d.questions.every((q: any) => q.question && Array.isArray(q.options));
}

export const generateComprehension = async (
    estimatedLevel: string,
    targetLanguage: string,
    skill: "reading" | "listening"
): Promise<ComprehensionData[]> => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const textType = skill === "listening"
        ? "a natural spoken monologue or dialogue (optimized for text-to-speech playback)"
        : "an engaging article or narrative passage";

    const makePrompt = (variation: number) => `You are a CEFR Assessor for ${targetLanguage}.

Generate ONE ${textType} at CEFR level ${estimatedLevel} in ${targetLanguage} (approximately 120 words).
Topic variation seed: ${variation}. Make the topic unique and different.

Then create exactly 2 multiple-choice comprehension questions that test INFERENCE and deeper understanding — NOT direct translation or surface-level recall.

Each question must have exactly 4 options with exactly 1 correct answer.

Return ONLY raw JSON (no markdown, no backticks):
{
  "text": "The passage text here...",
  "questions": [
    { "question": "Q1...", "options": [{ "text": "A", "is_correct": false }, { "text": "B", "is_correct": true }, { "text": "C", "is_correct": false }, { "text": "D", "is_correct": false }] },
    { "question": "Q2...", "options": [{ "text": "A", "is_correct": false }, { "text": "B", "is_correct": false }, { "text": "C", "is_correct": true }, { "text": "D", "is_correct": false }] }
  ]
}`;

    // Fire 3 parallel LLM calls with different topic seeds
    const results = await Promise.all([
        safeLLMCall<ComprehensionData>(makePrompt(1), isComprehensionData),
        safeLLMCall<ComprehensionData>(makePrompt(2), isComprehensionData),
        safeLLMCall<ComprehensionData>(makePrompt(3), isComprehensionData),
    ]);

    // Collect successful results
    const exercises: ComprehensionData[] = results.filter((r): r is ComprehensionData => r !== null);

    if (exercises.length > 0) {
        return exercises;
    }

    // Full fallback — single exercise
    console.warn("All comprehension LLM calls failed, using fallback");
    return [{
        text: "The city of Lisbon is known for its beautiful architecture and rich history. Many visitors come to explore the narrow streets of Alfama, the oldest district. The famous yellow trams carry tourists up and down the steep hills. Portuguese cuisine, especially fresh seafood and pastéis de nata, attracts food lovers from around the world. The Tagus River adds a serene backdrop to this vibrant capital.",
        questions: [
            { question: "What can we infer about Lisbon's geography?", options: [{ text: "It is completely flat", is_correct: false }, { text: "It has hills and is near a river", is_correct: true }, { text: "It is in the mountains", is_correct: false }, { text: "It is on an island", is_correct: false }] },
            { question: "Why might tourists enjoy visiting Alfama?", options: [{ text: "It has modern skyscrapers", is_correct: false }, { text: "It offers a sense of historical charm", is_correct: true }, { text: "It has the best shopping malls", is_correct: false }, { text: "It is the newest part of the city", is_correct: false }] },
        ],
    }];
};

// ============================================================
// 3. GENERATE WRITING TOPIC (Phase 4)
// ============================================================

export type WritingTopic = {
    topic: string;
    instruction: string;
};

export const generateWritingTopic = async (
    estimatedLevel: string,
    targetLanguage: string
): Promise<WritingTopic> => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const prompt = `You are a CEFR Examiner for ${targetLanguage}.

Generate a short writing prompt appropriate for CEFR level ${estimatedLevel} in ${targetLanguage}.
The student should write approximately 50 words.

Return ONLY raw JSON (no markdown, no backticks):
{
  "topic": "The topic title in ${targetLanguage}",
  "instruction": "Clear instruction telling the student what to write about, in ${targetLanguage}. Keep it simple and concrete."
}`;

    try {
        const text = await generateTextWithFallback(prompt);
        const cleanJSON = extractJSON(text);
        return JSON.parse(cleanJSON);
    } catch (error) {
        console.error("Error generating writing topic:", error);
        return {
            topic: "My Daily Routine",
            instruction: "Describe what you usually do on a typical day. Include at least 3 activities.",
        };
    }
};

// ============================================================
// 4. GRADE WRITING OUTPUT (Phase 4 - Final Verdict)
// ============================================================

export type GradeResult = {
    final_cefr_level: string;
    feedback: string;
};

export const gradeWritingOutput = async (
    userText: string,
    estimatedLevel: string,
    targetLanguage: string
): Promise<GradeResult> => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const prompt = `You are a CEFR Examiner for ${targetLanguage}.

Evaluate the following text written by a student. Their estimated level from previous test phases was ${estimatedLevel}.

Student's text:
"""
${userText}
"""

Consider:
1. Grammar accuracy for the estimated level
2. Vocabulary range and appropriateness
3. Coherence and structure
4. Task completion

Based on ALL of the above, determine the student's FINAL CEFR level. You may confirm the estimated level or adjust it up/down by one level based on writing quality.

Valid levels: A1, A2, B1, B2, C1, C2

Return ONLY raw JSON (no markdown, no backticks):
{
  "final_cefr_level": "B1",
  "feedback": "Detailed, encouraging feedback in Portuguese about their writing quality and final placement. Mention specific strengths and areas for improvement."
}`;

    try {
        const text = await generateTextWithFallback(prompt);
        const cleanJSON = extractJSON(text);
        const data: GradeResult = JSON.parse(cleanJSON);

        if (!data.final_cefr_level || !data.feedback) {
            throw new Error("Invalid grade result from LLM");
        }

        const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
        if (!validLevels.includes(data.final_cefr_level)) {
            data.final_cefr_level = estimatedLevel;
        }

        return data;
    } catch (error) {
        console.error("Error grading writing:", error);
        return {
            final_cefr_level: estimatedLevel,
            feedback: "Não foi possível analisar o teu texto neste momento. O teu nível estimado foi mantido com base nas fases anteriores.",
        };
    }
};

// ============================================================
// 5. SAVE PLACEMENT RESULT — Per-Language JSON Merge
// ============================================================

export const savePlacementResult = async (
    finalLevel: string,
    languageTested: string
): Promise<{ success: boolean }> => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        // 1. Read existing cefrLevels JSON
        const existing = await db
            .select({ cefrLevels: userProgress.cefrLevels })
            .from(userProgress)
            .where(eq(userProgress.userId, userId))
            .limit(1);

        const currentLevels = (existing[0]?.cefrLevels as Record<string, string>) || {};

        // 2. Merge the new language result into the JSON
        const updatedLevels = {
            ...currentLevels,
            [languageTested]: finalLevel,
        };

        // 3. Write back the merged JSON
        await db
            .update(userProgress)
            .set({ cefrLevels: updatedLevels })
            .where(eq(userProgress.userId, userId));

        // 4. Insert history record as normal
        await db.insert(placementTestHistory).values({
            userId,
            languageTested,
            finalLevel,
        });

        revalidatePath("/learn");
        revalidatePath("/profile");
        revalidatePath("/evaluation");

        return { success: true };
    } catch (error) {
        console.error("Error saving placement result:", error);
        return { success: false };
    }
};

// ============================================================
// 6. HELPER: Get User Level for a Specific Language
// ============================================================

export const getUserLevelForLanguage = async (
    language: string
): Promise<{ level: string; isEvaluated: boolean }> => {
    const { userId } = await auth();
    if (!userId) return { level: "B1", isEvaluated: false };

    try {
        const result = await db
            .select({ cefrLevels: userProgress.cefrLevels })
            .from(userProgress)
            .where(eq(userProgress.userId, userId))
            .limit(1);

        const levels = (result[0]?.cefrLevels as Record<string, string>) || {};

        if (levels[language]) {
            return { level: levels[language], isEvaluated: true };
        }

        return { level: "B1", isEvaluated: false }; // Default to B1 if no level recorded
    } catch (error) {
        console.error("Error fetching user level for language:", error);
        return { level: "B1", isEvaluated: false };
    }
};
