"use server";

import { currentUser } from "@clerk/nextjs/server";
import { generateTextWithFallback } from "@/lib/ai-manager";
import { db } from "@/db/drizzle";
import { units, lessons, challenges, challengeOptions } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { AI_TOPICS, GENERATION_STYLES } from "@/lib/ai-topics";
import { aiRateLimit } from "@/lib/ratelimit";

// ── Helpers ──────────────────────────────────────────────

import { validateAdmin, logAdminAction } from "@/lib/admin-guard";

async function assertAdmin() {
    const { userId } = await validateAdmin();
    return { id: userId };
}

function cleanText(text: any): string {
    if (!text) return "";
    return String(text).trim();
}

const VALID_TYPES = ["SELECT", "ASSIST", "INSERT", "MATCH", "DICTATION"] as const;
type ChallengeType = typeof VALID_TYPES[number];

// ── Prompt Builder (Faithful port from Python) ───────────

function buildPrompt(
    topicName: string,
    focusArea: string,
    targetLang: string,
    level: string,
    style: string,
    seed: number
): string {
    const jsonStructure = `
    {
      "unit_title": "String (In Target Language)",
      "unit_description": "String (In Target Language)",
      "lessons": [
        {
          "title": "String (In Target Language)",
          "challenges": [
            {
              "type": "String (MUST BE 'SELECT', 'INSERT', 'MATCH', or 'DICTATION')",
              "context": "String (A scenario, dialogue, or short text. MANDATORY for SELECT/INSERT. Optional for MATCH/DICTATION.)",
              "context_audio_lang": "String (BCP-47 language code)",
              "question": "String (For SELECT: The specific query. For INSERT: context with '_____' blank. For MATCH: 'Encontra os pares corretos.' For DICTATION: The exact sentence to be dictated, 4-10 words in the target language.)",
              "question_audio_lang": "String (BCP-47 language code, CRITICAL for DICTATION — must be the target language code)",
              "options": "Array. For SELECT/INSERT: 3 options (1 correct=true, 2 correct=false). For MATCH: EXACTLY 8 options (4 pairs). For DICTATION: 1 option with correct=true containing the exact answer text.",
              "options_example_for_MATCH": [
                { "text": "Merger", "correct": false, "audio_lang": "en-US" },
                { "text": "Stakeholder", "correct": false, "audio_lang": "en-US" },
                { "text": "Revenue", "correct": false, "audio_lang": "en-US" },
                { "text": "Deadline", "correct": false, "audio_lang": "en-US" },
                { "text": "Fusão", "correct": true, "audio_lang": "pt-PT" },
                { "text": "Parte Interessada", "correct": true, "audio_lang": "pt-PT" },
                { "text": "Receita", "correct": true, "audio_lang": "pt-PT" },
                { "text": "Prazo", "correct": true, "audio_lang": "pt-PT" }
              ],
              "explanation": "String (Pedagogical explanation in PORTUGUESE. Explain WHY it's correct based on context.)"
            }
          ]
        }
      ]
    }`;

    let base = `
Role: Senior Language Curriculum Designer.
Target Language: ${targetLang.toUpperCase()}
Source Language: PORTUGUESE.
Topic: "${topicName}" (Style: ${style})
Focus Area: ${focusArea}
Seed: ${seed}

=== PEDAGOGICAL METHOD: HYBRID SLIDING SCALE ===
`;

    if (level === "A1") {
        base += "RATIO: 80% Direct Translation / 20% Simple Context.\nThis level tests basic building blocks. Keep sentences short.\n";
    } else if (level === "A2_B1") {
        base += "RATIO: 50% Isolated Drill / 50% Contextual Inference.\nProvide 2-3 sentence scenarios for context challenges.\n";
    } else if (level === "B2") {
        base += "RATIO: 20% Isolated Grammar / 80% Contextual Inference & Collocations.\nUse 3-5 sentence passages. Test natural combinations.\n";
    } else {
        // C1_C2
        base += "RATIO: 0% Isolated. 100% Complex Context.\nFocus on tone, irony, idioms, inversions. Every distractor must be plausible.\n";
    }

    base += `
=== GENERATION RULES ===
1. Generate exactly 1 Unit, 3 Lessons per Unit, and 4 to 5 Challenges per lesson.
2. **AUDIO LANGUAGE TAGS**: You MUST determine the correct BCP 47 language code for reading the text aloud. If the text is an instruction or explanation in Portuguese, use 'pt-PT'. If the text is the target language, use the target language's code (e.g., 'es-ES', 'en-US', 'fr-FR').
3. NO Markdown markdown blocks. Output MUST be ONLY valid, pure JSON format matching exactly this structure:
${jsonStructure}

=== REGRAS DE METODOLOGIA POLIGLOTA (CRÍTICO) ===
1. É ESTRITAMENTE PROIBIDO usar o formato "Como se diz X?".
2. Exercícios 'SELECT' (Múltipla Escolha): O contexto dá a pista, e as opções são palavras parecidas onde só uma faz sentido.
3. Exercícios 'INSERT' (Cloze Deletion): Usa-os para Active Recall. O campo 'question' deve conter a frase/contexto com uma lacuna "______" para o utilizador escrever. Se o type for INSERT, as options devem conter na mesma a Correct Answer (os distractors podem ir vazios ou ignorados).
4. Distribuição: Garante que os desafios têm tipos variados: ~30% SELECT, ~30% INSERT, ~20% MATCH, ~20% DICTATION.
5. Exercícios 'MATCH' (Pares Mágicos): Servem para limpeza mental e rapidez. O campo 'context' pode ficar vazio ou ter uma frase simples. O array de 'options' TEM DE TER EXATAMENTE 8 ITENS: 4 palavras no target language (correct: false) e as suas 4 traduções diretas em Português (correct: true). Os pares DEVEM estar na mesma ordem (opção 0 traduz para opção 4, opção 1 para opção 5, etc.).
6. Exercícios 'DICTATION' (Eco / Ditado): Servem para treinar o Listening e a escrita. O campo 'question' deve conter a frase exata que vai ser ditada (escondida do utilizador na UI). O 'context' pode estar vazio. A frase deve ter entre 4 a 10 palavras no target language. O 'question_audio_lang' DEVE ser o código da língua alvo. As 'options' devem ter 1 item com correct=true contendo o texto exato da resposta.
`;

    return base;
}

