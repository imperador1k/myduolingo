import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

type Props = {
    children: React.ReactNode;
};

export default async function AdminLayout({ children }: Props) {
    const user = await currentUser();
    const isAdmin = (user?.publicMetadata as any)?.role === "admin";

    if (!isAdmin) {
        redirect("/");
    }

    return (
        <div className="flex h-screen bg-[#fbf9f8] text-slate-900 font-sans">
            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full">
                <div className="p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
