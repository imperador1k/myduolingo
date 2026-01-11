"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    streak: number;
    variant: "gained" | "lost";
};

export const StreakModal = ({ open, onOpenChange, streak, variant }: Props) => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => setIsClient(true), []);

    if (!isClient) return null;

    const title = variant === "gained" ? "Streak estendida!" : "Streak perdida...";
    const description = variant === "gained"
        ? "Estás a queimar! 🔥 Continua assim para bateres o teu recorde."
        : "Oh não! Esqueceste-te de praticar ontem. A tua streak voltou a 0.";

    const flameColor = variant === "gained" ? "text-orange-500" : "text-slate-400";
    const flameFill = variant === "gained" ? "fill-orange-500" : "fill-slate-200";

    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const todayIndex = new Date().getDay();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white border-2 border-slate-200">
                <div className="flex flex-col items-center gap-6 py-6 text-center text-slate-700">
                    {/* Visual: Flame + Count */}
                    <div className="relative flex flex-col items-center justify-center">
                        <div className={`relative mb-2 ${variant === 'gained' ? 'animate-bounce' : ''}`}>
                            <Flame className={`h-32 w-32 ${flameColor} ${flameFill}`} strokeWidth={1} />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className={`text-6xl font-bold ${flameColor}`}>{streak}</span>
                            <span className="text-xl font-bold uppercase tracking-wide text-slate-500">Dias de Streak</span>
                        </div>
                    </div>

                    {/* Week Row */}
                    <div className="flex w-full justify-between px-4">
                        {days.map((day, i) => {
                            // Simple logic: if today, highlight. 
                            // In a real app, we'd check history.
                            const isActive = i <= todayIndex && variant === "gained";
                            const isToday = i === todayIndex;

                            return (
                                <div key={day} className="flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400">{day}</span>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                                        ${isActive ? "bg-orange-500" : "bg-slate-200"}
                                        ${isToday && variant === 'gained' ? "ring-4 ring-orange-200" : ""}
                                     `}>
                                        {isActive && "✓"}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <p className="text-slate-500 font-medium">
                            {description}
                        </p>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        variant={variant === "gained" ? "primary" : "secondary"}
                        className="w-full"
                        size="lg"
                        onClick={() => onOpenChange(false)}
                    >
                        Continuar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
