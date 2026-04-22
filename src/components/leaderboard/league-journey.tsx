"use client";

import { motion } from "framer-motion";
import { Shield, Trophy, Crown, Gem, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── League definitions — must match LEAGUE_CONFIG in page.tsx ────────────────
const LEAGUES = [
    {
        key: "BRONZE",
        label: "Bronze",
        icon: Shield,
        activeColor: "text-orange-500",
        activeBg: "bg-orange-50 border-orange-300",
        activeFill: "fill-orange-200",
        activeBar: "bg-gradient-to-r from-orange-400 to-amber-300",
    },
    {
        key: "SILVER",
        label: "Prata",
        icon: Shield,
        activeColor: "text-slate-500",
        activeBg: "bg-slate-50 border-slate-300",
        activeFill: "fill-slate-200",
        activeBar: "bg-gradient-to-r from-slate-400 to-slate-300",
    },
    {
        key: "GOLD",
        label: "Ouro",
        icon: Trophy,
        activeColor: "text-amber-500",
        activeBg: "bg-amber-50 border-amber-300",
        activeFill: "fill-amber-200",
        activeBar: "bg-gradient-to-r from-amber-500 to-yellow-400",
    },
    {
        key: "PLATINUM",
        label: "Platina",
        icon: Gem,
        activeColor: "text-teal-500",
        activeBg: "bg-teal-50 border-teal-300",
        activeFill: "fill-teal-200",
        activeBar: "bg-gradient-to-r from-teal-400 to-cyan-300",
    },
    {
        key: "DIAMOND",
        label: "Diamante",
        icon: Crown,
        activeColor: "text-sky-500",
        activeBg: "bg-sky-50 border-sky-300",
        activeFill: "fill-sky-200",
        activeBar: "bg-gradient-to-r from-sky-500 to-indigo-500",
    },
] as const;

type LeagueKey = (typeof LEAGUES)[number]["key"];

type Props = {
    currentLeague: string;
};

export function LeagueJourney({ currentLeague }: Props) {
    const currentIndex = LEAGUES.findIndex((l) => l.key === currentLeague);

    return (
        <div className="bg-white rounded-[2.5rem] border-2 border-stone-200 border-b-[10px] p-6 md:p-8 shadow-sm overflow-hidden relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6 relative z-10">
                O teu caminho para o topo
            </p>

            <div className="relative z-10 flex items-center justify-between">
                {LEAGUES.map((league, index) => {
                    const Icon = league.icon;
                    const isUnlocked = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const isLast = index === LEAGUES.length - 1;

                    return (
                        <div key={league.key} className="flex items-center flex-1">
                            {/* Badge */}
                            <motion.div
                                className="flex flex-col items-center gap-2 shrink-0"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                            >
                                <div
                                    className={cn(
                                        "relative flex items-center justify-center rounded-2xl border-2 border-b-4 transition-all duration-300 shadow-sm",
                                        // Size: current is larger, others are compact
                                        isCurrent ? "w-14 h-14 md:w-16 md:h-16" : "w-10 h-10 md:w-12 md:h-12",
                                        isUnlocked
                                            ? league.activeBg
                                            : "bg-stone-100 border-stone-200",
                                        // Scale up the current badge
                                        isCurrent && "scale-110 shadow-md"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "transition-all duration-300",
                                            isCurrent ? "h-7 w-7 md:h-8 md:w-8" : "h-4 w-4 md:h-5 md:w-5",
                                            isUnlocked
                                                ? cn(league.activeColor, league.activeFill)
                                                : "text-stone-300 fill-stone-200",
                                            !isUnlocked && "grayscale opacity-40"
                                        )}
                                    />

                                    {/* "Current" pulse ring */}
                                    {isCurrent && (
                                        <motion.div
                                            className={cn(
                                                "absolute inset-0 rounded-2xl border-2",
                                                league.activeBg.replace("bg-", "border-").split(" ")[0]
                                            )}
                                            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    )}
                                </div>

                                <span
                                    className={cn(
                                        "text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                                        isCurrent ? league.activeColor : isUnlocked ? "text-stone-500" : "text-stone-300"
                                    )}
                                >
                                    {league.label}
                                </span>
                            </motion.div>

                            {/* Connector line between badges */}
                            {!isLast && (
                                <div className="flex-1 h-1.5 mx-1 md:mx-2 rounded-full overflow-hidden bg-stone-100">
                                    <motion.div
                                        className={cn(
                                            "h-full rounded-full",
                                            // Fill line up to and including current league
                                            index < currentIndex
                                                ? LEAGUES[index].activeBar
                                                : index === currentIndex
                                                    ? LEAGUES[index].activeBar
                                                    : "bg-stone-100"
                                        )}
                                        initial={{ width: "0%" }}
                                        animate={{
                                            width: index < currentIndex
                                                ? "100%"
                                                : index === currentIndex
                                                    ? "50%"
                                                    : "0%",
                                        }}
                                        transition={{ delay: index * 0.15 + 0.2, duration: 0.6, ease: "easeOut" }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
