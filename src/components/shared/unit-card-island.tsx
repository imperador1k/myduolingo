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
    
    return (
        <div className={cn(
            "rounded-[32px] p-6 w-full max-w-[550px] min-h-[320px] pb-12 sm:pb-20 relative z-10 bg-white border-2 border-slate-100 shadow-xl border-b-[6px] flex flex-col mb-2 lg:mb-10",
            align === 'right' ? 'lg:self-end' : 'lg:self-start',
            isLockedUnit ? "opacity-75 grayscale-[0.8]" : "border-b-slate-200"
        )}>
            
            {/* Overlay for fully locked future units */}
            {isLockedUnit && (
                <div className="absolute inset-0 bg-slate-50/50 rounded-[32px] z-20 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-slate-100 mb-8 hover:scale-110 transition-transform">
                        <Lock className="text-slate-400 w-8 h-8" fill="currentColor" />
                    </div>
                </div>
            )}
            
            {/* Header Section */}
            <div className="flex justify-between items-start relative z-10">
                <div className="z-10 mt-1 max-w-[65%]">
                    <h2 className="text-sm font-black text-slate-400 mb-1 tracking-widest uppercase">
                        UNIDADE {unitIndex + 1}
                    </h2>
                    <h3 className="text-xl sm:text-2xl font-black leading-tight text-slate-700">
                        {title}
                    </h3>
                    <p className="text-slate-500 font-medium text-xs mt-1 hidden sm:block truncate">{description}</p>
                </div>

                {/* Illustrations (Only on Active or Completed) */}
                {!isLockedUnit && (
                    <div className="absolute right-0 top-[-30px] w-32 sm:w-48 h-28 flex items-end justify-end pointer-events-none z-0 overflow-visible">
                        {align === 'left' ? (
                            /* City Buildings Motif */
                            <div className="absolute bottom-2 right-4 flex items-end space-x-1.5 opacity-90">
                                <div className="w-4 h-12 bg-sky-200 rounded-t-sm shadow-inner hidden sm:block"></div>
                                <div className="w-5 h-20 bg-indigo-300 rounded-t-sm shadow-inner"></div>
                                <div className="w-4 h-14 bg-sky-400 rounded-t-sm shadow-inner"></div>
                                <div className="w-6 h-28 bg-indigo-400 rounded-t-sm shadow-inner shadow-indigo-600/20"></div>
                            </div>
                        ) : (
                            /* Cat illustration */
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[#ffe8cd] rounded-full mb-2 mr-2 border-4 border-white shadow-lg z-10 flex items-center justify-center transform rotate-12">
                                <Cat className="text-[#f59e0b] w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm" fill="currentColor" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Path Section */}
            <div className="relative w-full flex-1 mt-10 sm:mt-12 min-h-[140px]">
                {/* Winding Connecting SVG Line */}
                <svg className="absolute inset-x-0 w-[110%] sm:w-full h-[120%] z-0 top-[-10%] left-[-5%] sm:left-0" preserveAspectRatio="none" viewBox="0 0 500 120">
                    <path
                        d="M 40,50 C 130,120 180,120 250,70 C 320,20 400,10 460,60"
                        fill="none"
                        stroke={isLockedUnit ? "#e2e8f0" : isCompleted ? "#58cc02" : "#5ce1e6"}
                        strokeLinecap="round"
                        strokeWidth="12"
                        className={!isLockedUnit && !isCompleted ? "glowing-path" : ""}
                        style={!isLockedUnit && !isCompleted ? { filter: 'drop-shadow(0 0 8px rgba(92, 225, 230, 0.6))' } : {}}
                    />
                    <path
                        className="opacity-80"
                        d="M 40,50 C 130,120 180,120 250,70 C 320,20 400,10 460,60"
                        fill="none"
                        stroke={isLockedUnit ? "#f8fafc" : "#ffffff"}
                        strokeLinecap="round"
                        strokeWidth="4"
                    />
                </svg>

                {/* Nodes Array Mapping */}
                {lessons.slice(0, 5).map((lesson, idx) => {
                    const pos = NODE_POSITIONS[idx % NODE_POSITIONS.length];
                    const IconComponent = ICONS[idx % ICONS.length];

                    if (lesson.isCurrent) {
                        return (
                            <div key={lesson.id} className="absolute z-10" style={pos}>
                                {/* XP Bubble */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-700 px-3 py-1 rounded-[16px] text-sm font-bold shadow-md whitespace-nowrap flex items-center gap-1 z-20 animate-bounce border-2 border-slate-100">
                                    <Leaf className="text-[#58cc02] w-4 h-4" fill="currentColor" /> +10
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-slate-100"></div>
                                </div>

                                {/* Current Node Popup */}
                                <div 
                                    className="w-[60px] h-[60px] rounded-full bg-[#58cc02] shadow-[0_6px_0_#4da918] flex items-center justify-center relative cursor-pointer group ring-4 ring-white/30 hover:scale-105 transition-transform z-10"
                                    onClick={() => {
                                        if (noHearts) {
                                            window.location.href = "/shop";
                                        } else {
                                            onLessonClick({
                                                id: lesson.id,
                                                title: lesson.title,
                                                unitTitle,
                                                challengeCount: lesson.challenges?.length || 0,
                                                completedCount: lesson.challenges?.filter(c => c.challengeProgress?.some(p => p.completed)).length || 0,
                                                xpReward: (lesson.challenges?.length || 0) * 10
                                            });
                                        }
                                    }}
                                >
                                    <IconComponent className="text-white w-7 h-7 sm:w-8 sm:h-8 group-hover:drop-shadow-md transition-all relative z-10" fill="currentColor" />

                                    {/* Floating Leaf/Icon */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                                        <Crown className="w-8 h-8 text-yellow-500 fill-yellow-400 drop-shadow-md" />
                                    </div>

                                    {/* Start Button Tooltip */}
                                    {!noHearts && (
                                        <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-white text-[#1cb0f6] font-extrabold uppercase tracking-wide px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-lg border-2 border-slate-100 whitespace-nowrap z-20 hover:bg-sky-50 transition-all text-xs sm:text-sm">
                                            COMEÇAR
                                            <div className="absolute top-1/2 -left-[7px] -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-slate-100"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    if (lesson.completed) {
                        return (
                            <div 
                                key={lesson.id}
                                className="absolute z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-400 shadow-[0_4px_0_#d97706] flex items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors ring-4 ring-amber-100"
                                style={pos}
                                onClick={() => {
                                    if (noHearts) {
                                        window.location.href = "/shop";
                                    } else {
                                        onLessonClick({
                                            id: lesson.id,
                                            title: lesson.title,
                                            unitTitle,
                                            challengeCount: lesson.challenges?.length || 0,
                                            completedCount: lesson.challenges?.filter(c => c.challengeProgress?.some(p => p.completed)).length || 0,
                                            xpReward: (lesson.challenges?.length || 0) * 10
                                        });
                                    }
                                }}
                            >
                                <Check className="text-white w-5 h-5 sm:w-6 sm:h-6" strokeWidth={5} />
                            </div>
                        );
                    }

                    return (
                        <div
                            key={lesson.id}
                            className="absolute z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-200 shadow-[0_4px_0_#cbd5e1] flex items-center justify-center opacity-80 cursor-not-allowed ring-4 ring-slate-50"
                            style={pos}
                        >
                            <IconComponent className="text-slate-400 w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
