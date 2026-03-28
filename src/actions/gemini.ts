"use server";

import { generateTextWithFallback } from "@/lib/ai-manager";


import { db } from "@/db/drizzle";
import { courses, units } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserProgress, getCurrentUnit } from "@/db/queries";
import { getAIProfile, type LanguageCode } from "@/lib/ai-config";

// Helper to map course title to BCP 47 language code
const getLanguageCode = (courseTitle: string): LanguageCode => {
    const normalized = courseTitle.toLowerCase();
    if (normalized.includes("spanish") || normalized.includes("espanhol")) return "es";
    if (normalized.includes("french") || normalized.includes("francês") || normalized.includes("frances")) return "fr";
    if (normalized.includes("german") || normalized.includes("alemão") || normalized.includes("alemao")) return "en"; // Fallback to en for now as 'de' is not in AI_CONFIG yet or add it
    if (normalized.includes("italian") || normalized.includes("italiano")) return "en"; // Fallback
    if (normalized.includes("portuguese") || normalized.includes("português")) return "pt";
    return "en"; // Default
};

// ============================================================
// Helper: Robust JSON extraction strategy for generative AI
// ============================================================
function extractJSON(text: string): string {
    let clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Find the first { or [
    const firstBrace = clean.indexOf("{");
    const firstBracket = clean.indexOf("[");

    let startIndex = -1;
    let isArray = false;

    if (firstBrace !== -1 && firstBracket !== -1) {
        if (firstBrace < firstBracket) {
            startIndex = firstBrace;
        } else {
            startIndex = firstBracket;
            isArray = true;
        }
    } else if (firstBrace !== -1) {
        startIndex = firstBrace;
    } else if (firstBracket !== -1) {
        startIndex = firstBracket;
        isArray = true;
    }

    if (startIndex !== -1) {
        const endingChar = isArray ? "]" : "}";
        const endIndex = clean.lastIndexOf(endingChar);
        if (endIndex > startIndex) {
            return clean.substring(startIndex, endIndex + 1);
        }
    }

    return clean;
}

export const generatePracticePrompt = async (
    type: "writing" | "speaking",
    level: string = "B1",
    language: string = "Active Course",
    focusMode: boolean = false
): Promise<{ scenario: string; translation: string; rules: string[]; hints: string[]; languageCode?: string }> => {
    try {
        const randomSeed = Date.now();
        let courseTitle = language;

        // If default or simplified "Active Course", fetch from DB
        if (language === "Active Course" || !language) {
            const userProgress = await getUserProgress();
            if (userProgress?.activeLanguage) {
                courseTitle = userProgress.activeLanguage;
            } else {
                courseTitle = "English"; // Fallback
            }
        }

        const langCode = getLanguageCode(courseTitle);
        const profile = getAIProfile(langCode);
        const personaInstruction = `PERSONA: You are ${profile.persona.name}, role: ${profile.persona.role}. ${profile.persona.description}`;

        let contextInstruction = "";

        // LEVEL-SPECIFIC INSTRUCTIONS (The 5 Pillars)
        let levelInstruction = "";
        switch (level) {
            case "A1":
                levelInstruction = "LEVEL A1 (Beginner). Focus: Concrete nouns, Present tense, Simple SVO sentences. Avoid complex grammar.";
                break;
            case "A2":
                levelInstruction = "LEVEL A2 (Elementary). Focus: Daily routines, Past tense (simple), Prepositions of place.";
                break;
            case "B1":
                levelInstruction = "LEVEL B1 (Intermediate). Focus: Opinions, Future tense, Conditionals, Connectors (because, but).";
                break;
            case "B2":
                levelInstruction = "LEVEL B2 (Upper Intermediate). Focus: Abstract topics, Subjunctive mood, Passive voice, Complex argumentation.";
                break;
            case "C1":
                levelInstruction = "LEVEL C1 (Advanced). Focus: Nuance, Idioms, Academic vocabulary, Structural variety.";
                break;
            case "C2":
                levelInstruction = "LEVEL C2 (Mastery). Focus: Stylistic precision, Irony, Archaic/Literary forms, Complete fluency.";
                break;
            default:
                levelInstruction = "LEVEL B1 (Intermediate).";
        }

        if (focusMode) {
            try {
                // Fetch context specific to the requested language (not relying on global active course)
                const course = await db.query.courses.findFirst({
                    where: eq(courses.language, courseTitle)
                });
                
                if (course) {
                    const firstUnit = await db.query.units.findFirst({
                        where: eq(units.courseId, course.id),
                        orderBy: (units, { asc }) => [asc(units.order)]
                    });
                    
                    if (firstUnit) {
                        contextInstruction = `MODO FOCADO. O tópico deve focar-se ESTRITAMENTE no tema: "${firstUnit.title}" (Descrição: ${firstUnit.description}).`;
                    } else {
                        contextInstruction = `MODO FOCADO (Fallback). Gera um tópico muito BÁSICO e introdutório.`;
                    }
                } else {
                    contextInstruction = `MODO ALEATÓRIO (Nenhum curso encontrado). Cria um cenário quotidiano normal e criativo.`;
                }
            } catch (err) {
                 contextInstruction = `MODO ALEATÓRIO (Fallback Erro). Cria um cenário quotidiano normal.`;
            }
        }

        const prompt =
            type === "writing"
                ? `${personaInstruction}
                   Gera um tópico de escrita criativo para um estudante de ${courseTitle.toUpperCase()} nível ${level}. (Seed: ${randomSeed})
                   ${levelInstruction}
                   ${contextInstruction}
                   Inclui 3 ideias de sub-tópicos ou perguntas para ajudar a desenvolver o texto.
                   Retorna APENAS um JSON no formato:
                   {
                     "text": "O tópico principal em ${courseTitle.toUpperCase()}",
                     "translation": "A tradução do tópico em PORTUGUÊS",
                     "hints": ["Ideia 1 em ${courseTitle}", "Ideia 2 em ${courseTitle}", "Ideia 3 em ${courseTitle}"]
                   }`
                : `${personaInstruction}
                   Gera um tópico de conversação interessante para um estudante de ${courseTitle.toUpperCase()} nível ${level}. (Seed: ${randomSeed})
                   ${levelInstruction}
                   ${contextInstruction}
                   Inclui 3 perguntas de suporte para manter a conversa.
                   Retorna APENAS um JSON no formato:
                   {
                     "text": "A pergunta ou tópico principal em ${courseTitle.toUpperCase()}",
                     "translation": "A tradução em PORTUGUÊS",
                     "hints": ["Ideia 1 em ${courseTitle}", "Ideia 2 em ${courseTitle}", "Ideia 3 em ${courseTitle}"]
                   }`;

        const text = await generateTextWithFallback(prompt);

        // Clean up markdown code blocks if present
        const cleanText = extractJSON(text);

        const data = JSON.parse(cleanText);
        return { ...data, languageCode: profile.voice };
    } catch (error) {
        console.error("Error generating prompt:", error);

        // Fallback topics if API fails
        const fallbacks = [
            {
                scenario: "A server error occurred. For practice, describe your daily routine.",
                translation: "Descreve a tua rotina diária.",
                rules: ["Use the present tense", "Mention at least 3 activities", "Include times of day"],
                hints: ["What time do you wake up?", "What do you do?", "Evening routine"],
            }
        ];

        return {
            ...fallbacks[0],
            languageCode: "en-US"
        };
    }
};

export const analyzeWriting = async (
    text: string,
    prompt: string,
    level: string = "B1",
    language: string = "Active Course"
): Promise<{
    feedback: string;
    corrections: { original: string; correction: string; explication: string }[];
    score: number;
}> => {
    try {
        let courseTitle = language;

        if (language === "Active Course" || !language) {
            const userProgress = await getUserProgress();
            if (userProgress?.activeCourse?.language) {
                courseTitle = userProgress.activeCourse.language;
            } else {
                courseTitle = "English";
            }
        }

        const langCode = getLanguageCode(courseTitle);
        const profile = getAIProfile(langCode);
        const personaInstruction = `PERSONA: You are ${profile.persona.name}, role: ${profile.persona.role}. ${profile.persona.description}`;

        const inputPrompt = `
      ${personaInstruction}
      Aja como um professor nativo de ${courseTitle.toUpperCase()}.
      O aluno está no nível: ${level}. (Seja rigoroso de acordo com este nível).
      O aluno escreveu o seguinte texto em ${courseTitle.toUpperCase()} sobre o tema "${prompt}":
      "${text}"

      Analise o texto e retorne um JSON no seguinte formato:
      {
        "feedback": "Um comentário geral encorajador sobre o texto, EM PORTUGUÊS. Mencione se está adequado ao nível ${level}.",
        "corrections": [
          {
            "original": "Trecho com erro",
            "correction": "Trecho corrigido",
            "explication": "Explicação breve do erro (em Português)"
          }
        ],
        "score": 0 a 100 baseado na gramática e vocabulário para o nível ${level}
      }
      Se não houver erros, o array "corrections" deve estar vazio.
      Retorna APENAS o JSON. Deve ser em Português de Portugal!
    `;

        const responseText = await generateTextWithFallback(inputPrompt);
        const cleanText = extractJSON(responseText);

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error analyzing writing:", error);
        return {
            feedback: "Houve um erro ao analisar sua resposta. Tente novamente mais tarde.",
            corrections: [],
            score: 0,
        };
    }
};

export const analyzeSpeaking = async (
    transcript: string,
    prompt: string,
    level: string = "B1",
    language: string = "Active Course"
): Promise<{
    feedback: string;
    betterWayToSay: string;
    pronunciationTips: string;
    score: number;
}> => {
    try {
        let courseTitle = language;

        if (language === "Active Course" || !language) {
            const userProgress = await getUserProgress();
            if (userProgress?.activeCourse?.language) {
                courseTitle = userProgress.activeCourse.language;
            } else {
                courseTitle = "English";
            }
        }

        const langCode = getLanguageCode(courseTitle);
        const profile = getAIProfile(langCode);
        const personaInstruction = `PERSONA: You are ${profile.persona.name}, role: ${profile.persona.role}. ${profile.persona.description}`;

        const inputPrompt = `
      ${personaInstruction}
      Aja como um professor de ${courseTitle.toUpperCase()} nativo focado em conversação.
      O aluno está no nível: ${level}.
      O aluno disse (transcrição do ${courseTitle}): "${transcript}"
      Sobre o tema: "${prompt}"

      Retorne um JSON no seguinte formato:
      {
        "feedback": "Comentário sobre a clareza e relevância da resposta (em Português), considerando o nível ${level}.",
        "betterWayToSay": "Uma maneira mais natural ou nativa de expressar a mesma ideia em ${courseTitle}.",
        "pronunciationTips": "Dicas gerais de sons que costumam ser difíceis nessas palavras para falantes de português (em Português).",
        "score": 0 a 100 baseado na clareza e naturalidade para o nível ${level}
      }
      Retorna APENAS o JSON. A resposta deve ser em Português de Portugal!
    `;

        const responseText = await generateTextWithFallback(inputPrompt);
        const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error analyzing speaking:", error);
        return {
            feedback: "Não foi possível analisar o áudio.",
            betterWayToSay: "",
            pronunciationTips: "",
            score: 0,
        };
    }
};

export const generateReadingText = async (
    level: string = "B1",
    language: string = "Active Course",
    focusMode: boolean = false
): Promise<{
    article_title: string;
    article_body: string;
    questions: {
        question: string;
        options: { text: string; correct: boolean }[];
        explanation: string;
    }[];
    essay_prompt: string;
    languageCode?: string;
}> => {
    try {
        let courseTitle = language;

        if (language === "Active Course" || !language) {
            const userProgress = await getUserProgress();
            if (userProgress?.activeCourse?.language) {
                courseTitle = userProgress.activeCourse.language;
            } else {
                courseTitle = "English";
            }
        }

        const randomSeed = Date.now();
        let topicInstruction = "TOPIC: General Interest";

        // LEVEL SYLLABUS INJECTION (Reuse logic or keep simple for reading)
        let levelConstraint = "";
        switch (level) {
            case "A1": levelConstraint = "Level A1. Very short sentences. Basic vocabulary (colors, family, home). Max 150 words."; break;
            case "A2": levelConstraint = "Level A2. Short paragraphs. Routine topics. Max 250 words."; break;
            case "B1": levelConstraint = "Level B1. Clear standard input. Familiar matters. Max 350 words."; break;
            case "B2": levelConstraint = "Level B2. Concrete and abstract topics. Complex text. Max 450 words."; break;
            case "C1": levelConstraint = "Level C1. Long, demanding texts. Implicit meaning. Max 550 words."; break;
            case "C2": levelConstraint = "Level C2. Sophisticated, academic or literary text. Maximum complexity. Max 600 words."; break;
            default: levelConstraint = "Level B1.";
        }

        if (focusMode) {
            try {
                const course = await db.query.courses.findFirst({
                    where: eq(courses.language, courseTitle)
                });
                if (course) {
                    const firstUnit = await db.query.units.findFirst({
                        where: eq(units.courseId, course.id),
                        orderBy: (units, { asc }) => [asc(units.order)]
                    });
                    if (firstUnit) {
                        topicInstruction = `TOPIC: "${firstUnit.title}" - ${firstUnit.description}`;
                    } else {
                        topicInstruction = `TOPIC: Culture and Daily Life`;
                    }
                } else {
                    topicInstruction = `TOPIC: Culture and Daily Life`;
                }
            } catch (err) {
                topicInstruction = `TOPIC: Culture and Daily Life`;
            }
        }

        const prompt = `
    You must act as a ${level} ${courseTitle} Examination Creator.
    
    Topic: ${topicInstruction} (Seed: ${randomSeed})
    Constraint: ${levelConstraint}

    Tasks:
    1. Write an article in ${courseTitle} suitable for ${level}.
    2. Create 5 multiple-choice questions (appropriate difficulty for ${level}).
    3. Create 1 essay prompt (for the user to write about).

    RETURN ONLY RAW JSON. NO MARKDOWN. NO BACKTICKS.
    Structure:
    {
      "article_title": "String",
      "article_body": "String",
      "questions": [
        { "question": "", "options": [{ "text": "", "correct": boolean }], "explanation": "" }
      ],
      "essay_prompt": "String"
    }
    `;

        let text = await generateTextWithFallback(prompt);

        // Robust JSON Extraction
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            text = text.substring(firstOpen, lastClose + 1);
        } else {
            throw new Error("No JSON object found in response");
        }

        const data = JSON.parse(text);
        const langCode = getLanguageCode(courseTitle);
        const profile = getAIProfile(langCode);
        return { ...data, languageCode: profile.voice };
    } catch (error) {
        console.error("Error generating reading text:", error);
        // Robust Fallback
        return {
            article_title: "Error: " + (error instanceof Error ? error.message : "Unknown"),
            article_body: "We encountered an error generating the exam. Please try again. If this persists, the AI model might be overloaded.",
            questions: [
                {
                    question: "What happened?",
                    options: [
                        { text: "An error occurred.", "correct": true },
                        { text: "Everything is fine.", "correct": false }
                    ],
                    explanation: "Self-explanatory."
                }
            ],
            essay_prompt: "Describe how you handle technical errors.",
            languageCode: "en-US"
        };
    }
};

export const analyzeReading = async (
    userEssay: string,
    essayPrompt: string,
    level: string = "B1",
    language: string = "Active Course"
): Promise<{
    feedback: string;
    score: number;
    strengths: string[];
    improvements: string[];
}> => {
    try {
        let courseTitle = language;
        if (language === "Active Course" || !language) {
            const userProgress = await getUserProgress();
            if (userProgress?.activeCourse?.language) {
                courseTitle = userProgress.activeCourse.language;
            } else {
                courseTitle = "English";
            }
        }

        const inputPrompt = `
      You are a ${level} ${courseTitle} Examiner.
      
      Essay Prompt: "${essayPrompt}"
      Student's Essay: "${userEssay}"

      Task: Grade the essay based on ${level} standards (Structure, Argument, Vocabulary, Grammar).
      If the level is low (A1/A2), be lenient. If C2, be extremely strict.

      Return a JSON in Portuguese:
      {
        "feedback": "Detailed feedback in Portuguese.",
        "score": 0-100,
        "strengths": ["Strength 1", "Strength 2"],
        "improvements": ["Improvement 1", "Improvement 2"]
      }
    `;

        const text = await generateTextWithFallback(inputPrompt);
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error analyzing reading essay:", error);
        return {
            feedback: "Error analyzing essay.",
            score: 0,
            strengths: [],
            improvements: []
        };
    }
};

export const generateListeningScript = async (
    level: string = "B1",
    language: string = "Active Course",
    focusMode: boolean = false
): Promise<{
    script: string;
    topic: string;
    questions?: string[];
    languageCode?: string;
}> => {
    try {
        let courseTitle = language;
        if (language === "Active Course" || !language) {
            const userProgress = await getUserProgress();
            if (userProgress?.activeCourse?.language) {
                courseTitle = userProgress.activeCourse.language;
            } else {
                courseTitle = "English";
            }
        }

        const randomSeed = Date.now();

        let levelConstraint = "";
        switch (level) {
            case "A1": levelConstraint = "Level A1. Simple greetings, numbers, family. Very slow. Max 50 words."; break;
            case "A2": levelConstraint = "Level A2. Shopping, directions, simple past. Max 100 words."; break;
            case "B1": levelConstraint = "Level B1. Travel, school, leisure. Connected text. Max 150 words."; break;
            case "B2": levelConstraint = "Level B2. News, interviews, technical discussions. Max 200 words."; break;
            case "C1": levelConstraint = "Level C1. Fast, colloquial, complex accents. Max 250 words."; break;
            case "C2": levelConstraint = "Level C2. Extremely fast, abstract, native speed. Max 300 words."; break;
            default: levelConstraint = "Level B1.";
        }

        let contextInstruction = `sobre um tema interessante e cotidiano ou profissional (Viagens, Trabalho, Tecnologia, Cultura). ${levelConstraint}. (Seed: ${randomSeed})`;

        if (focusMode) {
            try {
                const course = await db.query.courses.findFirst({
                    where: eq(courses.language, courseTitle)
                });
                if (course) {
                    const firstUnit = await db.query.units.findFirst({
                        where: eq(units.courseId, course.id),
                        orderBy: (units, { asc }) => [asc(units.order)]
                    });
                    if (firstUnit) {
                        contextInstruction = `MODO FOCADO. O tema é: "${firstUnit.title}" (${firstUnit.description}). Gera um script focado nisto. ${levelConstraint}`;
                    } else {
                        contextInstruction = `MODO FOCADO (Fallback). Gera um diálogo SIMPLES. ${levelConstraint}`;
                    }
                } else {
                    contextInstruction = `MODO ALEATÓRIO. Gera um diálogo SIMPLES. ${levelConstraint}`;
                }
            } catch (err) {
                contextInstruction = `MODO ALEATÓRIO. Gera um diálogo SIMPLES. ${levelConstraint}`;
            }
        }

        const prompt = `Gera um script de áudio (monólogo ou diálogo curto) em ${courseTitle.toUpperCase()}, otimizado para ser falado, ${contextInstruction}
                   Retorna APENAS um JSON no formato:
                   {
                     "script": "O texto em ${courseTitle.toUpperCase()} que será lido pelo TTS.",
                     "topic": "O tema principal em ${courseTitle.toUpperCase()}",
                     "questions": ["Pergunta 1 em ${courseTitle}", "Pergunta 2 em ${courseTitle}"]
                   }`;

        const text = await generateTextWithFallback(prompt);
        const cleanText = extractJSON(text);
        const data = JSON.parse(cleanText);
        const langCode = getLanguageCode(courseTitle);
        const profile = getAIProfile(langCode);
        return { ...data, languageCode: profile.voice };
    } catch (error) {
        console.error("Error generating listening script:", error);
        return {
            script: "Hello! Today is a beautiful day.",
            topic: "Error Fallback",
            questions: ["What day is it?"],
            languageCode: "en-US"
        };
    }
};

export const analyzeListening = async (
    userNotes: string,
    originalTopic: string,
    originalScript: string,
    level: string = "B1",
    language: string = "Active Course"
): Promise<{
    feedback: string;
    score: number;
    missedPoints?: string[];
}> => {
    try {
        let courseTitle = language;
        if (language === "Active Course" || !language) {
            const userProgress = await getUserProgress();
            if (userProgress?.activeCourse?.language) {
                courseTitle = userProgress.activeCourse.language;
            } else {
                courseTitle = "English";
            }
        }

        const inputPrompt = `
      Aja como um avaliador de compreensão auditiva.
      O aluno ouviu um áudio sobre "${originalTopic}" (Script: "${originalScript}") de nível ${level}.
      E escreveu as seguintes notas/comentário:
      "${userNotes}"
      
      IMPORTANTE: Avalie se o aluno escreveu em ${courseTitle} ou Português, e se compreendeu o áudio (que está em ${courseTitle}).
      Se o nível for baixo (A1), aceite notas simples. Se for C2, exija notas detalhadas.

      Retorne um JSON no formato:
      {
        "feedback": "Análise da compreensão e da escrita em PORTUGUÊS DE PORTUGAL. Seja específico sobre o que ele entendeu bem ou mal.",
        "score": 0 a 100 (Compreensão + Escrita - ajustado ao nível ${level}),
        "missedPoints": ["Ponto importante do áudio que o aluno não mencionou", "Outro ponto"] (Se score < 90)
      }
      Retorna APENAS o JSON.
    `;

        const text = await generateTextWithFallback(inputPrompt);
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error analyzing listening:", error);
        return {
            feedback: "Não foi possível analisar a tua resposta neste momento.",
            score: 0,
            missedPoints: []
        };
    }
};
