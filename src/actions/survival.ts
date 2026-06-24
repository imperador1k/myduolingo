"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { survivalSessions, survivalScenarios } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export const startSurvivalSession = async (scenarioId: number) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verifica se o cenário existe
  const scenario = await db.query.survivalScenarios.findFirst({
    where: eq(survivalScenarios.id, scenarioId),
  });

  if (!scenario) {
    throw new Error("Scenario not found");
  }

  // Cria uma nova sessão na BD e retorna a mesma para obtermos o ID gerado
  const [session] = await db
    .insert(survivalSessions)
    .values({
      userId,
      scenarioId,
      chatHistory: [],
      status: "active",
    })
    .returning();

  // Redireciona o utilizador diretamente para a página do chat usando o UUID gerado
  redirect(`/practice/survival/${session.id}`);
};
