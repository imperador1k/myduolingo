import { create } from "zustand";

type ShareModalState = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useShareModalStore = create<ShareModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
