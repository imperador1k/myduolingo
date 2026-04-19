"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { claimDailyChestReward } from "@/actions/user-progress";
import { toast } from "sonner";
import { useUISounds } from "@/hooks/use-ui-sounds";

type Props = {
    completedQuestsCount: number;
    chestClaimed: boolean;
};

export const ChestClient = ({ completedQuestsCount, chestClaimed }: Props) => {
    const [isClaiming, setIsClaiming] = useState(false);
    const { playClick } = useUISounds();

    const handleClaimReward = async () => {
        if (completedQuestsCount < 3 || chestClaimed || isClaiming) return;
        
        playClick();
        setIsClaiming(true);

        const result = await claimDailyChestReward();
        if ('message' in result && !result.success) {
            toast.error(result.message);
            setIsClaiming(false);
            return;
        }

        if (result.success) {
            // Confetti Explosion
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FFC800', '#58CC02', '#FF4B4B']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FFC800', '#58CC02', '#FF4B4B']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
            toast.success(`Ganhaste ${result.reward} XP!`);
        }
        
        setIsClaiming(false);
    };

    // State 3: Claimed
    if (chestClaimed) {
        return (
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b-2 border-stone-100 mb-8 mt-2">
                <div className="h-28 w-28 shrink-0 rounded-3xl border-2 border-b-4 flex items-center justify-center text-6xl transition-all duration-300 shadow-sm bg-stone-50 border-stone-200">
                    🏆
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl md:text-3xl font-black text-stone-500 mb-2">Baú Aberto</h2>
                    <p className="text-stone-400 font-bold text-sm md:text-base">Volta amanhã para mais missões!</p>
                </div>
            </div>
        );
    }

    // State 2: Ready
    if (completedQuestsCount >= 3) {
        return (
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b-2 border-stone-100 mb-8 mt-2">
                <div className="h-28 w-28 shrink-0 rounded-3xl border-2 border-b-4 flex items-center justify-center text-7xl transition-all duration-300 bg-amber-100 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-bounce cursor-pointer hover:scale-110" onClick={handleClaimReward}>
                    🎁
                </div>
                <div className="flex-1 text-center sm:text-left flex flex-col gap-3 items-center sm:items-start">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-amber-500 mb-1">Baú Pronto!</h2>
                        <p className="text-amber-600/80 font-bold text-sm md:text-base">Completaste todas as missões.</p>
                    </div>
                    <button 
                        onClick={handleClaimReward}
                        disabled={isClaiming}
                        className="w-full sm:w-auto px-8 py-3 bg-[#FFC800] border-2 border-amber-500 border-b-4 active:border-b-0 active:translate-y-[4px] hover:bg-[#fca311] font-black text-white uppercase tracking-wider rounded-2xl transition-all text-lg"
                    >
                        {isClaiming ? "A ABRIR..." : "ABRIR BAÚ"}
                    </button>
                </div>
            </div>
        );
    }

    // State 1: Locked
    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b-2 border-stone-100 mb-8 mt-2">
            <div className="h-28 w-28 shrink-0 rounded-3xl border-2 border-b-4 flex items-center justify-center text-7xl transition-all duration-300 shadow-sm bg-stone-100 border-stone-200 grayscale opacity-80">
                📦
            </div>
            <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl md:text-3xl font-black text-stone-700 mb-2">Baú Diário</h2>
                <p className="text-stone-400 font-bold text-sm md:text-base">Completa 3 missões para abrir o teu tesouro do dia!</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-5">
                    {[1, 2, 3].map((step) => (
                        <div 
                            key={step}
                            className={cn(
                                "h-4 w-12 md:w-16 rounded-full border-2 transition-all duration-500",
                                step <= completedQuestsCount 
                                    ? "bg-amber-400 border-amber-500" 
                                    : "bg-stone-100 border-stone-300"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
