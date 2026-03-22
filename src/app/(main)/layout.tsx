import { Sidebar } from "@/components/shared/sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";
import { MobileNav } from "@/components/shared/mobile-nav";
import { StreakCheck } from "@/components/shared/streak-check";
import { getUnreadMessageCount, getUnreadNotificationCount } from "@/db/queries";
import { CommandMenu } from "@/components/shared/command-menu";

type Props = {
    children: React.ReactNode;
};

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: Props) {
    const unreadMessages = await getUnreadMessageCount();
    const unreadNotifications = await getUnreadNotificationCount();

    return (
        <>
            <MobileHeader />
            <Sidebar 
                className="hidden lg:flex" 
                notificationCount={unreadNotifications} 
                unreadMessageCount={unreadMessages} 
            />
            <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0 overflow-y-auto overflow-x-hidden">
                <div className="max-w-[1056px] mx-auto pt-6 min-h-full pb-48 lg:pb-8">
                    {children}
                </div>
            </main>
            <MobileNav 
                notificationCount={unreadNotifications} 
                unreadMessageCount={unreadMessages} 
            />
            <StreakCheck />
            <CommandMenu />
        </>
    );
}

