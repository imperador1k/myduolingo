"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Star, Crown, Zap, Shield, Gem } from "lucide-react";
import useSound from "use-sound";
import { cn } from "@/lib/utils";
import { clearLeagueResult } from "@/actions/clear-league-result";

type ResultData = {
    league: string;
    oldLeague: string;
    rank: number;
    status: 'PROMOTED' | 'STAYED' | 'DEMOTED';
};

type Props = {
    result: ResultData;
};

const LEAGUE_CONFIG: Record<string, any> = {
    BRONZE: { label: "Bronze", icon: Shield, color: "text-orange-500 fill-orange-200" },
    SILVER: { label: "Prata", icon: Shield, color: "text-slate-500 fill-slate-200" },
    GOLD: { label: "Ouro", icon: Trophy, color: "text-amber-500 fill-amber-200" },
    PLATINUM: { label: "Platina", icon: Gem, color: "text-teal-500 fill-teal-200" },
    DIAMOND: { label: "Diamante", icon: Crown, color: "text-sky-500 fill-sky-200" },
};

export function LeagueResultModal({ result }: Props) {
    const [isOpen, setIsOpen] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [playTada] = useSound('/sounds/tada.mp3', { volume: 0.5 });

    useEffect(() => {
        setMounted(true);
        if (result.status === 'PROMOTED') {
            playTada();
            const duration = 4000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#10b981', '#fbbf24', '#3b82f6']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#10b981', '#fbbf24', '#3b82f6']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [result.status]);

    const handleClose = () => {
        startTransition(async () => {
            const res = await clearLeagueResult();
            if (res?.error) {
                console.error("Failed to clear league result:", res.error);
            }
            setIsOpen(false);
        });
    };

    if (!mounted) return null;

    const currentCfg = LEAGUE_CONFIG[result.league] || LEAGUE_CONFIG.BRONZE;
    const Icon = currentCfg.icon;

    let title = "Resultados da Semana!";
    let message = "";
    let gradient = "from-amber-500/10 to-transparent";
    let accentColor = "text-amber-500";
    let buttonColor = "bg-sky-500 border-sky-600";

    if (result.status === 'PROMOTED') {
        title = "INCRÍVEL!";
        message = `Ficaste em ${result.rank}º lugar e subiste para a Liga ${currentCfg.label}! 🏆`;
        gradient = "from-emerald-500/20 via-emerald-50/10 to-transparent";
        accentColor = "text-emerald-500";
        buttonColor = "bg-emerald-500 border-emerald-600 hover:bg-emerald-600";
    } else if (result.status === 'DEMOTED') {
        title = "OH NÃO...";
        message = `Caíste para a Liga ${currentCfg.label}. Esta semana vamos recuperar! 💪`;
        gradient = "from-rose-500/20 via-rose-50/10 to-transparent";
        accentColor = "text-rose-500";
        buttonColor = "bg-rose-500 border-rose-600 hover:bg-rose-600";
    } else {
        title = "RESULTADOS";
        message = `Ficaste em ${result.rank}º lugar e mantiveste-te na Liga ${currentCfg.label}. Continua assim! 🔥`;
        gradient = "from-sky-500/10 to-transparent";
        accentColor = "text-sky-500";
        buttonColor = "bg-sky-500 border-sky-600 hover:bg-sky-600";
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-supreme"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center p-4 z-supreme pointer-events-none"
                    >
                        <motion.div
                            className={cn(
                                "relative w-full max-w-[440px] bg-white rounded-[3rem] border-2 border-stone-200 border-b-[12px] shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden pointer-events-auto",
                                "before:absolute before:inset-0 before:bg-gradient-to-b before:opacity-50",
                                gradient
                            )}
                            initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 100 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {/* Decorative Shimmer */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />

                            {/* Floating Badge Container */}
                            <motion.div 
                                className="relative mb-8 mt-4"
                                animate={{ y: [0, -12, 0], rotate: [0, 5, 0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            >
                                <div className="absolute inset-0 bg-current opacity-10 blur-3xl rounded-full" />
                                <div className="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-white border-2 border-stone-100 border-b-[10px] shadow-xl overflow-hidden group">
                                    {/* Inner Shine */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    
                                    <Icon className={cn("h-16 w-16 drop-shadow-lg", currentCfg.color)} />
                                </div>
                                
                                {/* Little Sparkles */}
                                {result.status === 'PROMOTED' && (
                                    <motion.div 
                                        className="absolute -top-4 -right-4 text-yellow-400"
                                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        <Star className="fill-current w-8 h-8" />
                                    </motion.div>
                                )}
                            </motion.div>

                            <motion.h2 
                                className={cn("text-4xl font-[1000] tracking-tighter uppercase mb-3", accentColor)}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {title}
                            </motion.h2>
                            
                            <motion.p 
                                className="text-stone-500 font-bold text-xl mb-10 px-4 leading-[1.3] tracking-tight"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {message}
                            </motion.p>

                            <motion.button
                                onClick={handleClose}
                                disabled={isPending}
                                className={cn(
                                    "w-full py-5 rounded-2xl border-b-[6px] text-white font-black text-lg uppercase tracking-wider transition-all active:translate-y-1 active:border-b-2 disabled:opacity-50",
                                    buttonColor
                                )}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>A Processar...</span>
                                    </div>
                                ) : (
                                    "Continuar a Treinar"
                                )}
                            </motion.button>

                            {/* Little hint below */}
                            <p className="mt-6 text-[11px] font-black text-stone-300 uppercase tracking-widest">
                                Nova Liga • Começa agora!
                            </p>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
