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
            <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0">
                <div className="max-w-[1056px] mx-auto pt-6 h-full">
                    {children}
                </div>
            </main>
            <MobileNav />
            <StreakCheck />
        </>
    );
}
