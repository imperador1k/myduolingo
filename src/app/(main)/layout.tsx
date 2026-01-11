import { getUnreadNotificationCount } from "@/db/queries";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { MobileNav } from "@/components/mobile-nav";
import { StreakCheck } from "@/components/streak-check";

type Props = {
    children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
    return (
        <>
            <MobileHeader />
            <Sidebar className="hidden lg:flex" />
            <main className="lg:pl-[256px] min-h-screen pt-[50px] lg:pt-0 overflow-x-hidden">
                <div className="max-w-[1056px] mx-auto pt-6 flex flex-col gap-6 pb-28 px-4 lg:px-0 lg:pb-0">
                    {children}
                </div>
            </main>
            <MobileNav />
            <StreakCheck />
        </>
    );
}
