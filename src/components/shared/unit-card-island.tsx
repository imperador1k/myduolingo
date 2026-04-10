import { Cat, Mic, Pencil, Book, Leaf, Check, Lock, Star, Crown, Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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

    // Define Soft Solid Backgrounds & Text Colors purely for modern flat UI
    const THEMES = [
        { bg: '#ddf4ff', text: '#1899d6', dark: '#147bb0', trail: '#a3dffd' }, // Sky Blue
        { bg: '#f0f8e2', text: '#58cc02', dark: '#46a302', trail: '#c7ebb1' }, // Green
        { bg: '#ffecf0', text: '#ff4b4b', dark: '#ea2b2b', trail: '#ffc1cc' }, // Pink/Red
        { bg: '#fff0d4', text: '#ff9600', dark: '#d67b00', trail: '#ffe0a3' }, // Orange/Gold
        { bg: '#eeecff', text: '#ce82ff', dark: '#a547d9', trail: '#dcb8ff' }, // Purple
    ];
    
    const theme = THEMES[unitIndex % THEMES.length];

    // Dynamic S-Curve calculation for absolute node positioning
    const calculateNodePosition = (index: number, total: number) => {
        const percentY = total <= 1 ? 0.5 : (index / (total - 1));
        // index 0 = top (10%), index max = bottom (90%)
        const topPercent = percentY * 80 + 10;
        
        // Sine wave for the winding path.
        const leftPercent = 50 + Math.sin(index * 0.8) * 20; // 20% swing from center
        
        return {
            left: `${leftPercent}%`,
            top: `${topPercent}%`
        };
    };

    // Calculate dynamic container height based on total nodes to ensure they don't overlap
    // Added +100 to base height to accommodate the COMEÇAR bubble on the first node
    const containerHeight = Math.max(lessons.length * 150 + 100, 450);

    return (
        <div className="w-full relative flex flex-col items-center mb-8">
            {/* The Vibrant Banner */}
            <div 
                className={cn(
                    "relative z-10 w-full flex flex-col p-6 text-left",
                    isLockedUnit 
                        ? "bg-stone-200 border-2 border-stone-300 border-b-8 rounded-3xl opacity-80" 
                        : "bg-gradient-to-b from-[#58CC02] to-[#4eb801] border-2 border-[#46a302] border-b-8 rounded-t-3xl",
                    align === 'right' ? "items-end text-right" : "items-start text-left"
                )}
            >
                <div className="flex items-center gap-3 mb-2">
                    <span 
                        className={cn(
                            "font-bold tracking-widest text-sm uppercase mb-2",
                            isLockedUnit ? "text-stone-400" : "text-white/80"
                        )}
                    >
                        Capítulo {unitIndex + 1}
                    </span>
                </div>
                <h3 
                    className={cn(
                        "font-black leading-tight max-w-[80%]",
                        isLockedUnit ? "text-stone-500 text-xl md:text-2xl" : "text-white text-2xl md:text-3xl drop-shadow-sm"
                    )}
                >
                    {title}
                </h3>
            </div>

            {/* The Path Container */}
            <div 
                className={cn(
                    "relative mx-auto flex flex-col items-center w-full",
                    !isLockedUnit ? "bg-white border-x-2 border-b-2 border-[#e5e7eb] rounded-b-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] pb-10" : "pb-10"
                )}
                style={{
                    minHeight: `${containerHeight}px`,
                }}
            >
                {/* The Recessed Track (Line) */}
                <div className="absolute inset-0 pointer-events-none flex justify-center z-0">
                    <div 
                        className="h-full w-0 border-l-[8px] border-dashed transition-colors duration-1000"
                        style={{ borderColor: `${theme.dark}30` }}
                    />
                    
                    {/* Living Energy Path (Animated SVG) */}
                    <svg className="absolute inset-0 w-full h-full opacity-40">
                        <defs>
                            <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={theme.text} stopOpacity="0" />
                                <stop offset="50%" stopColor={theme.text} stopOpacity="1" />
                                <stop offset="100%" stopColor={theme.text} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <motion.rect 
                            width="4" 
                            height="100%" 
                            x="50%" 
                            className="-translate-x-[2px]"
                            fill="url(#energyGradient)"
                            animate={{ y: ["-100%", "100%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </div>

                {/* Interactive Nodes Overlay (z-10) */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    
                    {/* Overlay Lock for whole island if needed */}
                    {isLockedUnit && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10">
                             <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl border-4 border-white/50 flex flex-col items-center justify-center -translate-y-12">
                                <Lock className="w-12 h-12 text-slate-400 opacity-80" />
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
                                className="absolute z-20 pointer-events-auto animate-in fade-in zoom-in duration-500 delay-100"
                                style={{
                                    left: pos.left, top: pos.top,
                                    transform: "translate(-50%, -50%)", 
                                }}
                            >
                                {/* Current Active Node */}
                                {lesson.isCurrent && (
                                    <div className="relative group cursor-pointer z-40 flex flex-col items-center justify-center">
                                        
                                        {/* Living Pulsing Rings */}
                                        <div className="absolute inset-0 flex items-center justify-center -z-10">
                                            {[1, 2, 3].map((i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ opacity: 0.5, scale: 0.8 }}
                                                    animate={{ opacity: 0, scale: 1.8 + i * 0.2 }}
                                                    transition={{ 
                                                        duration: 3, 
                                                        repeat: Infinity, 
                                                        delay: i * 0.8,
                                                        ease: "easeOut"
                                                    }}
                                                    className="absolute w-[80px] h-[80px] rounded-full border-2 border-yellow-400"
                                                />
                                            ))}
                                        </div>
                                        
                                        {/* Massive COMEÇAR Directional Bubble */}
                                        <div className="absolute -top-[72px] left-1/2 -translate-x-1/2 flex flex-col items-center z-40 mb-4">
                                            {!noHearts && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    animate={{ 
                                                        opacity: 1, 
                                                        y: [0, -5, 0], 
                                                        scale: 1 
                                                    }}
                                                    transition={{
                                                        y: {
                                                            repeat: Infinity,
                                                            duration: 2,
                                                            ease: "easeInOut"
                                                        },
                                                        opacity: { duration: 0.5 },
                                                        scale: { duration: 0.5 }
                                                    }}
                                                    whileHover={{ scale: 1.08, y: -8 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="relative cursor-pointer shadow-[0_10px_25px_rgba(88,204,2,0.3)] rounded-2xl"
                                                    onClick={() => onLessonClick({
                                                        id: lesson.id, title: lesson.title, unitTitle,
                                                        challengeCount: lesson.challenges?.length || 0,
                                                        completedCount: lesson.challenges?.filter(c => c.challengeProgress?.some(p => p.completed)).length || 0,
                                                        xpReward: (lesson.challenges?.length || 0) * 10
                                                    })}
                                                >
                                                    <div className="bg-gradient-to-b from-[#58CC02] to-[#4eb801] text-white font-black uppercase text-base px-8 py-3.5 rounded-2xl border-2 border-white/20 border-b-[6px] border-b-[#46a302] active:border-b-0 transition-all whitespace-nowrap flex items-center gap-2 relative overflow-hidden group/btn">
                                                        <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">Começar</span>
                                                        <motion.div
                                                            animate={{ 
                                                                rotate: [0, 10, -10, 0],
                                                                scale: [1, 1.2, 1]
                                                            }}
                                                            transition={{ repeat: Infinity, duration: 2 }}
                                                        >
                                                            <Zap className="w-5 h-5 fill-yellow-300 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" />
                                                        </motion.div>
                                                        
                                                        {/* Shine effect */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                                                    </div>
                                                    {/* CSS Triangle Tail */}
                                                    <div className="absolute -bottom-[12px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[12px] border-x-transparent border-t-[12px] border-t-[#46a302]"></div>
                                                    <div className="absolute -bottom-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[10px] border-x-transparent border-t-[10px] border-t-[#4eb801]"></div>
                                                </motion.div>
                                            )}
                                        </div>
                                        
                                        {/* Physical Active Node Button - Golden Jewel */}
                                        <div 
                                            onClick={() => !noHearts && onLessonClick({
                                                id: lesson.id, title: lesson.title, unitTitle,
                                                challengeCount: lesson.challenges?.length || 0,
                                                completedCount: lesson.challenges?.filter(c => c.challengeProgress?.some(p => p.completed)).length || 0,
                                                xpReward: (lesson.challenges?.length || 0) * 10
                                            })}
                                            className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] bg-yellow-400 rounded-full border-4 border-yellow-500 border-b-[10px] border-b-yellow-600 shadow-[0_10px_20px_rgba(250,204,21,0.5)] ring-4 ring-yellow-400/50 flex flex-col items-center justify-center hover:-translate-y-2 hover:scale-105 active:scale-95 active:translate-y-2 active:border-b-[4px] transition-all relative z-20 mx-auto"
                                        >
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative z-10">
                                                <IconComponent className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-sm" strokeWidth={3} fill="currentColor" />
                                            </div>
                                        </div>

                                        {/* Bottom Accessory Stack (Centered below the node) */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center mt-3 pointer-events-none">
                                            {/* Active Node XP Floating Text */}
                                            <div className="opacity-100 group-hover:translate-y-1 transition-transform z-30 pointer-events-auto">
                                                <div 
                                                    className="bg-white px-3 py-1.5 rounded-2xl text-[11px] font-black tracking-widest uppercase shadow-md flex items-center gap-1.5 border-2 border-stone-200 whitespace-nowrap cursor-default"
                                                    style={{ color: theme.text }}
                                                >
                                                    <Leaf className="w-3.5 h-3.5" fill="currentColor" style={{ color: theme.text }} /> +10 XP
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Completed Node - Fully pressed down */}
                                {lesson.completed && !lesson.isCurrent && (
                                    <div className="relative group cursor-pointer z-20 flex flex-col items-center">
                                        <div 
                                            onClick={() => !noHearts && onLessonClick({
                                                id: lesson.id, title: lesson.title, unitTitle,
                                                challengeCount: lesson.challenges?.length || 0,
                                                completedCount: lesson.challenges?.filter(c => c.challengeProgress?.some(p => p.completed)).length || 0,
                                                xpReward: (lesson.challenges?.length || 0) * 10
                                            })}
                                            className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-full border-4 border-b-2 shadow-sm flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all"
                                            style={{ backgroundColor: theme.text, borderColor: theme.dark }}
                                        >
                                            <Check className="text-white w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm" strokeWidth={5} />
                                        </div>
                                    </div>
                                )}

                                {/* Locked Node - Polished Stone */}
                                {lesson.isLocked && !isLockedUnit && !lesson.isCurrent && !lesson.completed && (
                                    <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] bg-stone-200 rounded-full border-4 border-white shadow-sm border-b-[6px] border-b-stone-300 flex flex-col items-center justify-center cursor-not-allowed">
                                        <IconComponent className="text-stone-400 w-6 h-6 sm:w-8 sm:h-8 drop-shadow-sm" strokeWidth={3} fill="currentColor" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}