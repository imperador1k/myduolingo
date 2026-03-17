import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

// Portuguese vocabulary for challenges
const ptChallenges = [
    // Pronomes Pessoais
    { question: "Qual é o pronome para 'I'?", answers: ["Eu", "Tu", "Ele", "Nós"], correct: 0 },
    { question: "Como se diz 'We' em Português?", answers: ["Eles", "Vocês", "Nós", "Eu"], correct: 2 },
    { question: "Qual é o pronome para 'You' (formal)?", answers: ["Tu", "Você", "Eu", "Eles"], correct: 1 },

    // Verbos Ser e Estar
    { question: "'I am tired' usa qual verbo?", answers: ["Ser", "Estar", "Ter", "Haver"], correct: 1 },
    { question: "'I am Portuguese' usa qual verbo?", answers: ["Estar", "Ser", "Ter", "Haver"], correct: 1 },
    { question: "Complete: 'Eu ___ feliz' (temporário)", answers: ["sou", "estou", "tenho", "vou"], correct: 1 },

    // Números 1-10
    { question: "Como se diz 'five' em Português?", answers: ["Quatro", "Cinco", "Seis", "Sete"], correct: 1 },
    { question: "O que é 'oito' em inglês?", answers: ["Seven", "Eight", "Nine", "Ten"], correct: 1 },
    { question: "Qual é o número 'três'?", answers: ["1", "2", "3", "4"], correct: 2 },

    // Cores
    { question: "Como se diz 'blue' em Português?", answers: ["Verde", "Azul", "Vermelho", "Amarelo"], correct: 1 },
    { question: "Qual é a cor 'verde' em inglês?", answers: ["Green", "Blue", "Red", "Yellow"], correct: 0 },
    { question: "Como se escreve 'branco' em inglês?", answers: ["Black", "White", "Brown", "Pink"], correct: 1 },

    // Apresentar-se
    { question: "Como perguntar 'What is your name?'", answers: ["Como te chamas?", "Quantos anos tens?", "De onde és?", "O que fazes?"], correct: 0 },
    { question: "'Prazer em conhecer-te' significa:", answers: ["Goodbye", "Nice to meet you", "How are you?", "See you later"], correct: 1 },
    { question: "Como responder 'Chamo-me...'", answers: ["I am called...", "I have...", "I like...", "I want..."], correct: 0 },

    // Nacionalidades
    { question: "Como se diz 'Portuguese' (nationality)?", answers: ["Português", "Espanhol", "Francês", "Italiano"], correct: 0 },
    { question: "'I am Brazilian' em Português:", answers: ["Sou brasileiro", "Sou americano", "Sou inglês", "Sou alemão"], correct: 0 },
    { question: "Qual é a nacionalidade 'French'?", answers: ["Espanhol", "Italiano", "Francês", "Alemão"], correct: 2 },

    // Família
    { question: "Como se diz 'mother' em Português?", answers: ["Pai", "Mãe", "Irmão", "Irmã"], correct: 1 },
    { question: "'Irmão' significa:", answers: ["Sister", "Brother", "Father", "Mother"], correct: 1 },
    { question: "Qual é 'grandfather' em Português?", answers: ["Avó", "Avô", "Tio", "Primo"], correct: 1 },
];

// Spanish vocabulary for challenges
const esChallenges = [
    // Pronombres
    { question: "How do you say 'I' in Spanish?", answers: ["Yo", "Tú", "Él", "Nosotros"], correct: 0 },
    { question: "What is 'We' in Spanish?", answers: ["Ellos", "Ustedes", "Nosotros", "Yo"], correct: 2 },
    { question: "Which pronoun means 'You' (informal)?", answers: ["Tú", "Usted", "Yo", "Ellos"], correct: 0 },

    // Verbos Ser y Estar
    { question: "'I am tired' uses which verb?", answers: ["Ser", "Estar", "Tener", "Haber"], correct: 1 },
    { question: "'I am Spanish' uses which verb?", answers: ["Estar", "Ser", "Tener", "Haber"], correct: 1 },
    { question: "Complete: 'Yo ___ feliz' (temporary)", answers: ["soy", "estoy", "tengo", "voy"], correct: 1 },

    // Números 1-10
    { question: "How do you say 'five' in Spanish?", answers: ["Cuatro", "Cinco", "Seis", "Siete"], correct: 1 },
    { question: "What is 'ocho' in English?", answers: ["Seven", "Eight", "Nine", "Ten"], correct: 1 },
    { question: "Which number is 'tres'?", answers: ["1", "2", "3", "4"], correct: 2 },

    // Colores
    { question: "How do you say 'blue' in Spanish?", answers: ["Verde", "Azul", "Rojo", "Amarillo"], correct: 1 },
    { question: "What is 'verde' in English?", answers: ["Green", "Blue", "Red", "Yellow"], correct: 0 },
    { question: "How do you write 'blanco' in English?", answers: ["Black", "White", "Brown", "Pink"], correct: 1 },

    // Presentarse
    { question: "How to ask 'What is your name?'", answers: ["¿Cómo te llamas?", "¿Cuántos años tienes?", "¿De dónde eres?", "¿Qué haces?"], correct: 0 },
    { question: "'Mucho gusto' means:", answers: ["Goodbye", "Nice to meet you", "How are you?", "See you later"], correct: 1 },
    { question: "How to respond 'Me llamo...'", answers: ["I am called...", "I have...", "I like...", "I want..."], correct: 0 },

    // Nacionalidades
    { question: "How do you say 'Spanish' (nationality)?", answers: ["Español", "Francés", "Italiano", "Alemán"], correct: 0 },
    { question: "'Soy mexicano' means:", answers: ["I am Mexican", "I am American", "I am English", "I am German"], correct: 0 },
    { question: "Which nationality is 'French'?", answers: ["Español", "Italiano", "Francés", "Alemán"], correct: 2 },
];

const main = async () => {
    try {
        console.log("🌱 Adding challenges to ALL lessons...");

        // Get all lessons
        const allLessons = await db.query.lessons.findMany({
            with: { unit: { with: { course: true } } },
        });

        console.log(`Found ${allLessons.length} lessons`);

        let challengeIndex = 0;

        for (const lesson of allLessons) {
            // Check if lesson already has challenges
            const existingChallenges = await db.query.challenges.findMany({
                where: eq(schema.challenges.lessonId, lesson.id),
            });

            if (existingChallenges.length > 0) {
                console.log(`⚠️ Lesson "${lesson.title}" already has challenges. Skipping.`);
                continue;
            }

            // Use PT or ES challenges based on course
            const courseTitle = lesson.unit?.course?.title || "";
            const challengeSet = courseTitle.includes("Espanhol") ? esChallenges : ptChallenges;

            // Get 3 challenges per lesson (cycling through the set)
            for (let i = 0; i < 3; i++) {
                const challengeData = challengeSet[(challengeIndex + i) % challengeSet.length];

                // Create challenge
                const [newChallenge] = await db.insert(schema.challenges).values({
                    question: challengeData.question,
                    type: "SELECT",
                    order: i + 1,
                    lessonId: lesson.id,
                }).returning();

                // Create options
                await db.insert(schema.challengeOptions).values(
                    challengeData.answers.map((text, idx) => ({
                        text,
                        correct: idx === challengeData.correct,
                        challengeId: newChallenge.id,
                    }))
                );
            }

            console.log(`✅ Added 3 challenges to: ${lesson.title}`);
            challengeIndex += 3;
        }

        console.log("✅ All challenges added successfully!");

    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    } finally {
        await client.end();
    }
};

main();
