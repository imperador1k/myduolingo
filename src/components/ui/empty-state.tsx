"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Props = {
    title: string;
    description: string;
    imageSrc?: string;
    actionText: string;
    onAction: () => void;
};

export const EmptyState = ({
    title,
    description,
    imageSrc = "/mascot.svg",
    actionText,
    onAction
}: Props) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white border-2 border-stone-200 border-b-8 rounded-[2.5rem] shadow-sm max-w-2xl mx-auto my-8 animate-in fade-in zoom-in duration-300">
            <motion.div
                animate={{
                    y: [0, -20, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="relative w-48 h-48 mb-8"
            >
                <Image
                    src={imageSrc}
                    alt="Mascot"
                    fill
                    className="object-contain"
                />
            </motion.div>
            
            <h2 className="text-3xl font-black text-stone-700 mb-4 tracking-tight">
                {title}
            </h2>
            
            <p className="text-lg text-stone-500 font-bold mb-10 max-w-md mx-auto leading-relaxed">
                {description}
            </p>
            
            <Button
                size="lg"
                onClick={onAction}
                className="h-16 px-10 bg-[#58cc02] text-white text-xl font-black rounded-2xl border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:translate-y-2 transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-md w-full sm:w-auto"
            >
                {actionText}
            </Button>
        </div>
    );
};
