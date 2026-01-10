import { Sidebar } from "@/components/sidebar";
import { getUnreadNotificationCount } from "@/db/queries";
import { MobileNav } from "@/components/mobile-nav";
import { UserSync } from "@/components/user-sync";

type Props = {
    children: React.ReactNode;
};

export default async function MainLayout({ children }: Props) {
    const notificationCount = await getUnreadNotificationCount();

    return (
        <>
            <UserSync />
            <Sidebar notificationCount={notificationCount} />
            <MobileNav />
            <main className="h-full pb-20 lg:ml-[256px] lg:pb-0">
                <div className="mx-auto h-full max-w-[1056px] px-3 pt-6">{children}</div>
            </main>
        </>
    );
}

