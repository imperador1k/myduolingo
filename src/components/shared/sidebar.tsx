"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Home,
    BookOpen,
    Trophy,
    ShoppingBag,
    User,
    Users,
    Bell,
    Mail,
    Dumbbell,
    Settings,
    BarChart,
    MoreHorizontal,
    Search,
    GraduationCap,
    Archive
} from "lucide-react";
import { useUISounds } from "@/hooks/use-ui-sounds";

type SidebarItemProps = {
    label: string;
    iconSrc: React.ReactNode;
    href: string;
    notificationCount?: number;
};

const SidebarItem = ({ label, iconSrc, href, notificationCount }: SidebarItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    const { playClick } = useUISounds();

    return (
        <Link href={href}>
            <div
                onClick={() => playClick()}
                className={cn(
                    "flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-slate-500 transition-all hover:bg-slate-100",
                    isActive && "bg-sky-500/15 text-sky-500 border-2 border-sky-300"
                )}
            >
                <span className="h-6 w-6">{iconSrc}</span>
                <span className="font-bold text-sm uppercase tracking-wide">
                    {label}
                </span>
                {notificationCount && notificationCount > 0 ? (
                    <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {notificationCount}
                    </span>
                ) : null}
            </div>
        </Link>
    );
};

type Props = {
    className?: string;
    notificationCount?: number;
    unreadMessageCount?: number;
};

export const Sidebar = ({ className, notificationCount, unreadMessageCount }: Props) => {
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const { playClick } = useUISounds();

    return (
        <div className={cn("fixed left-0 top-0 hidden h-full w-[256px] flex-col border-r-2 px-4 lg:flex overflow-y-auto custom-scrollbar pb-4 bg-white z-20", className)}>
            {/* Logo */}
            <Link href="/learn">
                <div className="flex items-center gap-x-3 pb-5 pl-4 pt-6">
                    <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
                    <h1 className="text-2xl font-extrabold tracking-wide text-green-600">
                        Duolingo
                    </h1>
                </div>
            </Link>

            {/* Navigation */}
            <div className="flex flex-1 flex-col gap-y-1 z-10">
                {/* Core Routes */}
                <SidebarItem
                    label="Aprender"
                    href="/learn"
                    iconSrc={<Home className="h-6 w-6" />}
                />
                <SidebarItem
                    label="Praticar AI"
                    href="/practice"
                    iconSrc={<Dumbbell className="h-6 w-6" />}
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

                {/* Secondary Routes Toggle */}
                <div
                    onClick={() => {
                        playClick();
                        setIsMoreOpen(!isMoreOpen);
                    }}
                    className={cn(
                        "flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-slate-500 transition-all hover:bg-slate-100 cursor-pointer mt-1 relative",
                        isMoreOpen && "bg-slate-100 text-slate-700"
                    )}
                >
                    <span className="h-6 w-6"><MoreHorizontal className="h-6 w-6" /></span>
                    <span className="font-bold text-sm uppercase tracking-wide">Mais</span>
                    
                    {/* Visual indicator for notification in the "Mais" menu when closed */}
                    {!isMoreOpen && (Number(notificationCount) > 0 || Number(unreadMessageCount) > 0) && (
                        <span className="absolute right-3 top-3.5 h-3 w-3 rounded-full bg-rose-500 animate-pulse border-2 border-white"></span>
                    )}
                </div>

                {/* Secondary Routes Dropdown/Accordion */}
                {isMoreOpen && (
                    <div className="flex flex-col gap-y-1 mt-1 pl-4 ml-2 border-l-2 border-slate-100 animate-in slide-in-from-top-2 opacity-100 duration-200 overflow-hidden">
                        <SidebarItem
                            label="Cursos"
                            href="/courses"
                            iconSrc={<BookOpen className="h-5 w-5" />}
                        />
                        <SidebarItem
                            label="Cofre"
                            href="/vocabulary"
                            iconSrc={<Archive className="h-5 w-5" />}
                        />
                        <SidebarItem
                            label="Estatísticas"
                            href="/analytics"
                            iconSrc={<BarChart className="h-5 w-5" />}
                        />
                        <SidebarItem
                            label="Avaliação"
                            href="/evaluation"
                            iconSrc={<GraduationCap className="h-5 w-5" />}
                        />
                        <SidebarItem
                            label="Amigos"
                            href="/friends"
                            iconSrc={<Users className="h-5 w-5" />}
                        />
                        <SidebarItem
                            label="Notificações"
                            href="/notifications"
                            iconSrc={<Bell className="h-5 w-5" />}
                            notificationCount={notificationCount}
                        />
                        <SidebarItem
                            label="Mensagens"
                            href="/messages"
                            iconSrc={<Mail className="h-5 w-5" />}
                            notificationCount={unreadMessageCount}
                        />
                        <SidebarItem
                            label="Definições"
                            href="/settings"
                            iconSrc={<Settings className="h-5 w-5" />}
                        />
                    </div>
                )}
            </div>

            {/* Hint for global search */}
            <div className="mt-8 pt-4 border-t-2 border-slate-100 flex items-center justify-center text-slate-400 gap-2 mb-2">
                <Search className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Cmd+K / Ctrl+K</span>
            </div>
        </div>
    );
};
