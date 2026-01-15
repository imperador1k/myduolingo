import { redirect } from "next/navigation";
import { getLesson, getUserProgress } from "@/db/queries";
import { LessonClient } from "./lesson-client";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{ id?: string }>;
};

const LessonPage = async ({ searchParams }: Props) => {
    const params = await searchParams;
    const lessonId = params.id ? parseInt(params.id) : undefined;

    const lessonData = await getLesson(lessonId);
    const userProgress = await getUserProgress();

    if (!lessonData || !userProgress) {
        redirect("/learn");
    }

    return (
        <LessonClient
            initialLesson={lessonData}
            initialHearts={userProgress.hearts}
            initialPoints={userProgress.points}
            xpBoostLessons={userProgress.xpBoostLessons || 0}
            heartShields={userProgress.heartShields || 0}
        />
    );
};

export default LessonPage;
