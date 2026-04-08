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
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    Target,
    Gamepad2,
    LifeBuoy
} from "lucide-react";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { useUser } from "@clerk/nextjs";

type SidebarItemProps = {
    label: string;
    iconSrc: React.ReactNode;
    href: string;
    notificationCount?: number;
    isCollapsed?: boolean;
};

const SidebarItem = ({ label, iconSrc, href, notificationCount, isCollapsed }: SidebarItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    const { playClick } = useUISounds();

    return (
        <div className="w-full relative group">
            <Link href={href} className="w-full" onClick={() => playClick()}>
                <div
                    className={cn(
                        "sidebar-item flex items-center justify-center lg:justify-start py-3 px-4 rounded-xl gap-3 w-16 lg:w-full h-16 lg:h-14 relative transition-all duration-300",
                        isActive ? "active bg-[#ddf4ff] border-2 border-b-4 border-[#147bb0]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200 hover:border-b-4",
                        isCollapsed ? "lg:justify-center lg:px-0" : ""
                    )}
                >
                    {iconSrc}
                    
                    <span className={cn(
                        "hidden lg:block font-bold text-sm tracking-wide uppercase transition-all duration-300 overflow-hidden whitespace-nowrap",
                        isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 ml-2"
                    )}>
                        {label}
                    </span>

                    {/* Red Pulse Badge for explicit counts */}
                    {notificationCount && notificationCount > 0 ? (
                        <span className={cn(
                            "absolute bg-rose-500 text-white text-[10px] lg:text-xs font-bold rounded-full animate-pulse border-2 border-white flex items-center justify-center shadow-sm",
                            isCollapsed || typeof window !== 'undefined' && window.innerWidth < 1024 ? "top-0 right-0 w-4 h-4 text-[8px]" : "top-1 right-1 lg:relative lg:top-auto lg:right-auto lg:ml-auto px-1.5 lg:px-2 py-0.5"
                        )}>
                            {isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024) ? "" : notificationCount}
                        </span>
                    ) : null}
                </div>
            </Link>

            {/* CSS-based Tooltip visible only when collapsed */}
            {isCollapsed && (
                <div className="hidden lg:block opacity-0 group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl z-50 pointer-events-none whitespace-nowrap shadow-xl transition-all duration-200">
                    {label}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-slate-800"></div>
                </div>
            )}
        </div>
    );
};

type Props = {
    className?: string;
    notificationCount?: number;
    unreadMessageCount?: number;
};

