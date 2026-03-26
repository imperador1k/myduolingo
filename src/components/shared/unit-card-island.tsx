import { Cat, Mic, Pencil, Book, Leaf, Check, Lock, Star, Crown } from 'lucide-react';
import { cn } from "@/lib/utils";
import Link from 'next/link';

interface Challenge {
    id: number;
    challengeProgress?: { completed: boolean }[];
}

interface Lesson {
    id: number;
    title: string;
    completed: boolean;
    isCurrent: boolean;
    isLocked: boolean;
    challenges?: Challenge[];
}

interface LessonInfo {
    id: number;
    title: string;
    unitTitle: string;
    challengeCount: number;
    completedCount: number;
    xpReward: number;
}

interface UnitCardIslandProps {
    unitIndex: number;
    unitTitle: string;
    title: string;
    description: string;
    lessons: Lesson[];
    isActive: boolean;
    isCompleted: boolean;
    align: 'left' | 'right';
    noHearts: boolean;
    onLessonClick: (lessonInfo: LessonInfo) => void;
}

const NODE_POSITIONS = [
    { left: "8%", top: "25%" },
    { left: "33%", top: "65%" },
    { left: "58%", top: "25%" },
    { right: "8%", top: "15%" },
    { right: "15%", top: "80%" },
];

const ICONS = [Mic, Pencil, Book, Star];

