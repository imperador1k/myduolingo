import { Suspense } from "react";
import { getNotifications, getUserProgress } from "@/db/queries";
import { NotificationInbox } from "@/components/shared/notification-inbox";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";

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
    <div className="flex flex-col w-full max-w-2xl mx-auto animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between py-4 mb-2">
        <div className="h-8 w-32 bg-stone-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-stone-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-stone-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-6 border-b border-stone-200 dark:border-slate-800 mb-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 mb-3 bg-stone-200 dark:bg-slate-800 rounded-md animate-pulse" />
        ))}
      </div>

      {/* Notification list Skeleton */}
      <div className="flex flex-col">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-4 px-2"
          >
            <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-slate-800 shrink-0 animate-pulse" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-3/4 bg-stone-200 dark:bg-slate-800 rounded-md animate-pulse" />
              <div className="h-3 w-1/4 bg-stone-200 dark:bg-slate-800 rounded-md animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-stone-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};
