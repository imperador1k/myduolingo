import { db } from "@/db/drizzle";
import { courses, challenges, lessons } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { count } from "drizzle-orm";
import { LayoutDashboard, BookOpen, Dumbbell, Users, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    // Fetch real counts
    const [coursesResult] = await db.select({ value: count() }).from(courses);
    const [challengesResult] = await db.select({ value: count() }).from(challenges);
    const [lessonsResult] = await db.select({ value: count() }).from(lessons);

    const client = await clerkClient();
    const { totalCount: usersTotal } = await client.users.getUserList({ limit: 1 });

    const stats = [
        { label: "Utilizadores", value: usersTotal, icon: Users, color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100" },
        { label: "Cursos", value: coursesResult.value, icon: BookOpen, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-100" },
        { label: "Lições", value: lessonsResult.value, icon: Dumbbell, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
        { label: "Desafios", value: challengesResult.value, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/20">
                    <LayoutDashboard className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Visão Geral</h1>
                    <p className="text-slate-500 font-medium">Bem-vindo ao painel de administração CMS.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {stats.map((stat) => (
                    <div key={stat.label} className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.border} flex items-center gap-4`}>
                        <div className={`${stat.bg} p-3 rounded-xl`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-800 mt-0.5">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-4 flex flex-col items-center justify-center text-center py-16">
                <h2 className="text-xl font-bold text-slate-700">Tudo operacional ✅</h2>
                <p className="text-slate-500 mt-2 max-w-md">Usa o menu lateral para gerires os cursos, lições, desafios e utilizadores do sistema.</p>
            </div>
        </div>
    );
}
