"use client";

import { useCallback, useState, useTransition } from "react";
import { Trophy, ArrowUpCircle, Award, Loader2 } from "lucide-react";
import { BearDanceLottie } from "@/components/ui/lottie-animation";
import { UnitCardIsland } from "@/components/shared/unit-card-island";
import { issueCertificate } from "@/actions/certificates";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLessonModalStore } from "@/store/use-lesson-modal-store";
import { useHeartsModalStore } from "@/store/use-hearts-modal-store";
import { type LessonInfo } from "@/store/use-lesson-modal-store";
import { motion } from "framer-motion";

type Challenge = {
  id: number;
  challengeProgress?: { completed: boolean }[];
};

type Lesson = {
  id: number;
  title: string;
  completed: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  challenges?: Challenge[];
};

type Unit = {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  isActive: boolean;
  isCompleted: boolean;
};

export const UnitIslandFeed = ({
  processedUnits,
  noHearts,
  activeCourseId,
}: {
  processedUnits: Unit[];
  noHearts: boolean;
  activeCourseId: number;
}) => {
  const { openModal } = useLessonModalStore();
  const { openModal: openHeartsModal } = useHeartsModalStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClaimCertificate = () => {
    startTransition(() => {
      issueCertificate(activeCourseId)
        .then((res) => {
          if (res.success) {
            toast.success("Certificado Emitido com Sucesso!");
            router.push(`/certificate/${res.certificateId}`);
          }
        })
        .catch(() => toast.error("Erro ao emitir o certificado."));
    });
  };

  const handleLessonClick = useCallback(
    (lesson: LessonInfo) => {
      if (noHearts) {
        openHeartsModal();
      } else {
        openModal(lesson);
      }
    },
    [noHearts, openHeartsModal, openModal],
  );

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.1, // Faster stagger for better feel
          },
        },
      }}
      className="relative w-full flex flex-col items-center gap-12 sm:gap-16 pb-0"
    >
      {processedUnits.map((unit: Unit, unitIndex: number) => (
        <motion.div
          id={`unit-${unit.id}`}
          key={unit.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: "easeOut" },
            },
          }}
          className="relative w-full flex flex-col items-center scroll-mt-24"
        >
          <UnitCardIsland
            unitIndex={unitIndex}
            unitTitle={unit.title}
            title={unit.title}
            description={unit.description}
            lessons={unit.lessons}
            isActive={unit.isActive}
            isCompleted={unit.isCompleted}
            align={unitIndex % 2 === 0 ? "left" : "right"}
            noHearts={noHearts}
            onLessonClick={handleLessonClick}
          />

          {/* 🏆 Majestic Course Completion Monument */}
          {unitIndex === processedUnits.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
              className="mt-20 mb-32 z-10 flex flex-col items-center relative w-full max-w-[400px]"
            >
              {/* Massive Sunburst Glow Background */}
              <div className="absolute top-10 w-[150%] h-96 bg-gradient-to-t from-yellow-400 via-amber-300 to-transparent mix-blend-screen filter blur-3xl opacity-40 animate-pulse pointer-events-none -z-10"></div>

              {/* Main Golden Pedestal */}
              <div className="relative group cursor-default flex flex-col items-center">
                {/* Floating Elements */}
                <div
                  className="absolute -top-16 -left-10 text-4xl animate-bounce"
                  style={{ animationDelay: "0ms" }}
                >
                  ✨
                </div>
                <div
                  className="absolute top-4 -right-16 text-5xl animate-bounce"
                  style={{ animationDelay: "200ms" }}
                >
                  🌟
                </div>
                <div
                  className="absolute -top-6 right-0 text-3xl animate-bounce"
                  style={{ animationDelay: "400ms" }}
                >
                  🎉
                </div>

                {/* Dancing Bear Lottie standing on Pedestal */}
                <div className="relative z-20 mb-[-40px] drop-shadow-[0_20px_20px_rgba(251,191,36,0.6)]">
                  <BearDanceLottie className="w-56 h-56" />
                </div>

                {/* Golden Base */}
                <div className="w-56 h-32 bg-gradient-to-t from-amber-600 via-yellow-400 to-amber-300 rounded-[2rem] border-4 border-amber-200 border-b-[24px] border-b-amber-700 shadow-[0_40px_60px_rgba(217,119,6,0.6)] flex flex-col items-center justify-start pt-6 relative z-10">
                  <Trophy
                    className="w-16 h-16 text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] group-hover:scale-125 transition-transform duration-500"
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              {/* Majestic Ribbon Plaque */}
              <div className="relative mt-8 z-30 w-full flex justify-center hover:-translate-y-2 transition-transform duration-300">
                {/* Ribbon ends */}
                <div className="absolute -left-4 top-4 w-16 h-16 bg-rose-700 rounded-lg skew-y-12 -z-10 border-b-8 border-rose-900"></div>
                <div className="absolute -right-4 top-4 w-16 h-16 bg-rose-700 rounded-lg -skew-y-12 -z-10 border-b-8 border-rose-900"></div>

                {/* Main Plaque */}
                <div className="bg-gradient-to-b from-rose-500 to-red-600 px-10 py-5 rounded-2xl border-4 border-rose-300 border-b-[8px] border-b-red-800 shadow-2xl text-center relative w-full">
                  <h2 className="font-black text-white uppercase tracking-[0.2em] text-2xl sm:text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] mb-1">
                    Épico!
                  </h2>
                  <p className="font-bold text-rose-100 text-sm sm:text-base drop-shadow-sm uppercase tracking-wider">
                    Completaste o Curso
                  </p>
                </div>
              </div>

              {/* Claim Certificate Button */}
              {(unit.isCompleted || process.env.NODE_ENV === "development") && (
                <div className="mt-8 z-30">
                  <button
                    onClick={handleClaimCertificate}
                    disabled={isPending}
                    className="bg-amber-400 hover:bg-amber-500 text-amber-900 border-2 border-amber-200 border-b-8 hover:border-b-4 active:border-b-0 active:translate-y-2 hover:translate-y-1 transition-all px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-lg sm:text-xl shadow-xl flex items-center gap-3 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2
                        className="w-6 h-6 animate-spin"
                        strokeWidth={3}
                      />
                    ) : (
                      <Award className="w-6 h-6" strokeWidth={3} />
                    )}
                    Reivindicar Diploma
                  </button>
                </div>
              )}

              {/* Back to Start Button */}
              <button
                onClick={() => {
                  const firstUnit = document.getElementById(
                    `unit-${processedUnits[0]?.id}`,
                  );
                  if (firstUnit) {
                    firstUnit.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="mt-12 flex flex-col items-center gap-2 group/btn z-20"
              >
                <span className="font-black text-stone-400 uppercase tracking-widest text-sm group-hover/btn:text-sky-500 transition-colors">
                  Voltar ao início?
                </span>
                <ArrowUpCircle
                  className="w-10 h-10 text-stone-300 group-hover/btn:text-sky-500 group-hover/btn:-translate-y-2 transition-all duration-300"
                  strokeWidth={2}
                />
              </button>
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};
