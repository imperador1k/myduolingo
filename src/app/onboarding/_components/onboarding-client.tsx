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
import { StepPlacement } from "./step-placement";
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

const TOTAL_STEPS = 8;

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
  const { step, setStep, prevStep, nextStep, selectedCourse, motivation, experienceLevel, placementResults, completeOnboarding } = useOnboardingStore();

  const progress = (step / TOTAL_STEPS) * 100;
  
  const selectedCourseTitle = courses.find(c => c.id === selectedCourse)?.title || "Inglês";

  const handleBack = () => {
    if (step === 1) {
      router.push("/");
      return;
    }

    // Logic for jumping back from Sign Up if beginner
    if (step === 8 && experienceLevel === "beginner") {
      setStep(5);
      return;
    }

    prevStep();
  };

  const canContinue = 
    (step === 1) || 
    (step === 2) || 
    (step === 3 && selectedCourse !== null) ||
    (step === 4 && motivation !== null) ||
    (step === 5 && experienceLevel !== null) ||
    (step === 6) ||
    (step === 7) ||
    (step === 8);

  const handleContinue = () => {
    if (!canContinue) return;
    
    // Logic for Step 5 (Level selection)
    if (step === 5) {
      if (experienceLevel === "beginner") {
        setStep(8); // Go straight to sign up
        return;
      }
      nextStep();
      return;
    }

    if (step < TOTAL_STEPS) {
      nextStep();
    } else {
      completeOnboarding();
      
      // Save full onboarding data to a cookie for server-side syncing
      const onboardingData = {
        selectedCourse,
        motivation,
        experienceLevel,
        cefrLevel: placementResults?.level || null
      };
      
      document.cookie = `onboarding_data=${JSON.stringify(onboardingData)}; path=/; max-age=3600; SameSite=Lax`;
      document.cookie = "onboarding_completed=true; path=/; max-age=3600; SameSite=Lax";
      
      router.push("/sign-up");
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-white text-[#042c60]">
      <header className="flex items-center px-4 pt-4 pb-2 lg:max-w-5xl lg:mx-auto w-full gap-4">
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

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative lg:max-w-5xl lg:mx-auto w-full px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-full w-full flex flex-col items-center justify-center relative overflow-x-hidden pt-6 pb-28 sm:pb-32"
          >
            {step === 1 && <StepWelcome />}
            {step === 2 && <StepGetReady />}
            {step === 3 && <StepCourse courses={courses} />}
            {step === 4 && <StepMotivation />}
            {step === 5 && <StepLevel courseTitle={selectedCourseTitle} />}
            {step === 6 && <StepPlacement courseTitle={selectedCourseTitle} />}
            {step === 7 && <StepPlacementResult />}
            {step === 8 && <StepSignUp />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-gray-100 lg:max-w-5xl lg:mx-auto z-50">
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
