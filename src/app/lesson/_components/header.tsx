import { useTranslations } from "next-intl";

import {
  X,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Heart,
  Infinity,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ProgressBar = ({ value, streakCount = 0 }: { value: number; streakCount?: number }) => {
  const isStreak = streakCount >= 2;
  return (
    <div className="h-5 w-full rounded-full bg-stone-200 dark:bg-slate-700 relative">
      <div
        className={cn(
          "absolute top-0 left-0 h-full rounded-full transition-all duration-300",
          isStreak ? "bg-orange-500" : "bg-[#58CC02]"
        )}
        style={{ width: `${value}%` }}
      >
        <div className="absolute top-1 left-2 right-2 h-1.5 rounded-full bg-white/25 pointer-events-none" />
        
        {isStreak && value > 0 && (
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center justify-center gap-0.5 bg-white dark:bg-slate-900 rounded-full px-1.5 py-0.5 border-2 border-orange-200 shadow-sm z-10 animate-bounce">
            <Flame className="h-4 w-4 text-orange-500 fill-orange-200" />
            <span className="text-xs font-black text-orange-500">{streakCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Hearts = ({ hearts, isPro }: { hearts: number; isPro?: boolean }) => {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-4 rounded-xl px-4 py-2 font-bold text-rose-500">
      {isPro ? (
        <>
          <Infinity className="h-6 w-6 text-rose-500 stroke-[3]" />
        </>
      ) : (
        <>
          <Heart
            className={cn(
              "h-6 w-6",
              hearts > 0 ? "fill-rose-500 text-rose-500" : "text-stone-300",
            )}
          />
          <span>{hearts}</span>
        </>
      )}
    </div>
  );
};

type HeaderProps = {
  progress: number;
  hearts: number;
  xpBoostLessons: number;
  heartShields: number;
  isAudioMuted: boolean;
  onToggleMute: () => void;
  onExit: () => void;
  isPro?: boolean;
  consecutiveCorrectCount?: number;
};

export const LessonHeader = ({
  progress,
  hearts,
  xpBoostLessons,
  heartShields,
  isAudioMuted,
  onToggleMute,
  onExit,
  isPro,
  consecutiveCorrectCount = 0,
}: HeaderProps) => {
  const t = useTranslations("lesson");
  return (
    <header className="mx-auto flex w-full max-w-[1140px] shrink-0 items-center justify-between gap-x-4 px-6 pt-6 lg:pt-12">
      <button
        onClick={onExit}
        className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="flex-1 flex items-center pt-2 pb-2">
        <ProgressBar value={progress} streakCount={consecutiveCorrectCount} />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMute}
          className={cn(
            "rounded-xl p-2 transition-all active:scale-90",
            isAudioMuted
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200"
              : "bg-sky-50 text-sky-500 hover:bg-sky-100",
          )}
          title={isAudioMuted ? t("enable_sound") : t("mute")}
        >
          {isAudioMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>

        {xpBoostLessons > 0 && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-4 rounded-xl px-4 py-2 font-bold text-purple-600">
            <Zap className="h-5 w-5 fill-current" />
            <span>{xpBoostLessons}</span>
          </div>
        )}

        {heartShields > 0 && (
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-stone-200 dark:border-slate-800 border-b-4 rounded-xl px-4 py-2 font-bold text-sky-600">
            <Shield className="h-5 w-5 fill-current" />
            <span>{heartShields}</span>
          </div>
        )}

        <Hearts hearts={hearts} isPro={isPro} />
      </div>
    </header>
  );
};
