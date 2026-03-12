"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type AILoadingScreenProps = {
    message?: string;
    submessage?: string;
};

export const AILoadingScreen = ({
    message = "A magia da IA está a acontecer...",
    submessage = "A criar o teu desafio personalizado",
}: AILoadingScreenProps) => {
    const [animationData, setAnimationData] = useState<object | null>(null);

    useEffect(() => {
        // Fetch broom animation for loading screen
        fetch("/broom.json")
            .then((res) => res.json())
            .then((data) => setAnimationData(data))
            .catch((err) => console.error("Failed to load Lottie animation:", err));
    }, []);

    return (
        <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
            <div className="relative h-48 w-48 drop-shadow-2xl">
                {animationData ? (
                    <Lottie
                        animationData={animationData}
                        loop
                        autoplay
                        style={{ width: "100%", height: "100%" }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 animate-pulse">
                        <span className="text-4xl">✨</span>
                    </div>
                )}
            </div>
            <div className="flex flex-col items-center space-y-2 text-center text-slate-700">
                <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-sky-500">
                    {message}
                </h3>
                <p className="font-medium text-slate-500">
                    {submessage}
                </p>
                <div className="flex items-center space-x-1 mt-4">
                    <span className="h-2.5 w-2.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2.5 w-2.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-bounce"></span>
                </div>
            </div>
        </div>
    );
};
