"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streak: number;
  variant: "gained" | "lost";
};

export const StreakModal = ({ open, onOpenChange, streak, variant }: Props) => {
  const t = useTranslations("modals");
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (open && variant === "gained") {
      const audio = new Audio("/streak sound.mp3");
      audio
        .play()
        .catch((e) => console.error("Error playing streak sound:", e));

      // Trigger Confetti Celebration
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#f97316", "#fbbf24", "#ef4444"],
          zIndex: 10000,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#f97316", "#fbbf24", "#ef4444"],
          zIndex: 10000,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [open, variant]);

  if (!isClient) return null;

  const title = variant === "gained" ? t("streak_extended") : t("streak_lost");
  const description =
    variant === "gained" ? t("streak_gained_desc") : t("streak_lost_desc");

  const flameColor =
    variant === "gained" ? "text-orange-500" : "text-slate-400";
  const flameFill = variant === "gained" ? "fill-orange-500" : "fill-slate-200";

  const days = [
    t("sun"),
    t("mon"),
    t("tue"),
    t("wed"),
    t("thu"),
    t("fri"),
    t("sat"),
  ];
  const todayIndex = new Date().getDay();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
            "max-w-md border-0 p-0 overflow-hidden rounded-3xl",
            variant === "gained" 
              ? "bg-gradient-to-b from-orange-50 to-white dark:from-orange-950 dark:to-slate-900" 
              : "bg-white dark:bg-slate-900"
        )}
      >
        <div className="flex flex-col items-center gap-6 pt-10 pb-6 px-6 text-center text-slate-700 dark:text-slate-200 relative">
          
          {/* Glowing Flame Section */}
          <div className="relative flex flex-col items-center justify-center mb-4">
            {variant === "gained" && (
                <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 dark:opacity-30 rounded-full h-40 w-40 animate-pulse" />
            )}
            <div
              className={cn(
                "relative flex items-center justify-center",
                variant === "gained" ? "animate-bounce drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]" : ""
              )}
            >
              <Flame
                className={cn("h-36 w-36 sm:h-40 sm:w-40", flameColor, flameFill)}
                strokeWidth={0.5}
              />
              
              {/* Massive Number Overlay on Flame */}
              <div className="absolute inset-0 flex items-center justify-center mt-8">
                 <span className={cn(
                     "text-5xl sm:text-6xl font-black",
                     variant === "gained" ? "text-white drop-shadow-md" : "text-slate-600"
                 )}>
                    {streak}
                 </span>
              </div>
            </div>
            
            <span className={cn(
                "text-2xl font-black uppercase tracking-widest mt-2",
                variant === "gained" ? "text-orange-500" : "text-slate-500"
            )}>
              {t("days_streak")}
            </span>
          </div>

          {/* Days Grid */}
          <div className="flex w-full justify-between px-2 sm:px-6 relative z-10">
            {days.map((day, i) => {
              const isActive = i <= todayIndex && variant === "gained";
              const isToday = i === todayIndex;

              return (
                <div key={day} className={cn(
                    "flex flex-col items-center gap-2",
                    isToday ? "animate-in slide-in-from-bottom-2 fade-in duration-500" : ""
                )}>
                  <span className={cn(
                      "text-xs font-bold uppercase",
                      isToday ? (variant === "gained" ? "text-orange-500" : "text-slate-500") : "text-slate-400"
                  )}>
                    {day}
                  </span>
                  <div
                    className={cn(
                        "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm transition-all duration-300",
                        isActive ? "bg-orange-500 shadow-orange-200" : "bg-slate-200 dark:bg-slate-700",
                        isToday && variant === "gained" ? "ring-4 ring-orange-200 dark:ring-orange-900 scale-110" : ""
                    )}
                  >
                    {isActive && "✓"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Text Info */}
          <div className="space-y-3 mt-4 relative z-10 px-4">
            <h2 className="text-3xl font-black tracking-tight">{title}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t-2 border-slate-100 dark:border-slate-800">
          <Button
            variant={variant === "gained" ? "primary" : "secondary"}
            className={cn(
                "w-full h-14 text-lg font-bold tracking-wide uppercase rounded-2xl",
                variant === "gained" ? "bg-orange-500 hover:bg-orange-400 border-b-4 border-orange-600 text-white" : ""
            )}
            onClick={() => onOpenChange(false)}
          >
            {t("continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
