import { db } from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CallRoomClient } from "./CallRoomClient";

export const metadata = {
    title: "Sessão de Conversação | Duolingo Clone",
};

export default async function ConversationPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
    });

    if (!progress) {
        redirect("/");
    }

    return (
        <CallRoomClient activeLanguage={progress.activeLanguage} />
    );
}
