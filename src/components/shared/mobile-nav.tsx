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
import { Button } from "@/components/ui/button";

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
                "relative flex flex-col items-center gap-1 text-slate-500 hover:text-slate-600 transition",
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
            {/* Label hidden on floating bar to save space if needed, but keeping for now */}
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </Link>
    );
};

const ExpandedMobileItem = ({ href, icon, label, isActive, onClick, badgeCount }: MobileItemProps) => {
    const { playClick } = useUISounds();
    return (
        <Link
            href={href}
            onClick={(e) => {
                playClick();
                if (onClick) onClick();
            }}
            className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-2 rounded-2xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors",
                isActive && "text-sky-500 bg-sky-50 hover:bg-sky-100 hover:text-sky-600 border border-sky-100"
            )}
        >
            {badgeCount && badgeCount > 0 ? (
                <div className="absolute top-1 right-2 translate-x-1/2 -translate-y-1/2 z-10 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white animate-pulse">
                    {badgeCount > 99 ? "99+" : badgeCount}
                </div>
            ) : null}
            <div className="flex h-8 w-8 items-center justify-center">
                {icon}
            </div>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center">{label}</span>
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
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={closeMenu}
                />
            )}

            <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center lg:hidden pointer-events-none">
                {/* Expanded Menu */}
                <div
                    className={cn(
                        "absolute bottom-24 flex flex-col gap-2 transition-all duration-300 pointer-events-auto",
                        isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95 pointer-events-none"
                    )}
                >
                    <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 min-w-[320px]">
                        <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                            <ExpandedMobileItem
                                href="/friends"
                                icon={<Users className="h-7 w-7" />}
                                label="Amigos"
                                isActive={pathname === "/friends"}
                                onClick={closeMenu}
                            />
                            <ExpandedMobileItem
                                href="/courses"
                                icon={<BookOpen className="h-7 w-7" />}
                                label="Cursos"
                                isActive={pathname === "/courses"}
                                onClick={closeMenu}
                            />
                            <ExpandedMobileItem
                                href="/messages"
                                icon={<MessageSquare className="h-7 w-7" />}
                                label="Msgs"
                                isActive={pathname === "/messages"}
                                onClick={closeMenu}
                                badgeCount={unreadMessageCount}
                            />
                            <ExpandedMobileItem
                                href="/notifications"
                                icon={<Bell className="h-7 w-7" />}
                                label="Notif."
                                isActive={pathname === "/notifications"}
                                onClick={closeMenu}
                                badgeCount={notificationCount}
                            />
                            <ExpandedMobileItem
                                href="/leaderboard"
                                icon={<Trophy className="h-7 w-7" />}
                                label="Liga"
                                isActive={pathname === "/leaderboard"}
                                onClick={closeMenu}
                            />
                            <ExpandedMobileItem
                                href="/settings"
                                icon={<Settings className="h-7 w-7" />}
                                label="Defin."
                                isActive={pathname === "/settings"}
                                onClick={closeMenu}
                            />
                            <ExpandedMobileItem
                                href="/vocabulary"
                                icon={<Archive className="h-7 w-7" />}
                                label="Cofre"
                                isActive={pathname === "/vocabulary"}
                                onClick={closeMenu}
                            />
                            <ExpandedMobileItem
                                href="/analytics"
                                icon={<BarChart className="h-7 w-7" />}
                                label="Estat."
                                isActive={pathname === "/analytics"}
                                onClick={closeMenu}
                            />
                            <ExpandedMobileItem
                                href="/evaluation"
                                icon={<GraduationCap className="h-7 w-7" />}
                                label="Avaliação"
                                isActive={pathname === "/evaluation"}
                                onClick={closeMenu}
                            />
                            {isAdmin && (
                                <ExpandedMobileItem
                                    href="/admin"
                                    icon={<ShieldAlert className="h-7 w-7 text-rose-500" />}
                                    label="Admin"
                                    isActive={pathname === "/admin"}
                                    onClick={closeMenu}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Floating Bar */}
                <nav className="bg-white border-2 border-slate-200 rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 pointer-events-auto">
                    <MobileItem
                        href="/learn"
                        icon={<Home className="h-6 w-6" />}
                        label="Início"
                        isActive={pathname === "/learn" || pathname === "/"}
                    />
                    <MobileItem
                        href="/practice"
                        icon={<Dumbbell className="h-6 w-6" />}
                        label="Praticar"
                        isActive={pathname.startsWith("/practice")}
                    />

                    {/* Central Toggle Button */}
                    <div className="">
                        <Button
                            onClick={toggleMenu}
                            size="icon"
                            className={cn(
                                "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
                                isOpen ? "bg-slate-800 hover:bg-slate-900 rotate-90 scale-105" : "bg-sky-500 hover:bg-sky-600"
                            )}
                        >
                            {isOpen ? (
                                <X className="h-5 w-5 text-white" />
                            ) : (
                                <Menu className="h-5 w-5 text-white" />
                            )}
                        </Button>
                    </div>

                    <MobileItem
                        href="/shop"
                        icon={<ShoppingBag className="h-6 w-6" />}
                        label="Loja"
                        isActive={pathname === "/shop"}
                    />
                    <MobileItem
                        href="/profile"
                        icon={<User className="h-6 w-6" />}
                        label="Perfil"
                        isActive={pathname === "/profile"}
                    />
                </nav>
            </div>
        </>
    );
};
