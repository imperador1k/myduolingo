"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { claimDailyChestReward } from "@/actions/user-progress";
import { toast } from "sonner";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { useTranslations } from "next-intl";
import { haptics } from "@/lib/haptics";

type Props = {
  completedQuestsCount: number;
  chestClaimed: boolean;
};

export const ChestClient = ({ completedQuestsCount, chestClaimed }: Props) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const { playClick } = useUISounds();
  const t = useTranslations("quests");

  const handleClaimReward = async () => {
    if (completedQuestsCount < 3 || chestClaimed || isClaiming) return;

    playClick();
    haptics.light();
    setIsClaiming(true);

    const result = await claimDailyChestReward();
    if ("message" in result && !result.success) {
      toast.error(result.message);
      haptics.error();
      setIsClaiming(false);
      return;
    }

    if (result.success) {
      haptics.success();
      // Confetti Explosion
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFC800", "#58CC02", "#FF4B4B"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFC800", "#58CC02", "#FF4B4B"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      toast.success(t("reward_gained", { xp: result.reward }));
    }

    setIsClaiming(false);
  };

  // State 3: Claimed
  if (chestClaimed) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b-2 border-stone-100 dark:border-slate-800 mb-8 mt-2">
        <div className="h-28 w-28 shrink-0 rounded-3xl border-2 border-b-4 flex items-center justify-center text-6xl transition-all duration-300 shadow-sm bg-stone-50 dark:bg-slate-800/50 border-stone-200 dark:border-slate-700">
          🏆
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-black text-stone-500 dark:text-slate-400 mb-2">
            {t("chest_opened")}
          </h2>
          <p className="text-stone-400 dark:text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
            {t("come_back_tomorrow")}
          </p>
        </div>
      </div>
    );
  }

  // State 2: Ready
  if (completedQuestsCount >= 3) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b-2 border-stone-100 dark:border-slate-800 mb-8 mt-2">
        <div
          className="h-28 w-28 shrink-0 rounded-3xl border-2 border-b-4 flex items-center justify-center text-7xl transition-all duration-300 bg-amber-100 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 shadow-[0_0_25px_rgba(251,191,36,0.5)] dark:shadow-[0_0_30px_rgba(251,191,36,0.2)] animate-bounce cursor-pointer hover:scale-110"
          onClick={handleClaimReward}
        >
          🎁
        </div>
        <div className="flex-1 text-center sm:text-left flex flex-col gap-3 items-center sm:items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-amber-500 dark:text-amber-400 mb-1">
              {t("chest_ready")}
            </h2>
            <p className="text-amber-600/80 dark:text-amber-200/80 font-bold text-sm md:text-base">
              {t("completed_all_quests")}
            </p>
          </div>
          <button
            onClick={handleClaimReward}
            disabled={isClaiming}
            className="w-full sm:w-auto px-8 py-3 bg-[#FFC800] dark:bg-amber-500 border-2 border-amber-500 dark:border-amber-700 border-b-4 active:border-b-0 active:translate-y-[4px] hover:bg-[#fca311] dark:hover:bg-amber-400 font-black text-white uppercase tracking-wider rounded-2xl transition-all text-lg"
          >
            {isClaiming ? t("opening") : t("open_chest")}
          </button>
        </div>
      </div>
    );
  }

  // State 1: Locked
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b-2 border-stone-100 dark:border-slate-800 mb-8 mt-2">
      <div className="h-28 w-28 shrink-0 rounded-3xl border-2 border-b-4 flex items-center justify-center text-7xl transition-all duration-300 shadow-sm bg-stone-100 dark:bg-slate-800 border-stone-200 dark:border-slate-700 grayscale opacity-80">
        📦
      </div>
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-2xl md:text-3xl font-black text-stone-700 dark:text-slate-200 mb-2">
          {t("daily_chest")}
        </h2>
        <p className="text-stone-400 dark:text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
          {t("complete_quests_to_unlock")}
        </p>
        <div className="flex items-center justify-center sm:justify-start gap-2 mt-5">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "h-4 w-12 md:w-16 rounded-full border-2 transition-all duration-500",
                step <= completedQuestsCount
                  ? "bg-amber-400 border-amber-500 dark:bg-amber-500 dark:border-amber-600"
                  : "bg-stone-100 dark:bg-slate-800 border-stone-300 dark:border-slate-700",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
