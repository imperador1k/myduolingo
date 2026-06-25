"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { knowledgePosts } from "@/db/schema";
import { generateTextWithFallback } from "@/lib/ai-manager";
import { revalidatePath } from "next/cache";

export type UGCSubmissionResult = {
  success: boolean;
  message: string;
  status?: "APPROVED" | "REJECTED" | "PENDING";
};

function extractJSON(text: string): string {
  let clean = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const firstBrace = clean.indexOf("{");
  if (firstBrace !== -1) {
    const lastBrace = clean.lastIndexOf("}");
    if (lastBrace > firstBrace) {
      return clean.substring(firstBrace, lastBrace + 1);
    }
  }
  return clean;
}

export const submitUGCPost = async (
  content: string,
  targetLanguage: string,
): Promise<UGCSubmissionResult> => {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: "Não autorizado" };
  }

  if (!content || content.trim().length < 10) {
    return {
      success: false,
      message: "O post tem de ter pelo menos 10 caracteres.",
    };
  }

  if (content.length > 500) {
    return {
      success: false,
      message: "O post é demasiado longo (máximo 500 caracteres).",
    };
  }

  const systemPrompt = `You are a strict moderation AI for an educational language learning app (MyDuolingo).
A user submitted the following content to be posted to the public "Knowledge Feed".
Your job is to:
1. Verify it contains NO nudity, violence, hate speech, or aggressive/inappropriate behavior.
2. Verify it is somewhat useful, interesting, or at least a coherent sentence/story (no spam like "asdfg").
3. Translate or adapt the content into ${targetLanguage} if it is not already. Keep it at a B1 CEFR level.

If it FAILS the safety/spam checks, you must REJECT it.
If it PASSES, you must APPROVE it.

You MUST reply with ONLY a STRICT JSON object in this format:
{
  "status": "APPROVED" | "REJECTED",
  "reason": "Short reason for rejection (only if rejected)",
  "title": "A short, engaging title (max 5 words, only if approved)",
  "category": "One of: TECHNOLOGY, HISTORY, SCIENCE, CULTURE, RANDOM (only if approved)",
  "body": "The verified/adapted content in ${targetLanguage}, split into 2-3 short sentences. Max 350 chars (only if approved)",
  "bgClass": "A tailwind gradient class like 'from-sky-900 to-black' or 'from-purple-900 to-black' (only if approved)"
}`;

  try {
    const aiResponse = await generateTextWithFallback(
      `User Submission: "${content}"`,
      systemPrompt,
      { temperature: 0.2 },
    );

    const jsonStr = extractJSON(aiResponse);
    const result = JSON.parse(jsonStr);

    if (result.status === "REJECTED") {
      return {
        success: false,
        message: `O teu post foi recusado: ${result.reason || "Conteúdo impróprio ou não útil."}`,
        status: "REJECTED",
      };
    }

    if (result.status === "APPROVED") {
      await db.insert(knowledgePosts).values({
        targetLanguage,
        cefrLevel: "B1",
        title: result.title,
        category: result.category,
        body: result.body,
        bgClass: result.bgClass || "from-slate-900 to-black",
        status: "APPROVED",
        authorId: userId,
      });

      revalidatePath("/feed");

      return {
        success: true,
        message: "Post aprovado e publicado com sucesso!",
        status: "APPROVED",
      };
    }

    throw new Error("Invalid AI response format");
  } catch (error) {
    console.error("UGC Verification Error:", error);
    try {
      await db.insert(knowledgePosts).values({
        targetLanguage,
        cefrLevel: "B1",
        title: "Conteúdo Pendente",
        category: "RANDOM",
        body: content.substring(0, 300),
        bgClass: "from-slate-900 to-black",
        status: "PENDING",
        authorId: userId,
      });
      return {
        success: true,
        message:
          "O teu post foi enviado para moderação manual (a IA está ocupada).",
        status: "PENDING",
      };
    } catch (dbError) {
      console.error("DB Error saving pending post:", dbError);
      return { success: false, message: "Erro ao processar o teu post." };
    }
  }
};
