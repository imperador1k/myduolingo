import { create } from "zustand";

type ProModalState = {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
};

export const useProModalStore = create<ProModalState>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
}));
