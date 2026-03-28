import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

type Props = {
    children: React.ReactNode;
};

export default async function AdminLayout({ children }: Props) {
    const { userId } = await auth();
    
    // Server-Side Strict Allowlist Check (Secondary Visual Lock)
    const allowedIds = process.env.ADMIN_ALLOWED_USER_IDS?.split(",").map(id => id.trim()) || [];
    if (!userId || !allowedIds.includes(userId)) {
        notFound(); // Prevents flash of unauthenticated layout content
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
