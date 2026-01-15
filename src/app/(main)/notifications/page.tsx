
import { getNotifications } from "@/db/queries";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NotificationsHandler } from "@/components/notifications-handler";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
    const notifications = await getNotifications();

    return (
        <div className="flex flex-col gap-6 p-6 pb-20">
            <NotificationsHandler />
            <h1 className="text-2xl font-bold text-slate-700">Notificações</h1>
            <div className="flex flex-col gap-2">
                {notifications.map((n) => (
                    <Link
                        key={n.id}
                        href={n.link || "#"}
                        className={cn(
                            "flex items-center gap-4 rounded-xl border-2 p-4 transition-colors hover:bg-slate-100",
                            !n.read && "bg-sky-50 border-sky-200"
                        )}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                            {n.type === "FOLLOW" ? "👋" : "✉️"}
                        </div>
                        <div className="flex flex-col">
                            <p className="font-bold text-slate-700">{n.message}</p>
                            <p className="text-xs text-slate-400">
                                {new Date(n.createdAt!).toLocaleDateString("pt-PT", {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </Link>
                ))}
                {notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                        <p className="text-4xl mb-4">🔔</p>
                        <p className="font-bold">Sem notificações novas</p>
                        <p className="text-slate-400">Tudo calmo por aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
