"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Dumbbell, Users, LogOut, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="w-[280px] bg-white text-slate-500 flex-col hidden lg:flex border-r-[4px] border-stone-200 z-20 pb-4 shadow-sm">
            {/* Logo */}
            <Link href="/admin">
                <div className="flex items-center gap-x-3 pb-6 pl-6 pt-8 border-b-2 border-stone-100">
                    <div className="bg-sky-100 p-2 rounded-xl rounded-br-sm border-2 border-sky-200 shadow-sm relative">
                        <Image src="/mascot.svg" height={32} width={32} alt="Mascot" className="drop-shadow-sm" />
                        <div className="absolute -top-2.5 -right-2.5 bg-amber-400 p-1 rounded-full border-2 border-amber-500 shadow-sm rotate-12">
                            <span className="text-[10px] leading-none block">👑</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black tracking-tighter text-slate-800 leading-none">
                            My Duolingo
                        </h1>
                        <span className="text-[11px] font-black text-sky-500 uppercase tracking-widest mt-0.5">
                            Admin Panel
                        </span>
                    </div>
                </div>
            </Link>

            <nav className="flex-1 p-5 flex flex-col gap-y-2 mt-4">
                <div className="text-[11px] font-black text-stone-400 uppercase tracking-widest pl-2 mb-3">Comandos Globais</div>
                
                <Link href="/admin" className={cn("flex items-center gap-x-3 rounded-[16px] px-4 py-3.5 transition-all font-black text-[13px] uppercase tracking-wider", pathname === "/admin" ? "bg-[#1CB0F6] text-white border-2 border-transparent border-b-[4px] hover:border-b-[4px] border-b-[#0092d6] active:border-b-[2px] active:translate-y-[2px] shadow-sm cursor-default" : "text-stone-500 hover:bg-stone-50 border-2 border-transparent border-b-[4px] hover:translate-x-1 cursor-pointer")}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Visão Geral</span>
                </Link>
                <Link href="/admin/courses" className={cn("flex items-center gap-x-3 rounded-[16px] px-4 py-3.5 transition-all font-black text-[13px] uppercase tracking-wider", pathname.startsWith("/admin/courses") ? "bg-[#1CB0F6] text-white border-2 border-transparent border-b-[4px] hover:border-b-[4px] border-b-[#0092d6] active:border-b-[2px] active:translate-y-[2px] shadow-sm cursor-default" : "text-stone-500 hover:bg-stone-50 border-2 border-transparent border-b-[4px] hover:translate-x-1 cursor-pointer")}>
                    <BookOpen className="w-5 h-5" />
                    <span>Mundos</span>
                </Link>
                <Link href="/admin/units" className={cn("flex items-center gap-x-3 rounded-[16px] px-4 py-3.5 transition-all font-black text-[13px] uppercase tracking-wider", pathname.startsWith("/admin/units") ? "bg-[#1CB0F6] text-white border-2 border-transparent border-b-[4px] hover:border-b-[4px] border-b-[#0092d6] active:border-b-[2px] active:translate-y-[2px] shadow-sm cursor-default" : "text-stone-500 hover:bg-stone-50 border-2 border-transparent border-b-[4px] hover:translate-x-1 cursor-pointer")}>
                    <Layers className="w-5 h-5" />
                    <span>Unidades</span>
                </Link>
                <Link href="/admin/lessons" className={cn("flex items-center gap-x-3 rounded-[16px] px-4 py-3.5 transition-all font-black text-[13px] uppercase tracking-wider", pathname.startsWith("/admin/lessons") ? "bg-[#1CB0F6] text-white border-2 border-transparent border-b-[4px] hover:border-b-[4px] border-b-[#0092d6] active:border-b-[2px] active:translate-y-[2px] shadow-sm cursor-default" : "text-stone-500 hover:bg-stone-50 border-2 border-transparent border-b-[4px] hover:translate-x-1 cursor-pointer")}>
                    <Dumbbell className="w-5 h-5" />
                    <span>Lições & Drop</span>
                </Link>
                <Link href="/admin/users" className={cn("flex items-center gap-x-3 rounded-[16px] px-4 py-3.5 transition-all font-black text-[13px] uppercase tracking-wider", pathname === "/admin/users" ? "bg-[#1CB0F6] text-white border-2 border-transparent border-b-[4px] hover:border-b-[4px] border-b-[#0092d6] active:border-b-[2px] active:translate-y-[2px] shadow-sm cursor-default" : "text-stone-500 hover:bg-stone-50 border-2 border-transparent border-b-[4px] hover:translate-x-1 cursor-pointer")}>
                    <Users className="w-5 h-5" />
                    <span>Jogadores</span>
                </Link>
            </nav>

            <div className="px-5 mt-auto">
                <Link href="/learn" className="flex items-center gap-x-3 rounded-[16px] px-4 py-3.5 transition-all font-black text-[13px] uppercase tracking-wider text-stone-500 hover:bg-rose-50 hover:text-rose-500 border-2 border-transparent border-b-[4px] hover:translate-x-1 cursor-pointer">
                    <LogOut className="w-5 h-5" />
                    <span>Sair da Consola</span>
                </Link>
            </div>
        </aside>
    );
};
