import { create } from "zustand";

type HeartsModalState = {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
};

export const useHeartsModalStore = create<HeartsModalState>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
}));
