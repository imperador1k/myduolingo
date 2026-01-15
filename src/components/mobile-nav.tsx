"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

type MobileItemProps = {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
};

const MobileItem = ({ href, icon, label, isActive }: MobileItemProps) => {
    return (
        <Link
            href={href}
            className={cn(
                "flex flex-col items-center gap-1 text-slate-500 hover:text-slate-600 transition",
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
            {/* Label hidden on floating bar to save space if needed, but keeping for now */}
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </Link>
    );
};

export const MobileNav = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center lg:hidden pointer-events-none">
            {/* Expanded Menu */}
            <div
                className={cn(
                    "absolute bottom-24 flex flex-col gap-2 transition-all duration-300 pointer-events-auto",
                    isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95 pointer-events-none"
                )}
            >
                <div className="bg-white/95 backdrop-blur-md border-2 border-slate-200 rounded-2xl p-4 shadow-xl flex flex-col gap-4 min-w-[280px]">
                    <div className="flex flex-wrap justify-center gap-4">
                        <MobileItem
                            href="/friends"
                            icon={<Users className="h-6 w-6" />}
                            label="Amigos"
                            isActive={pathname === "/friends"}
                        />
                        <MobileItem
                            href="/courses"
                            icon={<BookOpen className="h-6 w-6" />}
                            label="Cursos"
                            isActive={pathname === "/courses"}
                        />
                        <MobileItem
                            href="/messages"
                            icon={<MessageSquare className="h-6 w-6" />}
                            label="Msgs"
                            isActive={pathname === "/messages"}
                        />
                        <MobileItem
                            href="/notifications"
                            icon={<Bell className="h-6 w-6" />}
                            label="Notif."
                            isActive={pathname === "/notifications"}
                        />
                        <MobileItem
                            href="/practice"
                            icon={<Dumbbell className="h-6 w-6" />}
                            label="Praticar AI"
                            isActive={pathname.startsWith("/practice")}
                        />
                        <MobileItem
                            href="/settings"
                            icon={<Settings className="h-6 w-6" />}
                            label="Defin."
                            isActive={pathname === "/settings"}
                        />
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
                    href="/leaderboard"
                    icon={<Trophy className="h-6 w-6" />}
                    label="Liga"
                    isActive={pathname === "/leaderboard"}
                />

                {/* Central Toggle Button */}
                <div className="">
                    <Button
                        onClick={toggleMenu}
                        size="icon"
                        className={cn(
                            "h-12 w-12 rounded-full shadow-lg transition-transform duration-300",
                            isOpen ? "bg-slate-800 hover:bg-slate-900 rotate-180" : "bg-sky-500 hover:bg-sky-600"
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
    );
};
