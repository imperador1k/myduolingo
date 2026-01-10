"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home,
    BookOpen,
    Trophy,
    ShoppingBag,
    User,
} from "lucide-react";

type SidebarItemProps = {
    label: string;
    iconSrc: React.ReactNode;
    href: string;
};

const SidebarItem = ({ label, iconSrc, href }: SidebarItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href}>
            <div
                className={cn(
                    "flex items-center gap-x-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100",
                    isActive && "bg-sky-500/15 text-sky-500 border-2 border-sky-300"
                )}
            >
                <span className="h-6 w-6">{iconSrc}</span>
                <span className="font-bold text-sm uppercase tracking-wide">
                    {label}
                </span>
            </div>
        </Link>
    );
};

export const Sidebar = () => {
    return (
        <div className="fixed left-0 top-0 hidden h-full w-[256px] flex-col border-r-2 px-4 lg:flex">
            {/* Logo */}
            <Link href="/learn">
                <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
                    <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
                    <h1 className="text-2xl font-extrabold tracking-wide text-green-600">
                        Duolingo
                    </h1>
                </div>
            </Link>

            {/* Navigation */}
            <div className="flex flex-1 flex-col gap-y-2">
                <SidebarItem
                    label="Aprender"
                    href="/learn"
                    iconSrc={<Home className="h-6 w-6" />}
                />
                <SidebarItem
                    label="Cursos"
                    href="/courses"
                    iconSrc={<BookOpen className="h-6 w-6" />}
                />
                <SidebarItem
                    label="Classificação"
                    href="/leaderboard"
                    iconSrc={<Trophy className="h-6 w-6" />}
                />
                <SidebarItem
                    label="Loja"
                    href="/shop"
                    iconSrc={<ShoppingBag className="h-6 w-6" />}
                />
                <SidebarItem
                    label="Perfil"
                    href="/profile"
                    iconSrc={<User className="h-6 w-6" />}
                />
            </div>
        </div>
    );
};
