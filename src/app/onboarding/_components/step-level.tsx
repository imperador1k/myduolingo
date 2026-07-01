"use client";

import { useOnboardingStore } from "@/store/use-onboarding-store";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const LEVELS = [
  {
    id: "beginner",
    titleKey: "levels.beginner.title",
    descriptionKey: "levels.beginner.description",
    icon: "/duo_happy.png",
    color: "bg-green-100",
    borderColor: "border-green-200",
    accent: "text-green-600",
  },
  {
    id: "basic",
    titleKey: "levels.basic.title",
    descriptionKey: "levels.basic.description",
    icon: "/duo_thinking.png",
    color: "bg-blue-100",
    borderColor: "border-blue-200",
    accent: "text-blue-600",
  },
  {
    id: "intermediate",
    titleKey: "levels.intermediate.title",
    descriptionKey: "levels.intermediate.description",
    icon: "/duo_gentleman.png",
    color: "bg-amber-100",
    borderColor: "border-amber-200",
    accent: "text-amber-600",
  },
  {
    id: "advanced",
    titleKey: "levels.advanced.title",
    descriptionKey: "levels.advanced.description",
    icon: "/duo_detective.png",
    color: "bg-purple-100",
    borderColor: "border-purple-200",
    accent: "text-purple-600",
  },
] as const;

interface StepLevelProps {
  courseTitle: string;
}

export const StepLevel = ({ courseTitle }: StepLevelProps) => {
  const { experienceLevel, setExperienceLevel } = useOnboardingStore();
  const t = useTranslations("Onboarding");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-10 pb-10">
      <div className="flex flex-col items-center text-center space-y-4 max-w-md">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-28 h-28 relative"
        >
          <div className="absolute inset-0 bg-yellow-100 rounded-full blur-2xl opacity-50 animate-pulse" />
          <Image
            src="/marco.png"
            alt={t("marco_mascot_alt")}
            fill
            className="object-contain relative z-10"
          />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black md:text-4xl tracking-tight text-[#042c60]">
            {t.rich("how_much_do_you_know", {
              course_title: courseTitle,
              spanTag: (chunks) => (
                <span className="text-[#58cc02] relative inline-block">
                  {chunks}
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-1 left-0 h-1 bg-[#58cc02]/20 rounded-full"
                  />
                </span>
              ),
            })}
          </h1>
          <p className="text-gray-500 font-bold text-lg md:text-xl">
            {t("marco_personal_plan")}
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
      >
        {LEVELS.map((level) => (
          <motion.button
            key={level.id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setExperienceLevel(level.id)}
            className={`flex flex-col p-6 rounded-3xl border-2 border-b-8 transition-all text-left relative overflow-hidden group
              ${
                experienceLevel === level.id
                  ? "border-[#1cb0f6] bg-[#ddf4ff] shadow-[0_4px_0_#1cb0f6]"
                  : "border-gray-200 bg-white dark:bg-slate-900 hover:border-gray-300 hover:bg-gray-50 active:border-b-2 active:translate-y-1 shadow-[0_4px_0_#e5e5e5]"
              }`}
          >
            {/* Background Accent */}
            <div
              className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 transition-transform group-hover:scale-150 ${level.color}`}
            />

            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div
                className={`w-16 h-16 relative flex-shrink-0 rounded-2xl p-2 bg-white dark:bg-slate-900 shadow-sm border border-gray-100`}
              >
                <Image
                  src={level.icon}
                  alt={t(level.titleKey)}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-[#042c60] leading-none mb-1">
                  {t(level.titleKey)}
                </h3>
                <div
                  className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${level.accent}`}
                >
                  <Sparkles size={10} />
                  {level.id === "beginner"
                    ? t("recommended")
                    : t("active_leveling")}
                </div>
              </div>
            </div>

            <p className="text-gray-500 font-bold text-sm leading-snug relative z-10">
              {t(level.descriptionKey)}
            </p>

            {experienceLevel === level.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 bottom-4 bg-[#1cb0f6] p-1.5 rounded-full text-white shadow-lg"
              >
                <Check size={20} strokeWidth={4} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>

      <p className="text-gray-400 font-bold text-sm italic">
        {t("level_change_note")}
      </p>
    </div>
  );
};
