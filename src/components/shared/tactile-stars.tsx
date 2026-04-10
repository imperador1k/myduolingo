"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUISounds } from "@/hooks/use-ui-sounds";

type Props = {
    value: number;
    onChange: (val: number) => void;
    readonly?: boolean;
    size?: "md" | "lg" | "xl";
};

export const TactileStars = ({ value, onChange, readonly = false, size = "lg" }: Props) => {
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const [bouncingStar, setBouncingStar] = useState<number | null>(null);
    
    // Fallback if useUISounds is strictly tied to lessons, but let's assume playPop works globally
    const { playPop } = useUISounds(); 

    const activeValue = hoverValue !== null ? hoverValue : value;

    const handleHover = (index: number) => {
        if (readonly) return;
        setHoverValue(index);
    };

    const handleLeave = () => {
        if (readonly) return;
        setHoverValue(null);
    };

    const handleClick = (index: number) => {
        if (readonly) return;
        onChange(index);
        
        // Haptic feedback UI equivalent 
        try { if (navigator.vibrate) navigator.vibrate(50); } catch (e) {}
        
        try { playPop(); } catch (e) {} // Play little satisfying pop if available
        
        setBouncingStar(index);
        setTimeout(() => setBouncingStar(null), 300);
    };

    const sizeClasses = {
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    return (
        <div className="flex flex-row items-center justify-center gap-2" onMouseLeave={handleLeave}>
            {[1, 2, 3, 4, 5].map((index) => {
                const isActive = index <= activeValue;
                const isBouncing = index === bouncingStar;
                
                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleHover(index)}
                        onPointerDown={() => handleClick(index)} // Fast mobile response
                        disabled={readonly}
                        className={cn(
                            "relative outline-none transition-all duration-200 tap-highlight-transparent cursor-pointer",
                            readonly && "cursor-default",
                            isActive ? "scale-110" : "scale-100 opacity-60 hover:opacity-100",
                            isBouncing && "animate-bounce"
                        )}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        aria-label={`Rate ${index} stars`}
                    >
                        <Star 
                            className={cn(
                                sizeClasses[size],
                                "transition-colors duration-200 drop-shadow-sm",
                                isActive ? "fill-[#FFC800] text-[#FFC800] drop-shadow-md" : "fill-stone-200 text-stone-200"
                            )} 
                        />
                        
                        {/* Glow effect for active stars behind them */}
                        {isActive && !readonly && (
                            <div className="absolute inset-0 bg-[#FFC800] rounded-full blur-xl opacity-20 -z-10 mix-blend-multiply" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};
