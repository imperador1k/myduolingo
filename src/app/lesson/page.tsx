import { redirect } from "next/navigation";
import { getLesson, getUserProgress, getHeartClinicLesson } from "@/db/queries";
import { LessonClient } from "./lesson-client";
import { checkSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type Props = {
    searchParams: Promise<{ id?: string; clinic?: string }>;
};

const LessonPage = async ({ searchParams }: Props) => {
    const params = await searchParams;
    const userProgress = await getUserProgress();
    const isPro = await checkSubscription();

    if (!userProgress) {
        redirect("/learn");
    }

    // Heart Clinic mode: load mistake-based challenges
    if (params.clinic === "true") {
        const clinicData = await getHeartClinicLesson();

        if (!clinicData) {
            // No mistakes to practice — redirect with a message
            redirect("/shop");
        }

        return (
            <LessonClient
                initialLesson={clinicData}
                initialHearts={userProgress.hearts}
                initialPoints={userProgress.points}
                xpBoostLessons={userProgress.xpBoostLessons || 0}
                heartShields={userProgress.heartShields || 0}
                languageCode={userProgress.activeCourse?.languageCode || "en"}
                language={userProgress.activeCourse?.language || "English"}
                isClinic
                isPro={isPro}
            />
        );
    }

    // Normal lesson mode
    const lessonId = params.id ? parseInt(params.id) : undefined;
    const lessonData = await getLesson(lessonId);

    if (!lessonData) {
        redirect("/learn");
    }

    return (
        <LessonClient
            initialLesson={lessonData}
            initialHearts={userProgress.hearts}
            initialPoints={userProgress.points}
            xpBoostLessons={userProgress.xpBoostLessons || 0}
            heartShields={userProgress.heartShields || 0}
            languageCode={userProgress.activeCourse?.languageCode || "en"}
            language={userProgress.activeCourse?.language || "English"}
            isPro={isPro}
        />
    );
};

export default LessonPage;