// ── The Main Generation Action ───────────────────────────

export async function generateCourseContent(
    courseId: number,
    targetLang: string,
    topicId: number,
    level: string
) {
    const user = await assertAdmin();

    // Rate Limiting (Protects Gemini Quota)
    const { success } = await aiRateLimit.limit(user.id);
    if (!success) {
        throw new Error("Rate limit exceeded. Por favor, aguarda um minuto antes de gerar mais conteúdo.");
    }

    const topic = AI_TOPICS.find((t) => t.id === topicId);
    if (!topic) throw new Error(`Topic ID ${topicId} not found.`);

    const style = GENERATION_STYLES[Math.floor(Math.random() * GENERATION_STYLES.length)];
    const seed = Math.floor(Math.random() * 9000) + 1000;

    const promptText = buildPrompt(topic.name, topic.focus, targetLang, level, style, seed);

    // ── Call Gemini ──
    
    

    let rawJson = await generateTextWithFallback(promptText, undefined, { temperature: 0.7, responseMimeType: "application/json" });

    // Clean possible markdown artifacts
    rawJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();

    let data: any;
    try {
        data = JSON.parse(rawJson);
    } catch (e) {
        console.error("[AI_GENERATOR] Failed to parse JSON:", rawJson.substring(0, 500));
        throw new Error("A IA gerou uma resposta inválida. Tenta novamente.");
    }

    // ── Insert into DB with Drizzle Transaction ──
    await db.transaction(async (tx) => {
        // 1. Get current unit count for ordering
        const [unitCountResult] = await tx
            .select({ value: count() })
            .from(units)
            .where(eq(units.courseId, courseId));
        const unitOrder = (unitCountResult?.value ?? 0) + 1;

        // 2. Insert Unit
        const unitTitle = cleanText(data.unit_title || "Untitled Unit");
        const unitDescription = cleanText(data.unit_description || "");

        const [insertedUnit] = await tx
            .insert(units)
            .values({
                title: unitTitle,
                description: unitDescription,
                order: unitOrder,
                courseId: courseId,
            })
            .returning({ id: units.id });

        const unitId = insertedUnit.id;

        // 3. Loop Lessons
        const lessonsData = data.lessons || [];
        for (let idxL = 0; idxL < lessonsData.length; idxL++) {
            const lesson = lessonsData[idxL];
            const lessonTitle = cleanText(lesson.title || `Lesson ${idxL + 1}`);

            const [insertedLesson] = await tx
                .insert(lessons)
                .values({
                    title: lessonTitle,
                    order: idxL + 1,
                    unitId: unitId,
                })
                .returning({ id: lessons.id });

            const lessonId = insertedLesson.id;

            // 4. Loop Challenges
            const challengesData = lesson.challenges || [];
            for (let idxC = 0; idxC < challengesData.length; idxC++) {
                const chall = challengesData[idxC];

                let challengeType = cleanText(chall.type || "SELECT") as ChallengeType;
                if (!VALID_TYPES.includes(challengeType)) {
                    challengeType = "SELECT";
                }

                const [insertedChallenge] = await tx
                    .insert(challenges)
                    .values({
                        question: cleanText(chall.question),
                        type: challengeType,
                        order: idxC + 1,
                        lessonId: lessonId,
                        context: cleanText(chall.context) || null,
                        explanation: cleanText(chall.explanation) || null,
                        questionAudioLang: cleanText(chall.question_audio_lang) || null,
                        contextAudioLang: cleanText(chall.context_audio_lang) || null,
                    })
                    .returning({ id: challenges.id });

                const challengeId = insertedChallenge.id;

                // 5. Loop Options
                const optionsData = chall.options || [];
                for (const opt of optionsData) {
                    await tx.insert(challengeOptions).values({
                        text: cleanText(opt.text),
                        correct: Boolean(opt.correct),
                        audioLang: cleanText(opt.audio_lang) || null,
                        challengeId: challengeId,
                    });
                }
            }
        }
    });

    await logAdminAction(
        "AI_GENERATE_UNIT", 
        courseId.toString(), 
        JSON.stringify({ 
            topicId, 
            level, 
            targetLang,
            unitTitle: cleanText(data.unit_title) 
        })
    );

    // ── Revalidate Paths ──
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/admin/lessons");
    revalidatePath(`/lesson`);
    revalidatePath("/learn");

    return {
        success: true,
        unitTitle: cleanText(data.unit_title),
        lessonsCount: (data.lessons || []).length,
    };
}
