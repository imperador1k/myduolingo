"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Bird,
    BookOpen,
    Bot,
    Trophy,
    ShoppingBag,
    User as UserIcon,
    Users,
    Bell,
    Mail,
    Settings,
    BarChart,
    MoreHorizontal,
    Search,
    GraduationCap,
    Archive,
    ShieldAlert
} from "lucide-react";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { useUser } from "@clerk/nextjs";

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
        <Link href={href} className="w-full" onClick={() => playClick()}>
            <div
                className={cn(
                    "sidebar-item flex flex-col md:flex-row items-center justify-center md:justify-start py-3 px-4 rounded-xl gap-3 w-16 md:w-full h-16 md:h-14 relative group",
                    isActive ? "active" : "text-gray-400 hover:text-gray-600"
                )}
            >
                {iconSrc}
                <span className="hidden md:block font-bold text-sm tracking-wide uppercase">
                    {label}
                </span>
                {/* Red Pulse Badge for explicit counts */}
                {notificationCount && notificationCount > 0 ? (
                    <span className="absolute top-1 right-1 md:relative md:top-auto md:right-auto md:ml-auto bg-rose-500 text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full animate-pulse border-2 border-white">
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

    // Check for admin role
    const { user } = useUser();
    const isAdmin = (user?.publicMetadata as any)?.role === "admin";

    return (
        <aside className={cn("w-24 md:w-[256px] bg-white border-r border-gray-200 flex-col items-center py-6 h-full z-20 flex-shrink-0 hidden lg:flex", className)}>
            <div className="mb-10 px-4 md:px-0 w-full flex justify-center md:justify-start md:pl-6">
                <Link href="/learn" className="flex items-center">
                    <img 
                        alt="Duolingo Logo" 
                        className="hidden md:block h-10 w-auto" 
                        src="/mascot.svg" 
                    />
                    <div className="md:hidden bg-[#58cc02] rounded-2xl p-2 w-12 h-12 flex items-center justify-center border-b-4 border-[#46a302] hover:brightness-110 transition-all">
                        <Bird className="text-white w-6 h-6 shrink-0" fill="currentColor" />
                    </div>
                </Link>
            </div>
            
            <nav className="flex-1 w-full px-2 md:px-4 space-y-2 flex flex-col items-center md:items-stretch overflow-y-auto overflow-x-hidden custom-scrollbar pb-10">
                
                {/* Core Routes - Using strictly V2 visual architecture */}
                <SidebarItem
                    label="Learn"
                    href="/learn"
                    iconSrc={<BookOpen className="w-6 h-6 md:w-7 md:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Practice AI"
                    href="/practice"
                    iconSrc={<Bot className="w-6 h-6 md:w-7 md:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Leaderboards"
                    href="/leaderboard"
                    iconSrc={<Trophy className="w-6 h-6 md:w-7 md:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Shop"
                    href="/shop"
                    iconSrc={<ShoppingBag className="w-6 h-6 md:w-7 md:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Profile"
                    href="/profile"
                    iconSrc={<UserIcon className="w-6 h-6 md:w-7 md:h-7 shrink-0" />}
                />

                {/* Secondary Routes Toggle */}
                <div
                    onClick={() => {
                        playClick();
                        setIsMoreOpen(!isMoreOpen);
                    }}
                    className={cn(
                        "sidebar-item flex flex-col md:flex-row items-center justify-center md:justify-start py-3 px-4 rounded-xl gap-3 text-gray-400 w-16 md:w-full h-16 md:h-14 cursor-pointer relative",
                        isMoreOpen && "bg-gray-200 text-gray-700"
                    )}
                >
                    <div className={cn("rounded-full w-8 h-8 flex items-center justify-center shrink-0", !isMoreOpen && "bg-gray-200")}>
                        <MoreHorizontal className="w-5 h-5" />
                    </div>
                    <span className="hidden md:block font-bold text-sm tracking-wide uppercase">Mais</span>
                    
                    {/* Visual indicator for notification in the "Mais" menu when closed */}
                    {!isMoreOpen && (Number(notificationCount) > 0 || Number(unreadMessageCount) > 0) && (
                        <span className="absolute top-2 right-2 md:right-3 md:top-4 h-3 w-3 rounded-full bg-rose-500 animate-pulse border-2 border-white"></span>
                    )}
                </div>

                {/* Secondary Routes Dropdown/Accordion */}
                {isMoreOpen && (
                    <div className="flex flex-col gap-y-2 mt-2 md:pl-4 md:ml-4 border-l-2 md:border-slate-200 animate-in slide-in-from-top-2 duration-200">
                        <SidebarItem
                            label="Cursos"
                            href="/courses"
                            iconSrc={<BookOpen className="h-5 w-5 md:w-6 md:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Cofre"
                            href="/vocabulary"
                            iconSrc={<Archive className="h-5 w-5 md:w-6 md:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Estatísticas"
                            href="/analytics"
                            iconSrc={<BarChart className="h-5 w-5 md:w-6 md:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Avaliação"
                            href="/evaluation"
                            iconSrc={<GraduationCap className="h-5 w-5 md:w-6 md:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Amigos"
                            href="/friends"
                            iconSrc={<Users className="h-5 w-5 md:w-6 md:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Notificações"
                            href="/notifications"
                            iconSrc={<Bell className="h-5 w-5 md:w-6 md:h-6 shrink-0" />}
                            notificationCount={notificationCount}
                        />
                        <SidebarItem
                            label="Mensagens"
                            href="/messages"
                            iconSrc={<Mail className="h-5 w-5 md:w-6 md:h-6 shrink-0" />}
                            notificationCount={unreadMessageCount}
                        />
                        <SidebarItem
                            label="Definições"
                            href="/settings"
                            iconSrc={<Settings className="h-5 w-5 md:w-6 md:h-6 shrink-0" />}
                        />
                        {isAdmin && (
                            <SidebarItem
                                label="Painel Admin"
                                href="/admin"
                                iconSrc={<ShieldAlert className="h-5 w-5 md:w-6 md:h-6 text-rose-500 shrink-0" />}
                            />
                        )}
                    </div>
                )}
            </nav>

            {/* Hint for global search */}
            <div className="mt-auto hidden md:flex pt-4 border-t-2 border-slate-100 items-center justify-center text-slate-400 gap-2 mb-2 w-full">
                <Search className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Cmd+K / Ctrl+K</span>
            </div>
        </aside>
    );
};
