import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

type Props = {
    children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
    return (
        <>
            <Sidebar />
            <MobileNav />
            <main className="h-full pb-20 lg:ml-[256px] lg:pb-0">
                <div className="mx-auto h-full max-w-[1056px] px-3 pt-6">{children}</div>
            </main>
        </>
    );
}
