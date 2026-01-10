import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

const main = async () => {
    try {
        console.log("🌱 Seeding database...");

        // Clear existing data
        console.log("🗑️ Cleaning existing data...");
        await db.delete(schema.challengeProgress);
        await db.delete(schema.challengeOptions);
        await db.delete(schema.challenges);
        await db.delete(schema.lessons);
        await db.delete(schema.units);
        await db.delete(schema.userProgress);
        await db.delete(schema.courses);

        // Create Courses
        console.log("📚 Creating courses...");
        const [portugueseCourse] = await db.insert(schema.courses).values([
            { title: "Português", imageSrc: "/pt.svg" },
        ]).returning();

        // Create Units
        console.log("📦 Creating units...");
        const [unit1, unit2] = await db.insert(schema.units).values([
            {
                title: "Unidade 1",
                description: "Aprende o básico de Português",
                order: 1,
                courseId: portugueseCourse.id,
            },
            {
                title: "Unidade 2",
                description: "Saudações e Apresentações",
                order: 2,
                courseId: portugueseCourse.id,
            },
        ]).returning();

        // Create Lessons for Unit 1
        console.log("📖 Creating lessons...");
        const unit1Lessons = await db.insert(schema.lessons).values([
            { title: "Saudações Básicas", order: 1, unitId: unit1.id },
            { title: "Pronomes Pessoais", order: 2, unitId: unit1.id },
            { title: "Verbos Ser e Estar", order: 3, unitId: unit1.id },
            { title: "Números 1-10", order: 4, unitId: unit1.id },
            { title: "Cores", order: 5, unitId: unit1.id },
        ]).returning();

        const unit2Lessons = await db.insert(schema.lessons).values([
            { title: "Apresentar-se", order: 1, unitId: unit2.id },
            { title: "Perguntar o Nome", order: 2, unitId: unit2.id },
            { title: "Nacionalidades", order: 3, unitId: unit2.id },
            { title: "Profissões", order: 4, unitId: unit2.id },
            { title: "Família", order: 5, unitId: unit2.id },
        ]).returning();

        // Create Challenges for Lesson 1 (Saudações Básicas)
        console.log("❓ Creating challenges...");
        const lesson1Challenges = await db.insert(schema.challenges).values([
            {
                question: "Como se diz 'Hello' em Português?",
                type: "SELECT",
                order: 1,
                lessonId: unit1Lessons[0].id,
            },
            {
                question: "Qual é a tradução de 'Good morning'?",
                type: "SELECT",
                order: 2,
                lessonId: unit1Lessons[0].id,
            },
            {
                question: "Como se diz 'Goodbye'?",
                type: "SELECT",
                order: 3,
                lessonId: unit1Lessons[0].id,
            },
            {
                question: "Qual é a tradução de 'Good night'?",
                type: "SELECT",
                order: 4,
                lessonId: unit1Lessons[0].id,
            },
        ]).returning();

        // Create Options for each Challenge
        console.log("🔘 Creating challenge options...");

        // Challenge 1: Hello = Olá
        await db.insert(schema.challengeOptions).values([
            { text: "Olá", correct: true, challengeId: lesson1Challenges[0].id },
            { text: "Tchau", correct: false, challengeId: lesson1Challenges[0].id },
            { text: "Obrigado", correct: false, challengeId: lesson1Challenges[0].id },
            { text: "Por favor", correct: false, challengeId: lesson1Challenges[0].id },
        ]);

        // Challenge 2: Good morning = Bom dia
        await db.insert(schema.challengeOptions).values([
            { text: "Boa noite", correct: false, challengeId: lesson1Challenges[1].id },
            { text: "Bom dia", correct: true, challengeId: lesson1Challenges[1].id },
            { text: "Boa tarde", correct: false, challengeId: lesson1Challenges[1].id },
            { text: "Olá", correct: false, challengeId: lesson1Challenges[1].id },
        ]);

        // Challenge 3: Goodbye = Tchau
        await db.insert(schema.challengeOptions).values([
            { text: "Olá", correct: false, challengeId: lesson1Challenges[2].id },
            { text: "Bom dia", correct: false, challengeId: lesson1Challenges[2].id },
            { text: "Tchau", correct: true, challengeId: lesson1Challenges[2].id },
            { text: "Adeus", correct: false, challengeId: lesson1Challenges[2].id },
        ]);

        // Challenge 4: Good night = Boa noite
        await db.insert(schema.challengeOptions).values([
            { text: "Bom dia", correct: false, challengeId: lesson1Challenges[3].id },
            { text: "Boa tarde", correct: false, challengeId: lesson1Challenges[3].id },
            { text: "Olá", correct: false, challengeId: lesson1Challenges[3].id },
            { text: "Boa noite", correct: true, challengeId: lesson1Challenges[3].id },
        ]);

        // Add challenges for Lesson 2 (Pronomes Pessoais)
        const lesson2Challenges = await db.insert(schema.challenges).values([
            {
                question: "Qual é o pronome para 'I' em Português?",
                type: "SELECT",
                order: 1,
                lessonId: unit1Lessons[1].id,
            },
            {
                question: "Como se diz 'You' (informal)?",
                type: "SELECT",
                order: 2,
                lessonId: unit1Lessons[1].id,
            },
            {
                question: "Qual é o pronome para 'We'?",
                type: "SELECT",
                order: 3,
                lessonId: unit1Lessons[1].id,
            },
        ]).returning();

        // Challenge options for Lesson 2
        await db.insert(schema.challengeOptions).values([
            { text: "Eu", correct: true, challengeId: lesson2Challenges[0].id },
            { text: "Tu", correct: false, challengeId: lesson2Challenges[0].id },
            { text: "Ele", correct: false, challengeId: lesson2Challenges[0].id },
            { text: "Nós", correct: false, challengeId: lesson2Challenges[0].id },
        ]);

        await db.insert(schema.challengeOptions).values([
            { text: "Eu", correct: false, challengeId: lesson2Challenges[1].id },
            { text: "Tu", correct: true, challengeId: lesson2Challenges[1].id },
            { text: "Você", correct: false, challengeId: lesson2Challenges[1].id },
            { text: "Eles", correct: false, challengeId: lesson2Challenges[1].id },
        ]);

        await db.insert(schema.challengeOptions).values([
            { text: "Eles", correct: false, challengeId: lesson2Challenges[2].id },
            { text: "Vocês", correct: false, challengeId: lesson2Challenges[2].id },
            { text: "Nós", correct: true, challengeId: lesson2Challenges[2].id },
            { text: "Eu", correct: false, challengeId: lesson2Challenges[2].id },
        ]);

        console.log("✅ Seeding completed successfully!");
        console.log(`
📊 Summary:
- 1 Course (Português)
- 2 Units
- 10 Lessons
- 7 Challenges with options
    `);

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    } finally {
        await client.end();
    }
};

main();