export function UnitCardIsland({ 
    unitIndex, unitTitle, title, description, lessons, 
    isActive, isCompleted, align, noHearts, onLessonClick 
}: UnitCardIslandProps) {
    const isLockedUnit = !isActive && !isCompleted;

    // Deterministic random background loop for when no background image is provided
    const fallbackImages = ['/images/island-1.webp', '/images/island-2.webp', '/images/island-3.webp'];
    const bgImage = fallbackImages[unitIndex % fallbackImages.length];

    // Dynamic S-Curve calculation for absolute node positioning
    // 0 is bottom, 1 is top. We want the start lesson at the top or bottom?
    // Duolingo usually starts at the TOP of the island and goes down? 
    // Wait, the path on Duolingo goes from bottom to top... actually they scroll UP. The newest lesson is at the top of the path, or bottom?
    // Let's stick to the prompt's `bottom` math.
    const calculateNodePosition = (index: number, total: number) => {
        // Safe division handle for single lesson
        const percentY = total <= 1 ? 0.5 : (index / (total - 1));
        // index 0 = top (10%), index max = bottom (90%)
        const topPercent = percentY * 80 + 10;
        
        // Sine wave for the winding path. Multiplier determines path frequency.
        // We use Math.sin to swing left and right organically.
        const leftPercent = 50 + Math.sin(index * 0.8) * 20; // 20% swing from center (30% to 70%)
        
        return {
            left: `${leftPercent}%`,
            top: `${topPercent}%`
        };
    };

    // Calculate dynamic container height based on total nodes to ensure they don't overlap
    const containerHeight = Math.max(lessons.length * 140, 500);

    return (
        <div className="w-full relative flex flex-col items-center">
            
            {/* Header: Title Block */}
            <div className={cn(
                "w-full max-w-[650px] mb-6 sm:mb-8",
                align === 'right' ? "text-right" : "text-left"
            )}>
                <div className="inline-block bg-white/90 backdrop-blur-md px-6 py-4 rounded-[2rem] border-2 border-slate-200 border-b-8 shadow-sm">
                    <h2 className="text-xs font-black text-slate-400 mb-1 tracking-[0.2em] uppercase">
                        Capítulo {unitIndex + 1}
                    </h2>
                    <h3 className="text-xl sm:text-2xl font-black leading-tight text-slate-700">
                        {title}
                    </h3>
                </div>
            </div>

            {/* The Background Image District Container */}
            <div 
                className={cn(
                    "relative w-full max-w-[800px] mx-auto",
                    isLockedUnit ? "opacity-90 grayscale" : ""
                )}
                style={{
                    minHeight: `${containerHeight}px`,
                }}
            >
                {/* 3D Island Base Wrapper (z-0) */}
                <div className="absolute inset-0 rounded-[3rem] sm:rounded-[5rem] overflow-hidden bg-white/50 border-4 border-slate-200 border-b-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] z-0">
                    <img 
                        src={bgImage} 
                        alt={`Island for ${title}`} 
                        className="w-full h-full object-cover select-none pointer-events-none" 
                    onError={(e) => {
                        // Fallback if user hasn't added images yet
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM1OGNjMDIiIHJ4PSI1cmVtIi8+PC9zdmc+'; // A green rounded fallback rect
                    }}
                />
                </div>

                {/* Interactive Nodes Overlay (z-10) */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    
                    {/* Overlay Lock for whole island if needed */}
                    {isLockedUnit && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10">
                             <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-slate-100 flex flex-col items-center justify-center -translate-y-12">
                                <Lock className="w-12 h-12 text-slate-300" />
                             </div>
                        </div>
                    )}

                    {/* Procedural Dynamic Lesson Nodes */}
                    {lessons.map((lesson, idx) => {
                        const pos = calculateNodePosition(idx, lessons.length);
                        const IconComponent = ICONS[idx % ICONS.length];

                        return (
                            <div 
                                key={lesson.id}
                                className="absolute z-20 pointer-events-auto"
                                style={{
                                    left: pos.left, top: pos.top,
                                    transform: "translate(-50%, -50%)", // perfectly center over top/left coordinate
                                }}
                            >
                                {/* Current Active Node */}
                            {lesson.isCurrent && (
                                <div className="relative group cursor-pointer z-40 flex flex-col items-center justify-center">
                                    
                                    {/* Accessory Stack (Centered above the node) */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col items-center mb-2 pointer-events-none">
                                        
                                        {/* Massive COMEÇAR Directional Bubble */}
                                        {!noHearts && (
                                            <div className="relative flex bg-white text-sky-500 font-black text-sm uppercase tracking-[0.15em] px-6 py-4 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.15)] border-2 border-slate-200 transition-transform hover:scale-105 active:scale-95 animate-bounce z-50 whitespace-nowrap mb-6 pointer-events-auto cursor-pointer">
                                                COMEÇAR
                                                {/* Pointer Tail */}
                                                <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[10px] border-x-transparent border-t-[10px] border-t-slate-200"></div>
                                                <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-t-[8px] border-t-white"></div>
                                            </div>
                                        )}

                                        {/* Golden Crown */}
                                        <div className="z-40 -mb-6">
                                             <Crown className="w-9 h-9 text-amber-400 fill-amber-300 drop-shadow-md" strokeWidth={2} />
                                        </div>
                                    </div>
                                    
                                    {/* Physical Active Node Button */}
                                    <div 
                                        onClick={() => !noHearts && onLessonClick({
                                            id: lesson.id, title: lesson.title, unitTitle,
                                            challengeCount: lesson.challenges?.length || 0,
                                            completedCount: lesson.challenges?.filter(c => c.challengeProgress?.some(p => p.completed)).length || 0,
                                            xpReward: (lesson.challenges?.length || 0) * 10
                                        })}
                                        className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] bg-white rounded-full border-2 border-emerald-300 border-b-[12px] shadow-[0_15px_20px_-5px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center hover:-translate-y-2 hover:scale-105 active:scale-95 active:translate-y-2 active:border-b-[4px] transition-all bg-gradient-to-b from-white to-emerald-50 relative z-20 mx-auto"
                                    >
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shadow-inner">
                                            <IconComponent className="text-emerald-500 w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* Bottom Accessory Stack (Centered below the node) */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center mt-3 pointer-events-none">
                                        {/* Active Node XP Floating Text */}
                                        <div className="opacity-100 group-hover:translate-y-1 transition-transform z-30 pointer-events-auto">
                                            <div className="bg-white text-slate-700 px-3 py-1.5 rounded-2xl text-[11px] font-black tracking-widest uppercase shadow-md flex items-center gap-1.5 border-2 border-slate-200 whitespace-nowrap cursor-default">
                                                <Leaf className="text-emerald-500 w-3.5 h-3.5" fill="currentColor" /> +10 XP
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Completed Node */}
                            {lesson.completed && (
                                <div className="relative group cursor-pointer z-20 flex flex-col items-center">
                                    <div 
                                        onClick={() => !noHearts && onLessonClick({
                                            id: lesson.id, title: lesson.title, unitTitle,
                                            challengeCount: lesson.challenges?.length || 0,
                                            completedCount: lesson.challenges?.filter(c => c.challengeProgress?.some(p => p.completed)).length || 0,
                                            xpReward: (lesson.challenges?.length || 0) * 10
                                        })}
                                        className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] bg-amber-400 rounded-full border-2 border-amber-300 border-b-[8px] shadow-lg flex flex-col items-center justify-center hover:-translate-y-1 hover:scale-105 active:scale-95 active:translate-y-1 active:border-b-4 transition-all"
                                    >
                                        <Check className="text-white w-8 h-8 sm:w-10 sm:h-10" strokeWidth={5} />
                                    </div>
                                </div>
                            )}

                            {/* Locked Node */}
                            {lesson.isLocked && !isLockedUnit && (
                                <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] bg-slate-200 rounded-full border-2 border-slate-300 border-b-[8px] flex flex-col items-center justify-center opacity-90 cursor-not-allowed">
                                    <IconComponent className="text-slate-400 w-7 h-7 sm:w-9 sm:h-9" fill="currentColor" />
                                </div>
                            )}
                        </div>
                    );
                })}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes unsubtle_bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}} />
        </div>
    );
}
