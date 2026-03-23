import { create } from "zustand";

type LessonInfo = {
    id: number;
    title: string;
    unitTitle: string;
    challengeCount: number;
    completedCount: number;
    xpReward: number;
};

type LessonModalState = {
    isOpen: boolean;
    lesson: LessonInfo | null;
    openModal: (lesson: LessonInfo) => void;
    closeModal: () => void;
};

export const useLessonModalStore = create<LessonModalState>((set) => ({
    isOpen: false,
    lesson: null,
    openModal: (lesson) => set({ isOpen: true, lesson }),
    closeModal: () => set({ isOpen: false, lesson: null }),
}));
