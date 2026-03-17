"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy-load lottie-react to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type LottieBlockProps = {
    className?: string;
    // Pass your own animation JSON, or fall back to the default bear dance
    animationData?: object;
};

export const LottieBlock = ({ className = "w-32 h-32 md:w-48 md:h-48 mx-auto", animationData }: LottieBlockProps) => {
    const [defaultAnimation, setDefaultAnimation] = useState<object | null>(null);

    useEffect(() => {
        // Only fetch if no custom animationData is provided
        if (!animationData) {
            fetch("/laughing_cat.json")
                .then((res) => res.json())
                .then((data) => setDefaultAnimation(data))
                .catch((err) => console.error("Failed to load Lottie animation:", err));
        }
    }, [animationData]);

    const dataToRender = animationData || defaultAnimation;

    if (!dataToRender) {
        // Optional: return a skeleton or empty div while loading
        return <div className={className} />;
    }

    return (
        <div className={className}>
            <Lottie
                animationData={dataToRender}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
};
