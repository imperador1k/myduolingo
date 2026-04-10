import { create } from "zustand";

type ReviewModalState = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
};

export const useReviewModal = create<ReviewModalState>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));
