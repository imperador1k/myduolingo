"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home,
    Trophy,
    ShoppingBag,
    User,
    Users,
    Menu,
    X,
    Settings,
    Bell,
    BookOpen,
    MessageSquare,
    Dumbbell,
    GraduationCap,
    Archive,
    BarChart,
    ShieldAlert,
} from "lucide-react";

import { useUISounds } from "@/hooks/use-ui-sounds";
import { useUser } from "@clerk/nextjs";

type MobileItemProps = {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    badgeCount?: number;
};

const MobileItem = ({ href, icon, label, isActive, onClick, badgeCount }: MobileItemProps) => {
    const { playClick } = useUISounds();
    return (
        <Link
            href={href}
            onClick={(e) => {
                playClick();
                if (onClick) onClick();
            }}
            className={cn(
                "relative flex flex-col items-center gap-1 text-stone-400 hover:text-stone-500 active:scale-90 transition-transform",
                isActive && "text-sky-500"
            )}
        >
            {badgeCount && badgeCount > 0 ? (
                <div className="absolute top-0 right-1 translate-x-1/2 -translate-y-1/2 z-10 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white animate-pulse">
                    {badgeCount > 99 ? "99+" : badgeCount}
                </div>
            ) : null}
            <div
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    isActive && "bg-sky-500/15"
                )}
            >
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </Link>
    );
};

type ExpandedTheme = "blue" | "purple" | "yellow" | "red" | "emerald" | "orange" | "indigo" | "stone" | "sky" | "pink";

type ExpandedMobileItemProps = MobileItemProps & {
    colorTheme?: ExpandedTheme;
};

const ExpandedMobileItem = ({ href, icon, label, isActive, onClick, badgeCount, colorTheme = "stone" }: ExpandedMobileItemProps) => {
    const { playClick } = useUISounds();
    
    // Toy Box Color Mapping
    const themeStyles = {
        blue: "bg-blue-100 text-blue-500 border-blue-200",
        purple: "bg-purple-100 text-purple-500 border-purple-200",
        yellow: "bg-yellow-100 text-yellow-500 border-yellow-200",
        red: "bg-red-100 text-red-500 border-red-200",
        emerald: "bg-emerald-100 text-emerald-500 border-emerald-200",
        orange: "bg-orange-100 text-orange-500 border-orange-200",
        indigo: "bg-indigo-100 text-indigo-500 border-indigo-200",
        stone: "bg-stone-100 text-stone-500 border-stone-200",
        sky: "bg-sky-100 text-sky-500 border-sky-200",
        pink: "bg-pink-100 text-pink-500 border-pink-200",
    }[colorTheme];

    return (
        <Link
            href={href}
            onClick={(e) => {
                playClick();
                if (onClick) onClick();
            }}
            className="relative flex flex-col items-center justify-center gap-2 p-2 rounded-2xl hover:bg-stone-50 active:scale-95 transition-all cursor-pointer group"
        >
            {badgeCount && badgeCount > 0 ? (
                <div className="absolute top-0 right-2 translate-x-1/2 -translate-y-1/2 z-10 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white animate-pulse">
                    {badgeCount > 99 ? "99+" : badgeCount}
                </div>
            ) : null}
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border-b-4 group-active:border-b-0 group-active:translate-y-1 transition-all", themeStyles)}>
                {icon}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 uppercase tracking-wider mt-1 text-center">{label}</span>
        </Link>
    );
};

type MobileNavProps = {
    notificationCount?: number;
    unreadMessageCount?: number;
};

export const MobileNav = (props: MobileNavProps) => {
    return (
        <Suspense fallback={null}>
            <MobileNavContent {...props} />
        </Suspense>
    );
};

