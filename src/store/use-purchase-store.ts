import { create } from "zustand";

type PurchasePopup = {
    icon: string;
    title: string;
    description: string;
    color: string;
};

type PurchaseStore = {
    isOpen: boolean;
    data: PurchasePopup | null;
    open: (data: PurchasePopup) => void;
    close: () => void;
};

export const usePurchaseStore = create<PurchaseStore>((set) => ({
    isOpen: false,
    data: null,
    open: (data) => set({ isOpen: true, data }),
    close: () => set({ isOpen: false, data: null }),
}));
