"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home,
    BookOpen,
    Trophy,
    ShoppingBag,
    User,
} from "lucide-react";

type MobileItemProps = {
    href: string;
    icon: React.ReactNode;
    label: string;
};

const MobileItem = ({ href, icon, label }: MobileItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "flex flex-col items-center gap-1 text-slate-500",
                isActive && "text-sky-500"
            )}
        >
            <div
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    isActive && "bg-sky-500/15"
                )}
            >
                {icon}
            </div>
            <span className="text-xs font-bold">{label}</span>
        </Link>
    );
};

export const MobileNav = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t-2 bg-white pb-4 lg:hidden">
            <MobileItem
                href="/learn"
                icon={<Home className="h-6 w-6" />}
                label="Início"
            />
            <MobileItem
                href="/courses"
                icon={<BookOpen className="h-6 w-6" />}
                label="Cursos"
            />
            <MobileItem
                href="/leaderboard"
                icon={<Trophy className="h-6 w-6" />}
                label="Liga"
            />
            <MobileItem
                href="/shop"
                icon={<ShoppingBag className="h-6 w-6" />}
                label="Loja"
            />
            <MobileItem
                href="/profile"
                icon={<User className="h-6 w-6" />}
                label="Perfil"
            />
        </nav>
    );
};