export const Sidebar = ({ className, notificationCount, unreadMessageCount }: Props) => {
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { playClick } = useUISounds();

    // Check for admin role
    const { user } = useUser();
    const isAdmin = (user?.publicMetadata as any)?.role === "admin";

    return (
        <aside className={cn(
            "bg-white border-r border-gray-200 flex-col items-center py-6 h-full z-20 flex-shrink-0 hidden lg:flex transition-all duration-300 ease-in-out relative",
            isCollapsed ? "w-[96px]" : "w-[256px]",
            className
        )}>
            {/* Collapse Toggle Button */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3.5 top-12 bg-white border-2 border-stone-200 border-b-4 rounded-full p-1 shadow-sm hover:scale-110 active:scale-95 active:border-b-2 active:translate-y-[2px] transition-all z-30"
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4 text-stone-500 stroke-[3]" /> : <ChevronLeft className="w-4 h-4 text-stone-500 stroke-[3]" />}
            </button>

            <div className={cn(
                "mb-10 px-4 w-full flex items-center h-10 transition-all duration-300",
                isCollapsed ? "justify-center" : "justify-start pl-6"
            )}>
                <Link href="/learn" className="flex items-center gap-3 w-full">
                    <img 
                        alt="Duolingo Logo" 
                        className="h-10 w-auto shrink-0 hidden lg:block" 
                        src="/mascot.svg" 
                    />
                    <div className="lg:hidden bg-[#58cc02] rounded-2xl p-2 w-12 h-12 flex items-center justify-center border-b-4 border-[#46a302] hover:brightness-110 transition-all shrink-0">
                        <Bird className="text-white w-6 h-6 shrink-0" fill="currentColor" />
                    </div>
                    <h1 className={cn(
                        "text-2xl font-extrabold text-[#58CC02] tracking-wide hidden lg:block transition-all duration-300 overflow-hidden whitespace-nowrap",
                        isCollapsed ? "opacity-0 w-0" : "opacity-100"
                    )}>
                        MyDuolingo
                    </h1>
                </Link>
            </div>
            
            <nav className="flex-1 w-full px-4 space-y-2 flex flex-col items-center lg:items-stretch overflow-y-auto overflow-x-hidden custom-scrollbar pb-10">
                
                {/* Core Routes - Using strictly V2 visual architecture */}
                <SidebarItem
                    label="Learn"
                    href="/learn"
                    isCollapsed={isCollapsed}
                    iconSrc={<BookOpen className="w-6 h-6 lg:w-7 lg:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Practice AI"
                    href="/practice"
                    isCollapsed={isCollapsed}
                    iconSrc={<Bot className="w-6 h-6 lg:w-7 lg:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Leaderboards"
                    href="/leaderboard"
                    isCollapsed={isCollapsed}
                    iconSrc={<Trophy className="w-6 h-6 lg:w-7 lg:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Missões"
                    href="/quests"
                    isCollapsed={isCollapsed}
                    iconSrc={<Target className="w-6 h-6 lg:w-7 lg:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Arcade"
                    href="/arcade"
                    isCollapsed={isCollapsed}
                    iconSrc={<Gamepad2 className="w-6 h-6 lg:w-7 lg:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Shop"
                    href="/shop"
                    isCollapsed={isCollapsed}
                    iconSrc={<ShoppingBag className="w-6 h-6 lg:w-7 lg:h-7 shrink-0" />}
                />
                <SidebarItem
                    label="Profile"
                    href="/profile"
                    isCollapsed={isCollapsed}
                    iconSrc={<UserIcon className="w-6 h-6 lg:w-7 lg:h-7 shrink-0" />}
                />

                {/* Secondary Routes Toggle */}
                <div className="w-full relative group mt-2">
                    <div
                        onClick={() => {
                            playClick();
                            setIsMoreOpen(!isMoreOpen);
                        }}
                        className={cn(
                            "sidebar-item flex items-center justify-center lg:justify-start py-3 px-4 rounded-xl gap-3 text-gray-400 w-16 lg:w-full h-16 lg:h-14 cursor-pointer relative transition-all duration-300",
                            isMoreOpen ? "bg-gray-100 text-gray-700 font-bold border-2 border-transparent" : "hover:bg-gray-100 border-2 border-transparent hover:border-gray-200 hover:border-b-4",
                            isCollapsed ? "lg:justify-center lg:px-0" : ""
                        )}
                    >
                        <div className={cn("rounded-full w-8 h-8 flex items-center justify-center shrink-0 transition-colors", !isMoreOpen && "bg-gray-200")}>
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                        </div>
                        <span className={cn(
                            "hidden lg:block font-bold text-sm tracking-wide uppercase transition-all duration-300 overflow-hidden whitespace-nowrap",
                            isCollapsed ? "opacity-0 w-0" : "opacity-100"
                        )}>
                            Mais
                        </span>
                        
                        {/* Visual indicator for notification in the "Mais" menu when closed */}
                        {!isMoreOpen && (Number(notificationCount) > 0 || Number(unreadMessageCount) > 0) && (
                            <span className={cn(
                                "absolute top-2 right-2 lg:right-3 lg:top-4 h-3 w-3 rounded-full bg-rose-500 animate-pulse border-2 border-white",
                                isCollapsed ? "top-1 right-1" : ""
                            )}></span>
                        )}
                    </div>
                     {/* Hover Tooltip for Mais */}
                    {isCollapsed && (
                        <div className="hidden lg:block opacity-0 group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl z-50 pointer-events-none whitespace-nowrap shadow-xl transition-all duration-200">
                            Mais
                            <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-slate-800"></div>
                        </div>
                    )}
                </div>

                {/* Secondary Routes Dropdown/Accordion */}
                {isMoreOpen && (
                    <div className="flex flex-col gap-y-2 mt-2 w-full lg:pl-4 lg:border-l-2 lg:border-slate-200 animate-in slide-in-from-top-2 duration-200">
                        <SidebarItem
                            label="Cursos"
                            href="/courses"
                            isCollapsed={isCollapsed}
                            iconSrc={<BookOpen className="h-5 w-5 lg:w-6 lg:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Cofre"
                            href="/vocabulary"
                            isCollapsed={isCollapsed}
                            iconSrc={<Archive className="h-5 w-5 lg:w-6 lg:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Estatísticas"
                            href="/analytics"
                            isCollapsed={isCollapsed}
                            iconSrc={<BarChart className="h-5 w-5 lg:w-6 lg:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Avaliação"
                            href="/evaluation"
                            isCollapsed={isCollapsed}
                            iconSrc={<GraduationCap className="h-5 w-5 lg:w-6 lg:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Amigos"
                            href="/friends"
                            isCollapsed={isCollapsed}
                            iconSrc={<Users className="h-5 w-5 lg:w-6 lg:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Notificações"
                            href="/notifications"
                            isCollapsed={isCollapsed}
                            iconSrc={<Bell className="h-5 w-5 lg:w-6 lg:h-6 shrink-0" />}
                            notificationCount={notificationCount}
                        />
                        <SidebarItem
                            label="Mensagens"
                            href="/messages"
                            isCollapsed={isCollapsed}
                            iconSrc={<Mail className="h-5 w-5 lg:w-6 lg:h-6 shrink-0" />}
                            notificationCount={unreadMessageCount}
                        />
                        <SidebarItem
                            label="Ajuda"
                            href="/support"
                            isCollapsed={isCollapsed}
                            iconSrc={<LifeBuoy className="h-5 w-5 lg:w-6 lg:h-6 shrink-0" />}
                        />
                        <SidebarItem
                            label="Definições"
                            href="/settings"
                            isCollapsed={isCollapsed}
                            iconSrc={<Settings className="h-5 w-5 lg:w-6 lg:h-6 shrink-0" />}
                        />
                        {isAdmin && (
                            <SidebarItem
                                label="Painel Admin"
                                href="/admin"
                                isCollapsed={isCollapsed}
                                iconSrc={<ShieldAlert className="h-5 w-5 lg:w-6 lg:h-6 text-rose-500 shrink-0" />}
                            />
                        )}
                    </div>
                )}
            </nav>

            {/* Hint for global search */}
            <div className="mt-auto hidden lg:flex flex-col pt-4 items-center justify-center text-stone-400 gap-2 mb-2 w-full transition-all duration-300">
                <div 
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 hover:text-stone-600 transition-colors cursor-pointer border-2 border-stone-200 border-b-4 active:border-b-2 active:translate-y-[2px]"
                    onClick={() => {
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                    }}
                >
                    <Search className="h-4 w-4 shrink-0" strokeWidth={3} />
                    {!isCollapsed && <span className="text-xs font-black tracking-widest">CTRL+K</span>}
                </div>
            </div>
        </aside>
    );
};
