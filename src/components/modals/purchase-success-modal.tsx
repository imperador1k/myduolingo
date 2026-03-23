"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type PurchaseSuccessModalProps = {
    isOpen: boolean;
    onClose: () => void;
    icon: string;
    title: string;
    description: string;
    color: string; // Tailwind bg color class, e.g. "bg-rose-100"
};

export const PurchaseSuccessModal = ({
    isOpen,
    onClose,
    icon,
    title,
    description,
    color
}: PurchaseSuccessModalProps) => {
    // Prevent hydration mismatch for portals/modals
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl flex flex-col items-center text-center border-b-[4px] border-slate-200 relative overflow-hidden animate-in fade-in zoom-in-100 duration-200">
                {/* Simplified decorative element */}
                <div className={cn("absolute top-0 left-0 w-full h-24 -z-10 bg-gradient-to-b to-white opacity-40", color.replace("bg-", "from-"))} />
                
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 p-1 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Subtler Icon Container */}
                <div className={cn(
                    "flex h-24 w-24 items-center justify-center rounded-3xl shadow-sm mb-6 relative -mt-2",
                    color
                )}>
                    <span className="text-[3.5rem] relative z-10 drop-shadow-sm">{icon}</span>
                </div>

                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
                    {title}
                </h2>
                
                <p className="mb-8 text-base font-medium text-slate-500 px-2">
                    {description}
                </p>

                <div className="flex flex-col w-full mt-auto">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full h-12 text-base rounded-2xl tracking-wide uppercase active:border-b-0 active:translate-y-1"
                        onClick={onClose}
                    >
                        Continuar
                    </Button>
                </div>
            </div>
        </div>
    );
};
