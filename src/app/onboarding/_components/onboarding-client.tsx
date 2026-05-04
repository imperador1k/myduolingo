"use client";

import { useOnboardingStore } from "@/store/use-onboarding-store";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { StepWelcome } from "./step-welcome";
import { StepGetReady } from "./step-get-ready";
import { StepCourse } from "./step-course";
import { StepMotivation } from "./step-motivation";
import { StepLevel } from "./step-level";
import { StepPlacementResult } from "./step-placement-result";
import { StepSignUp } from "./step-sign-up";

interface OnboardingClientProps {
  courses: {
    id: number;
    title: string;
    imageSrc: string;
    studentCount: number;
  }[];
}

const TOTAL_STEPS = 7;

const variants = {
  initial: { x: "100%", opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30 
    } 
  },
  exit: { 
    x: "-100%", 
    opacity: 0, 
    transition: { 
      duration: 0.2 
    } 
  }
} as const;

export const OnboardingClient = ({ courses }: OnboardingClientProps) => {
  const router = useRouter();
  const { step, prevStep, nextStep, selectedCourse, motivation, experienceLevel, completeOnboarding } = useOnboardingStore();

  const progress = (step / TOTAL_STEPS) * 100;

  const handleBack = () => {
    if (step === 1) router.push("/");
    else prevStep();
  };

  const canContinue = 
    (step === 1) || 
    (step === 2) || 
    (step === 3 && selectedCourse !== null) ||
    (step === 4 && motivation !== null) ||
    (step === 5 && experienceLevel !== null) ||
    (step === 6) ||
    (step === 7);

  const handleContinue = () => {
    if (!canContinue) return;
    if (step < TOTAL_STEPS) {
      nextStep();
    } else {
      completeOnboarding();
      router.push("/sign-up");
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white text-[#042c60]">
      <header className="flex items-center px-4 pt-4 pb-2 md:max-w-3xl md:mx-auto w-full gap-4">
        <button onClick={handleBack} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#58cc02]"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative md:max-w-3xl md:mx-auto w-full px-4 pt-4 pb-32 sm:pb-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 px-4 flex flex-col items-center min-h-full"
          >
            {step === 1 && <StepWelcome />}
            {step === 2 && <StepGetReady />}
            {step === 3 && <StepCourse courses={courses} />}
            {step === 4 && <StepMotivation />}
            {step === 5 && <StepLevel />}
            {step === 6 && <StepPlacementResult />}
            {step === 7 && <StepSignUp />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-gray-100 md:max-w-3xl md:mx-auto z-50">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wide uppercase transition-all
            ${canContinue 
              ? "bg-[#58cc02] text-white border-b-4 border-[#46a302] hover:bg-[#46a302] hover:border-[#388202] active:border-b-0 active:translate-y-1" 
              : "bg-[#e5e5e5] text-[#afafaf] cursor-not-allowed"}
          `}
        >
          Continuar
        </button>
      </footer>
    </div>
  );
};
