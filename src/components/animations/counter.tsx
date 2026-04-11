"use client";

import { useEffect, useState } from "react";

interface CounterProps {
    value: number;
    duration?: number;
    suffix?: string;
    className?: string;
}

export const Counter = ({ value, duration = 2000, suffix = "", className = "" }: CounterProps) => {
    const [mounted, setMounted] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        const totalFrames = Math.round(duration / 16);
        const increment = end / totalFrames;
        
        let currentFrame = 0;
        const timer = setInterval(() => {
            currentFrame++;
            const progress = currentFrame / totalFrames;
            // Ease out quad formula
            const easedProgress = progress * (2 - progress);
            const nextCount = Math.round(end * easedProgress);
            
            setCount(nextCount);

            if (currentFrame === totalFrames) {
                clearInterval(timer);
                setCount(end);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, duration]);

    return (
        <span className={className}>
            {mounted ? `${count.toLocaleString('pt-PT')}${suffix}` : ""}
        </span>
    );
};
