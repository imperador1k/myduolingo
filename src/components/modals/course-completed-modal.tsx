"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { issueCertificate } from "@/actions/certificates";
import { toast } from "sonner";
import { BearDanceLottie } from "@/components/ui/lottie-animation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCourseId: number;
};

export const CourseCompletedModal = ({ open, onOpenChange, activeCourseId }: Props) => {
  const t = useTranslations("learn");
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (open) {
      const audio = new Audio("/success.mp3");
      audio
        .play()
        .catch((e) => console.error("Error playing success sound:", e));

      // Trigger massive confetti celebration
      const duration = 4000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 80,
          origin: { x: 0 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff", "#3b82f6"],
          zIndex: 10000,
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 80,
          origin: { x: 1 },
          colors: ["#fbbf24", "#f59e0b", "#d97706", "#ffffff", "#3b82f6"],
          zIndex: 10000,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [open]);

  if (!isClient) return null;

  const handleClaimCertificate = () => {
    startTransition(() => {
      issueCertificate(activeCourseId)
        .then((res) => {
          if (res.success) {
            toast.success(t("certificate_success"));
            router.push(`/certificate/${res.certificateId}`);
            onOpenChange(false);
          }
        })
        .catch(() => toast.error(t("certificate_error")));
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md border-0 p-0 overflow-hidden rounded-3xl bg-gradient-to-b from-amber-50 to-white dark:from-amber-950 dark:to-slate-900 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-6 pt-10 pb-6 px-6 text-center text-slate-700 dark:text-slate-200 relative">
          
          {/* Glowing Trophy Section */}
          <div className="relative flex flex-col items-center justify-center mb-4">
            <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-30 dark:opacity-40 rounded-full h-40 w-40 animate-pulse" />
            <div className="relative flex items-center justify-center drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
              <BearDanceLottie className="h-40 w-40 sm:h-48 sm:w-48" />
            </div>
            
            <span className="text-2xl font-black uppercase tracking-widest mt-4 text-amber-600 dark:text-amber-500">
              {t("epic")}
            </span>
          </div>

          {/* Text Info */}
          <div className="space-y-3 mt-2 relative z-10 px-4">
            <h2 className="text-3xl font-black tracking-tight">{t("completed_course")}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
              {t("completed_course_desc")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t-2 border-slate-100 dark:border-slate-800">
          <Button
            onClick={handleClaimCertificate}
            disabled={isPending}
            className="w-full h-14 text-lg font-bold tracking-wide uppercase rounded-2xl bg-amber-500 hover:bg-amber-400 border-b-4 border-amber-600 text-white"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Award className="w-6 h-6 mr-2" />}
            {t("claim_certificate")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-12 text-slate-500 uppercase font-bold"
          >
            {t("maybe_later")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
