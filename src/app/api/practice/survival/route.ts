import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { userProgress, survivalSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildSurvivalPrompt, PromptContext } from "@/lib/ai/prompts";
import { generateTextWithFallback } from "@/lib/ai-manager";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return new NextResponse("Missing message or sessionId", { status: 400 });
    }

    // Fetch session and scenario
    const session = await db.query.survivalSessions.findFirst({
      where: eq(survivalSessions.id, sessionId),
      with: {
        scenario: true,
      },
    });

    if (!session || session.userId !== userId) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const user = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const context: PromptContext = {
      userLevel: session.scenario.targetLevel,
      targetLanguage: user.activeLanguage,
      scenarioRole: session.scenario.aiRole,
      userRole: session.scenario.userRole,
      currentLessonVocabulary: [], // Mocking for now, could fetch from userVocabulary
    };

    const systemPrompt = buildSurvivalPrompt(context);

    // Filter out previous system messages from history if any, to ensure only one system prompt at the top
    const previousHistory = (session.chatHistory as any[]).filter(
      (msg: any) => msg.role !== "system",
    );

    // Convert multi-turn history into a single string for Gemini
    let conversationContext = "=== HISTÓRICO DA CONVERSA ===\n";
    for (const msg of previousHistory) {
      const roleName = msg.role === "user" ? "Utilizador" : "NPC";
      conversationContext += `${roleName}: ${msg.content}\n`;
    }

    if (message === "[SYSTEM_INIT]") {
      conversationContext += `\n(A conversa acabou de começar. Inicia tu a conversa agora, de acordo com o teu papel e o cenário. Fá-lo na língua ${user.activeLanguage}. Sê muito imersivo.)\nNPC:`;
    } else {
      conversationContext += `\nUtilizador: ${message}\nNPC:`;
    }

    const fullPrompt = `${conversationContext}\n\nResponde como o NPC. A resposta DEVE ser um JSON válido com 'message' e 'isGrammarCorrect'.`;

    let aiContent = "";
    try {
      aiContent = await generateTextWithFallback(fullPrompt, systemPrompt, {
        temperature: 0.7,
      });
    } catch (error) {
      console.error("AI API Error:", error);
      return new NextResponse("Error calling AI API", { status: 500 });
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

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanText);
    } catch (e) {
      // Fallback if AI didn't return perfect JSON
      parsedResponse = {
        message: cleanText,
        isGrammarCorrect: true,
        missionAccomplished: false,
      };
    }

    const missionAccomplished = !!parsedResponse.missionAccomplished;

    // Update DB with new history
    const updatedHistory = [...previousHistory];

    if (message !== "[SYSTEM_INIT]") {
      updatedHistory.push({ role: "user", content: message });
    }

    updatedHistory.push({ role: "assistant", content: parsedResponse.message });

    const sessionStatus = missionAccomplished ? "completed" : "active";

    await db
      .update(survivalSessions)
      .set({
        chatHistory: updatedHistory,
        status: sessionStatus,
        updatedAt: new Date(),
      })
      .where(eq(survivalSessions.id, sessionId));

    return NextResponse.json({
      message: parsedResponse.message,
      isGrammarCorrect: parsedResponse.isGrammarCorrect,
      missionAccomplished: missionAccomplished,
    });
  } catch (error) {
    console.error("Survival API Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
