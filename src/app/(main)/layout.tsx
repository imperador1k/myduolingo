import { Sidebar } from "@/components/shared/sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";
import { MobileNav } from "@/components/shared/mobile-nav";
import { StreakCheck } from "@/components/shared/streak-check";
import { getUnreadMessageCount, getUnreadNotificationCount, getUserProgress } from "@/db/queries";
import { CommandMenu } from "@/components/shared/command-menu";
import { GlobalModals } from "@/components/modals/global-modals";
import { LeagueResultModal } from "@/components/modals/league-result-modal";

type Props = {
    children: React.ReactNode;
};

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: Props) {
    const unreadMessages = (await getUnreadMessageCount()) as number;
    const unreadNotifications = (await getUnreadNotificationCount()) as number;
    const userProgress = (await getUserProgress()) as any;

    return (
        <div className="flex h-screen overflow-hidden bg-[#f3f6f8]">
            <MobileHeader />
            
            {/* Sidebar handling its own flexible width state now */}
            <Sidebar 
                notificationCount={unreadNotifications} 
                unreadMessageCount={unreadMessages} 
            />
            
            {/* Independent Scrolling Main Area */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative lg:pt-0 z-10">
                <div className="max-w-[1056px] mx-auto pt-6 px-6 pb-24 lg:pb-8 relative min-h-full">
                    {children}
                </div>
            </main>
            
            <MobileNav 
                notificationCount={unreadNotifications} 
                unreadMessageCount={unreadMessages} 
            />
            <StreakCheck />
            <CommandMenu />

            {/* Immersive Global Modals Container Z-[100] */}
            <GlobalModals />

            {/* Weekly League Ceremony Modal */}
            {!!userProgress?.lastWeekResult && (
                <LeagueResultModal result={userProgress.lastWeekResult as any} />
            )}
        </div>
    );
}

