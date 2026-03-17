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
        console.log("🌱 Adding Spanish course...");

        // Create Spanish Course
        const [spanishCourse] = await db.insert(schema.courses).values([
            { title: "Espanhol", imageSrc: "/es.svg" },
        ]).returning();

        console.log("📚 Created course:", spanishCourse.title);

        // Create Units for Spanish
        const [unit1, unit2] = await db.insert(schema.units).values([
            {
                title: "Unidad 1",
                description: "Aprende lo básico de Español",
                order: 1,
                courseId: spanishCourse.id,
            },
            {
                title: "Unidad 2",
                description: "Saludos y Presentaciones",
                order: 2,
                courseId: spanishCourse.id,
            },
        ]).returning();

        console.log("📦 Created units");

        // Create Lessons for Unit 1
        const unit1Lessons = await db.insert(schema.lessons).values([
            { title: "Saludos Básicos", order: 1, unitId: unit1.id },
            { title: "Pronombres Personales", order: 2, unitId: unit1.id },
            { title: "Verbos Ser y Estar", order: 3, unitId: unit1.id },
            { title: "Números 1-10", order: 4, unitId: unit1.id },
            { title: "Colores", order: 5, unitId: unit1.id },
        ]).returning();

        const unit2Lessons = await db.insert(schema.lessons).values([
            { title: "Presentarse", order: 1, unitId: unit2.id },
            { title: "Preguntar el Nombre", order: 2, unitId: unit2.id },
            { title: "Nacionalidades", order: 3, unitId: unit2.id },
        ]).returning();

        console.log("📖 Created lessons");

        // Create Challenges for Lesson 1 (Saludos Básicos)
        const lesson1Challenges = await db.insert(schema.challenges).values([
            {
                question: "How do you say 'Hello' in Spanish?",
                type: "SELECT",
                order: 1,
                lessonId: unit1Lessons[0].id,
            },
            {
                question: "What is 'Good morning' in Spanish?",
                type: "SELECT",
                order: 2,
                lessonId: unit1Lessons[0].id,
            },
            {
                question: "How do you say 'Goodbye'?",
                type: "SELECT",
                order: 3,
                lessonId: unit1Lessons[0].id,
            },
        ]).returning();

        console.log("❓ Created challenges");

        // Create Options for each Challenge
        // Challenge 1: Hello = Hola
        await db.insert(schema.challengeOptions).values([
            { text: "Hola", correct: true, challengeId: lesson1Challenges[0].id },
            { text: "Adiós", correct: false, challengeId: lesson1Challenges[0].id },
            { text: "Gracias", correct: false, challengeId: lesson1Challenges[0].id },
            { text: "Por favor", correct: false, challengeId: lesson1Challenges[0].id },
        ]);

        // Challenge 2: Good morning = Buenos días
        await db.insert(schema.challengeOptions).values([
            { text: "Buenas noches", correct: false, challengeId: lesson1Challenges[1].id },
            { text: "Buenos días", correct: true, challengeId: lesson1Challenges[1].id },
            { text: "Buenas tardes", correct: false, challengeId: lesson1Challenges[1].id },
            { text: "Hola", correct: false, challengeId: lesson1Challenges[1].id },
        ]);

        // Challenge 3: Goodbye = Adiós
        await db.insert(schema.challengeOptions).values([
            { text: "Hola", correct: false, challengeId: lesson1Challenges[2].id },
            { text: "Buenos días", correct: false, challengeId: lesson1Challenges[2].id },
            { text: "Adiós", correct: true, challengeId: lesson1Challenges[2].id },
            { text: "Hasta luego", correct: false, challengeId: lesson1Challenges[2].id },
        ]);

        console.log("🔘 Created challenge options");

        console.log("✅ Spanish course added successfully!");
        console.log(`
📊 Summary:
- Course: Espanhol
- 2 Units
- 8 Lessons
- 3 Challenges with options
    `);

    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    } finally {
        await client.end();
    }
};

main();
