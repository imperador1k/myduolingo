import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { redirect } from "next/navigation";
import { survivalSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { SurvivalLobbyClient } from "./survival-lobby-client";

export default async function SurvivalLobbyPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Obter todos os cenários ativos
  const scenarios = await db.query.survivalScenarios.findMany();

  // Obter sessões do utilizador para ver histórico/concluídos
  const userSessions = await db.query.survivalSessions.findMany({
    where: eq(survivalSessions.userId, userId),
    orderBy: [desc(survivalSessions.updatedAt)],
  });

  return (
    <SurvivalLobbyClient scenarios={scenarios} userSessions={userSessions} />
  );
}
