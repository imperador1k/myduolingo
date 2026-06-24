import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";
import { redirect } from "next/navigation";
import { survivalSessions, survivalScenarios } from "@/db/schema";
import { eq } from "drizzle-orm";
import SurvivalChatClient from "./survival-chat-client";

export default async function SurvivalChatPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Fetch session
  const session = await db.query.survivalSessions.findFirst({
    where: eq(survivalSessions.id, params.sessionId),
    with: {
      scenario: true,
    },
  });

  if (!session || session.userId !== userId) {
    redirect("/practice/survival");
  }

  return (
    <SurvivalChatClient
      sessionId={params.sessionId}
      scenario={session.scenario}
    />
  );
}
