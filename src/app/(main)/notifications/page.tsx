import { getNotifications, getUserProgress } from "@/db/queries";
import { NotificationsHandler } from "@/components/shared/notifications-handler";
import { NotificationInbox } from "@/components/shared/notification-inbox";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
    const notifications = await getNotifications();
    const userProgress = await getUserProgress();

    if (!userProgress) redirect("/courses");

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6 p-6 pb-20">
            <NotificationsHandler />
            <NotificationInbox initialNotifications={notifications} initialEnabled={userProgress.notificationsEnabled} />
        </div>
    );
}
