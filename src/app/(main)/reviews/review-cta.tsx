"use client";

import { useReviewModal } from "@/store/use-review-modal-store";
import { Star } from "lucide-react";

export const ReviewCTA = () => {
    const { open } = useReviewModal();

    return (
        <button 
            onClick={open}
            className="mt-4 bg-[#FFC800] text-yellow-900 border-2 border-yellow-400 border-b-6 active:translate-y-1 active:border-b-0 hover:bg-[#ffdb4d] rounded-2xl px-6 py-4 font-black uppercase tracking-wider flex items-center gap-3 transition-all"
        >
            <Star className="w-5 h-5 fill-yellow-900" /> 
            AVALIAR A APP
        </button>
    );
};
