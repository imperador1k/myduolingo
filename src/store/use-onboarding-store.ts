import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface OnboardingState {
  step: number;
  selectedCourse: number | null;
  motivation: string | null;
  experienceLevel: "novato" | "experiente" | null;
  isOnboardingComplete: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCourse: (course: number) => void;
  setMotivation: (motivation: string) => void;
  setExperienceLevel: (level: "novato" | "experiente") => void;
  completeOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      selectedCourse: null,
      motivation: null,
      experienceLevel: null,
      isOnboardingComplete: false,
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: state.step > 1 ? state.step - 1 : 1 })),
      setCourse: (course) => set({ selectedCourse: course }),
      setMotivation: (motivation) => set({ motivation }),
      setExperienceLevel: (level) => set({ experienceLevel: level }),
      completeOnboarding: () => set({ isOnboardingComplete: true }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
