
import { getNotifications } from "@/db/queries";
import { markNotificationsAsRead } from "@/actions/user-actions";
import { NotificationsHandler } from "@/components/shared/notifications-handler";
import { NotificationList } from "@/components/shared/notification-list";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
    const notifications = await getNotifications();

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-6 p-6 pb-20">
            <NotificationsHandler />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-700">Notificações</h1>
                {notifications.some(n => !n.read) && (
                    <form action={markNotificationsAsRead}>
                        <Button variant="ghost" className="text-sky-500 hover:text-sky-600 hidden sm:flex items-center gap-2">
                            <CheckCheck className="h-4 w-4" />
                            Marcar lidas
                        </Button>
                        <Button variant="ghost" size="icon" className="text-sky-500 sm:hidden">
                            <CheckCheck className="h-5 w-5" />
                        </Button>
                    </form>
                )}
            </div>
            
            <NotificationList notifications={notifications} />
        </div>
    );
}