const MobileNavContent = ({ notificationCount, unreadMessageCount }: MobileNavProps) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeUserId = searchParams.get("userId");
    const [isOpen, setIsOpen] = useState(false);

    // Check for admin role BEFORE early returns
    const { user } = useUser();
    const isAdmin = (user?.publicMetadata as any)?.role === "admin";

    // If we are in an active chat on mobile, hide the bottom nav entirely to maximize screen space
    if (pathname === "/messages" && activeUserId) {
        return null;
    }

    const toggleMenu = () => setIsOpen(!isOpen);

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Backdrop overlay to close menu when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-stone-900/20 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={closeMenu}
                />
            )}

            <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-end lg:hidden pointer-events-none pb-4 px-4 w-full h-full">
                
                {/* Expanded Menu - Toy Box */}
                <div
                    className={cn(
                        "w-full max-w-sm flex flex-col gap-2 transition-all duration-300 pointer-events-auto origin-bottom",
                        isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95 pointer-events-none"
                    )}
                >
                    <div className="bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 w-full mb-6 relative z-40">
                        <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                            <ExpandedMobileItem
                                href="/friends"
                                icon={<Users strokeWidth={2.5} className="h-7 w-7" />}
                                label="Amigos"
                                isActive={pathname === "/friends"}
                                onClick={closeMenu}
                                colorTheme="blue"
                            />
                            <ExpandedMobileItem
                                href="/courses"
                                icon={<BookOpen strokeWidth={2.5} className="h-7 w-7" />}
                                label="Cursos"
                                isActive={pathname === "/courses"}
                                onClick={closeMenu}
                                colorTheme="purple"
                            />
                            <ExpandedMobileItem
                                href="/messages"
                                icon={<MessageSquare strokeWidth={2.5} className="h-7 w-7" />}
                                label="Msgs"
                                isActive={pathname === "/messages"}
                                onClick={closeMenu}
                                badgeCount={unreadMessageCount}
                                colorTheme="sky"
                            />
                            <ExpandedMobileItem
                                href="/notifications"
                                icon={<Bell strokeWidth={2.5} className="h-7 w-7" />}
                                label="Notif."
                                isActive={pathname === "/notifications"}
                                onClick={closeMenu}
                                badgeCount={notificationCount}
                                colorTheme="orange"
                            />
                            <ExpandedMobileItem
                                href="/leaderboard"
                                icon={<Trophy strokeWidth={2.5} className="h-7 w-7" />}
                                label="Liga"
                                isActive={pathname === "/leaderboard"}
                                onClick={closeMenu}
                                colorTheme="yellow"
                            />
                            <ExpandedMobileItem
                                href="/settings"
                                icon={<Settings strokeWidth={2.5} className="h-7 w-7" />}
                                label="Defin."
                                isActive={pathname === "/settings"}
                                onClick={closeMenu}
                                colorTheme="stone"
                            />
                            <ExpandedMobileItem
                                href="/vocabulary"
                                icon={<Archive strokeWidth={2.5} className="h-7 w-7" />}
                                label="Cofre"
                                isActive={pathname === "/vocabulary"}
                                onClick={closeMenu}
                                colorTheme="emerald"
                            />
                            <ExpandedMobileItem
                                href="/analytics"
                                icon={<BarChart strokeWidth={2.5} className="h-7 w-7" />}
                                label="Estat."
                                isActive={pathname === "/analytics"}
                                onClick={closeMenu}
                                colorTheme="pink"
                            />
                            <ExpandedMobileItem
                                href="/evaluation"
                                icon={<GraduationCap strokeWidth={2.5} className="h-7 w-7" />}
                                label="Testes"
                                isActive={pathname === "/evaluation"}
                                onClick={closeMenu}
                                colorTheme="indigo"
                            />
                            {isAdmin && (
                                <ExpandedMobileItem
                                    href="/admin"
                                    icon={<ShieldAlert strokeWidth={2.5} className="h-7 w-7" />}
                                    label="Admin"
                                    isActive={pathname === "/admin"}
                                    onClick={closeMenu}
                                    colorTheme="red"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Floating Bar (The Pill) */}
                <nav className="bg-white/95 backdrop-blur-md border border-stone-200 border-t-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-3xl md:rounded-full px-6 py-2 flex items-center justify-between pointer-events-auto relative w-full max-w-sm">
                    <MobileItem
                        href="/learn"
                        icon={<Home strokeWidth={2.5} className="h-6 w-6" />}
                        label="Início"
                        isActive={pathname === "/learn" || pathname === "/"}
                    />
                    <MobileItem
                        href="/practice"
                        icon={<Dumbbell strokeWidth={2.5} className="h-6 w-6" />}
                        label="Praticar"
                        isActive={pathname.startsWith("/practice")}
                    />

                    {/* Central Toggle Button */}
                    <div className="relative z-50 flex items-center justify-center -mt-8">
                        <button
                            onClick={toggleMenu}
                            className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 outline-none",
                                isOpen 
                                    ? "bg-stone-800 border-2 border-stone-900 rotate-90 scale-105"
                                    : "bg-[#58CC02] border-2 border-[#46a302] border-b-8 active:translate-y-2 active:border-b-0 hover:bg-[#58CC02]"
                            )}
                        >
                            {isOpen ? (
                                <X className="h-7 w-7 stroke-[3px]" />
                            ) : (
                                <Menu className="h-7 w-7 stroke-[3px]" />
                            )}
                        </button>
                    </div>

                    <MobileItem
                        href="/shop"
                        icon={<ShoppingBag strokeWidth={2.5} className="h-6 w-6" />}
                        label="Loja"
                        isActive={pathname === "/shop"}
                    />
                    <MobileItem
                        href="/profile"
                        icon={<User strokeWidth={2.5} className="h-6 w-6" />}
                        label="Perfil"
                        isActive={pathname === "/profile"}
                    />
                </nav>
            </div>
        </>
    );
};
