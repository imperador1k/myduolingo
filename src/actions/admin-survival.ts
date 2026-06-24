"use server";

import { db } from "@/db/drizzle";
import { survivalScenarios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { validateAdmin } from "@/lib/admin-guard";
import { units, courses } from "@/db/schema";
import { generateTextWithFallback } from "@/lib/ai-manager";

export const createSurvivalScenario = async (data: {
  title: string;
  description: string;
  aiRole: string;
  userRole: string;
  targetLevel: string;
  courseId: number;
  unitId: number;
}) => {
  await validateAdmin();

  await db.insert(survivalScenarios).values({
    title: data.title,
    description: data.description,
    aiRole: data.aiRole,
    userRole: data.userRole,
    targetLevel: data.targetLevel,
    courseId: data.courseId,
    unitId: data.unitId,
    npcBaseImage: "/npc/base_body.png", // Hardcoded for now
    npcClothes: [],
  });

  revalidatePath("/admin/survival");
  revalidatePath("/practice/survival");
};

export const deleteSurvivalScenario = async (id: number) => {
  await validateAdmin();

  await db.delete(survivalScenarios).where(eq(survivalScenarios.id, id));

  revalidatePath("/admin/survival");
  revalidatePath("/practice/survival");
};

export const generateSurvivalScenario = async (data: {
  targetLevel: string;
  courseId: number;
  unitId: number;
}) => {
  await validateAdmin();

  const unit = await db.query.units.findFirst({
    where: eq(units.id, data.unitId),
  });

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, data.courseId),
  });

  if (!unit || !course) throw new Error("Unit or Course not found");

  const systemPrompt = `You are an expert language curriculum designer. 
Generate a roleplay survival scenario for a language learner at CEFR level ${data.targetLevel}.
The scenario MUST be inspired by the theme of the current course unit: "${unit.title} - ${unit.description}".
The language being learned is ${course.language}.

Return a valid JSON object with EXACTLY these fields:
{
  "title": "A short, catchy title for the mission in Portuguese (e.g. 'O Assalto', 'Perdido no Metro')",
  "description": "A description of the user's goal in Portuguese (e.g. 'Convence o polícia de que não roubaste nada.')",
  "storyContext": "The immersive backstory shown to the user before they start, written in Portuguese. Set the scene dramatically (e.g. 'Estavas a conduzir a 120km/h numa estrada de montanha escura quando viste luzes a piscar no retrovisor. O polícia aproxima-se com uma lanterna apontada aos teus olhos.')",
  "hint": "A helpful tip to give the user an idea of what strategy to use, written in Portuguese (e.g. 'Se fores atencioso e humilde, a polícia poderá ser mais flexível.')",
  "aiRole": "The system prompt for the AI NPC, written in English. Detail their personality, strictness, and the context.",
  "userRole": "The specific goal and instructions for the user, written in Portuguese. This will be shown directly to the user as their objective (e.g. 'O teu objetivo é convencer o polícia a deixar-te ir embora com apenas um aviso.')."
}`;

  const prompt = "Gera a missão baseada no tema pedido.";

  let aiContent = "";
  try {
    aiContent = await generateTextWithFallback(prompt, systemPrompt, {
      temperature: 0.7,
    });
  } catch (error) {
    console.error("AI API Error:", error);
    throw new Error("Failed to generate scenario from AI");
  }

  // Robust JSON extraction
  let cleanText = aiContent
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const firstOpen = cleanText.indexOf("{");
  const lastClose = cleanText.lastIndexOf("}");

  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleanText = cleanText.substring(firstOpen, lastClose + 1);
  }

  const parsed = JSON.parse(cleanText);

  await db.insert(survivalScenarios).values({
    title: parsed.title,
    description: parsed.description,
    storyContext: parsed.storyContext,
    hint: parsed.hint,
    aiRole: parsed.aiRole,
    userRole: parsed.userRole,
    targetLevel: data.targetLevel,
    courseId: data.courseId,
    unitId: data.unitId,
    npcBaseImage: "/npc/base_body.png",
    npcClothes: [],
  });

  revalidatePath("/admin/survival");
  revalidatePath("/practice/survival");
};
