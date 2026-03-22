"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Dumbbell, Users, LogOut, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-[256px] bg-white text-slate-500 flex-col hidden lg:flex border-r-2 border-slate-100 z-20 pb-4">
            {/* Logo */}
            <Link href="/admin">
                <div className="flex items-center gap-x-3 pb-5 pl-4 pt-6 border-b-2 border-slate-100">
                    <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
                    <h1 className="text-2xl font-extrabold tracking-wide text-green-600">
                        Admin
                    </h1>
                </div>
            </Link>

            <nav className="flex-1 p-4 flex flex-col gap-y-1 mt-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">Gestão Global</div>
                
                <Link href="/admin" className={cn("flex items-center gap-x-3 rounded-xl px-3 py-2.5 transition-all font-bold text-sm uppercase tracking-wide", pathname === "/admin" ? "bg-sky-500/15 text-sky-500 border-2 border-sky-300" : "text-slate-500 hover:bg-slate-100 border-2 border-transparent")}>
                    <LayoutDashboard className="w-6 h-6" />
                    <span>Visão Geral</span>
                </Link>
                <Link href="/admin/courses" className={cn("flex items-center gap-x-3 rounded-xl px-3 py-2.5 transition-all font-bold text-sm uppercase tracking-wide", pathname.startsWith("/admin/courses") ? "bg-sky-500/15 text-sky-500 border-2 border-sky-300" : "text-slate-500 hover:bg-slate-100 border-2 border-transparent")}>
                    <BookOpen className="w-6 h-6" />
                    <span>Cursos</span>
                </Link>
                <Link href="/admin/units" className={cn("flex items-center gap-x-3 rounded-xl px-3 py-2.5 transition-all font-bold text-sm uppercase tracking-wide", pathname.startsWith("/admin/units") ? "bg-sky-500/15 text-sky-500 border-2 border-sky-300" : "text-slate-500 hover:bg-slate-100 border-2 border-transparent")}>
                    <Layers className="w-6 h-6" />
                    <span>Unidades</span>
                </Link>
                <Link href="/admin/lessons" className={cn("flex items-center gap-x-3 rounded-xl px-3 py-2.5 transition-all font-bold text-sm uppercase tracking-wide", pathname.startsWith("/admin/lessons") ? "bg-sky-500/15 text-sky-500 border-2 border-sky-300" : "text-slate-500 hover:bg-slate-100 border-2 border-transparent")}>
                    <Dumbbell className="w-6 h-6" />
                    <span>Lições & Desafios</span>
                </Link>
                <Link href="/admin/users" className={cn("flex items-center gap-x-3 rounded-xl px-3 py-2.5 transition-all font-bold text-sm uppercase tracking-wide", pathname === "/admin/users" ? "bg-sky-500/15 text-sky-500 border-2 border-sky-300" : "text-slate-500 hover:bg-slate-100 border-2 border-transparent")}>
                    <Users className="w-6 h-6" />
                    <span>Utilizadores</span>
                </Link>
            </nav>

            <div className="px-4 mt-auto">
                <Link href="/learn" className="flex items-center gap-x-3 rounded-xl px-3 py-2.5 transition-all font-bold text-sm uppercase tracking-wide text-slate-500 hover:bg-rose-50 hover:text-rose-500 border-2 border-transparent">
                    <LogOut className="w-6 h-6" />
                    <span>Voltar à App</span>
                </Link>
            </div>
        </aside>
    );
};
