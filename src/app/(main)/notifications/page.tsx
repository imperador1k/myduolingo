import { Suspense } from "react";
import { getNotifications, getUserProgress } from "@/db/queries";
import { NotificationInbox } from "@/components/shared/notification-inbox";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
    return (
        <div className="mx-auto max-w-[1056px] w-full pb-12 px-4 sm:px-6">
            <Suspense fallback={<NotificationsSkeleton />}>
                <NotificationsData />
            </Suspense>
        </div>
    );
}

async function NotificationsData() {
    const notifications = await getNotifications();
    const userProgress = await getUserProgress();

    if (!userProgress) redirect("/courses");

    return (
        <div className="animate-in fade-in duration-500">
            <NotificationInbox
                initialNotifications={notifications}
                initialEnabled={userProgress.notificationsEnabled}
            />
        </div>
    );
}

// --- SKELETON FALLBACK ---
const NotificationsSkeleton = () => {
    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="w-full h-[220px] md:h-[240px] rounded-[2.5rem] border-2 border-stone-200 border-b-[10px] bg-stone-100 animate-pulse" />

            {/* Notification list Skeleton */}
            <div className="bg-white rounded-[2.5rem] border-2 border-stone-200 border-b-[10px] p-6 md:p-8 shadow-sm">
                <div className="flex flex-col gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-5 p-5 rounded-2xl border-2 border-stone-100 bg-stone-50 animate-pulse"
                        >
                            <div className="w-14 h-14 rounded-full bg-stone-200 shrink-0" />
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="flex justify-between">
                                    <div className="h-5 w-36 bg-stone-200 rounded-lg" />
                                    <div className="h-4 w-20 bg-stone-200 rounded-lg" />
                                </div>
                                <div className="h-4 w-3/4 bg-stone-200 rounded-lg" />
                                <div className="h-4 w-1/2 bg-stone-200 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="h-[120px] rounded-[2.5rem] border-2 border-stone-200 border-b-[10px] bg-stone-50 animate-pulse"
                    />
                ))}
                <div className="md:col-span-2 h-[120px] rounded-[2.5rem] border-2 border-stone-200 border-b-[10px] bg-stone-50 animate-pulse" />
            </div>
        </div>
    );
};
