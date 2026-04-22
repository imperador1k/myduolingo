"use client";

import { useState, useEffect } from "react";
import { Hourglass, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Calculates the time remaining until the next Sunday at 23:59:59 (local time).
 * If today IS Sunday and it's before 23:59:59, returns time until tonight.
 */
function getTimeUntilSunday(): { days: number; hours: number; minutes: number; totalMs: number } {
    const now = new Date();

    // Find next Sunday at 23:59:59
    const target = new Date(now);
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    target.setDate(now.getDate() + daysUntilSunday);
    target.setHours(23, 59, 59, 999);

    // If it's already past Sunday 23:59:59, advance to next Sunday
    if (target <= now) {
        target.setDate(target.getDate() + 7);
    }

    const totalMs = target.getTime() - now.getTime();
    const totalSeconds = Math.floor(totalMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return { days, hours, minutes, totalMs };
}

type Props = {
    variant?: "card" | "minimal";
};

export function LeagueCountdown({ variant = "card" }: Props) {
    // Start as null to prevent SSR/hydration mismatch
    const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeUntilSunday> | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Hydrate on mount
        setTimeLeft(getTimeUntilSunday());

        // Update every minute
        const interval = setInterval(() => {
            setTimeLeft(getTimeUntilSunday());
        }, 60_000);

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    // 24 hours in ms
    const isUrgent = timeLeft ? timeLeft.totalMs < 24 * 60 * 60 * 1000 : false;

    if (variant === "minimal") {
        return (
            <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-b-4 backdrop-blur-sm transition-all duration-300",
                isUrgent
                    ? "bg-rose-500/20 border-rose-400/40 text-white"
                    : "bg-white/20 border-white/30 text-white"
            )}>
                <Clock className={cn("h-4 w-4", isUrgent && "animate-pulse")} />
                <div className="flex items-center gap-1.5">
                    {timeLeft === null ? (
                        <div className="h-4 w-16 bg-white/20 rounded-full animate-pulse" />
                    ) : (
                        <>
                            {timeLeft.days > 0 && <span className="font-black text-sm tabular-nums">{timeLeft.days}d</span>}
                            <span className="font-black text-sm tabular-nums">{timeLeft.hours}h</span>
                            <span className="font-black text-sm tabular-nums">{timeLeft.minutes}m</span>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center py-6">
            <div
                className={cn(
                    "relative group overflow-hidden flex flex-col items-center gap-2 px-8 py-6 rounded-[2.5rem] border-2 border-b-[8px] transition-all duration-500",
                    isUrgent
                        ? "bg-rose-50 border-rose-200 border-b-rose-400/80 shadow-rose-100 shadow-xl"
                        : "bg-stone-50 border-stone-200 border-b-stone-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                )}
            >
                {/* Background Shimmer/Glow */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_3s_infinite_linear] pointer-events-none",
                    isUrgent && "via-rose-100/30 animate-[shimmer_2s_infinite_linear]"
                )} />

                <div className="flex items-center gap-3 relative z-10">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-b-4 transition-transform group-hover:rotate-12",
                        isUrgent
                            ? "bg-rose-100 border-rose-200 text-rose-500"
                            : "bg-white border-stone-200 text-stone-400"
                    )}>
                        {isUrgent ? (
                            <Clock className="h-5 w-5 animate-pulse" />
                        ) : (
                            <Hourglass className="h-5 w-5" />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <span className={cn(
                            "font-black text-[10px] md:text-xs uppercase tracking-[0.2em] leading-none",
                            isUrgent ? "text-rose-400" : "text-stone-400"
                        )}>
                            Contagem Decrescente
                        </span>
                        <h3 className={cn(
                            "font-black text-xl md:text-2xl tracking-tighter leading-tight",
                            isUrgent ? "text-rose-600" : "text-stone-600"
                        )}>
                            A Liga termina em:
                        </h3>
                    </div>
                </div>

                {/* The Timer Display */}
                <div className="flex items-center gap-3 mt-2 relative z-10">
                    {timeLeft === null ? (
                        <div className="h-10 w-48 bg-stone-200 rounded-2xl animate-pulse" />
                    ) : (
                        <>
                            {timeLeft.days > 0 && (
                                <TimeSegment value={timeLeft.days} label="dias" urgent={isUrgent} />
                            )}
                            <TimeSegment value={timeLeft.hours} label="horas" urgent={isUrgent} />
                            <TimeSegment value={timeLeft.minutes} label="min" urgent={isUrgent} />
                        </>
                    )}
                </div>

                {isUrgent && (
                    <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-rose-500 rounded-full border-b-2 border-rose-700 animate-bounce">
                        <Zap className="h-3 w-3 text-white fill-white" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Corrida Final!</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function TimeSegment({ value, label, urgent }: { value: number; label: string; urgent: boolean }) {
    return (
        <div className="flex flex-col items-center min-w-[60px]">
            <span className={cn(
                "font-black text-3xl md:text-4xl tracking-tighter tabular-nums leading-none",
                urgent ? "text-rose-600" : "text-stone-700"
            )}>
                {value.toString().padStart(2, '0')}
            </span>
            <span className={cn(
                "font-black text-[10px] uppercase tracking-widest mt-1",
                urgent ? "text-rose-400/60" : "text-stone-400"
            )}>
                {label}
            </span>
        </div>
    );
}
