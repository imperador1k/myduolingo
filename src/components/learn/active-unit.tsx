import { Cat, Mic, Pencil, Book, Leaf, Star, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import Link from 'next/link';

interface Lesson {
    id: number;
    title: string;
    completed: boolean;
    isCurrent: boolean;
    isLocked: boolean;
}

interface ActiveUnitProps {
    unitIndex: number;
    title: string;
    description: string;
    lessons: Lesson[];
}

// Map fixed percentage positions that align with the custom SVG path winding
const NODE_POSITIONS = [
    { left: "8%", top: "25%" },
    { left: "33%", top: "65%" },
    { left: "58%", top: "25%" },
    { right: "8%", top: "15%" }, // 4th forms the peak
    { right: "15%", top: "80%" }, // 5th just in case
];

const ICONS = [Mic, Pencil, Book, Star];

export function ActiveUnit({ unitIndex, title, description, lessons }: ActiveUnitProps) {
    return (
        <div className="rounded-[24px] p-6 w-full max-w-[600px] h-auto sm:h-[250px] relative z-10 text-white mt-10 bg-[#58cc02] shadow-[0_12px_0_#4da918] flex flex-col mb-12">
            
            {/* Header Section */}
            <div className="flex justify-between items-start relative z-10">
                <div className="z-10 mt-2">
                    <h2 className="text-xl font-bold opacity-90 mb-1 tracking-wide uppercase text-white">
                        UNIDADE {unitIndex + 1}:
                    </h2>
                    <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white drop-shadow-md max-w-[200px] sm:max-w-[300px]">
                        {title}
                    </h3>
                    <p className="text-white/80 font-medium text-sm mt-1">{description}</p>
                </div>

                {/* Illustrations */}
                <div className="absolute right-0 top-[-40px] w-48 sm:w-64 h-36 items-end justify-end pointer-events-none z-0 overflow-visible hidden sm:flex">
                    {/* City Buildings Motif */}
                    <div className="absolute bottom-2 right-12 flex items-end space-x-1.5 opacity-90">
                        <div className="w-5 h-16 bg-[#61df02] rounded-t-sm shadow-inner"></div>
                        <div className="w-7 h-24 bg-[#76e524] rounded-t-sm shadow-inner"></div>
                        <div className="w-6 h-14 bg-[#4da918] rounded-t-sm shadow-inner"></div>
                        <div className="w-9 h-32 bg-[#61df02] rounded-t-sm shadow-inner"></div>
                        <div className="w-5 h-20 bg-[#76e524] rounded-t-sm shadow-inner"></div>
                    </div>
                    {/* Cat illustration */}
                    <div className="relative w-20 h-20 bg-[#ffe8cd] rounded-full mb-0 mr-0 border-4 border-white/20 shadow-lg z-10 flex items-center justify-center">
                        <Cat className="text-[#f59e0b] w-10 h-10 drop-shadow-sm" fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Path Section */}
            <div className="relative w-full flex-1 mt-12 sm:mt-6 min-h-[140px]">
                {/* Winding Connecting SVG Line */}
                <svg className="absolute inset-x-0 w-[110%] sm:w-full h-full glowing-path z-0 top-0 left-[-5%] sm:left-0" preserveAspectRatio="none" viewBox="0 0 500 120">
                    <path
                        d="M 40,50 C 130,120 180,120 250,70 C 320,20 400,10 460,60"
                        fill="none"
                        stroke="#5ce1e6"
                        strokeLinecap="round"
                        strokeWidth="12"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(92, 225, 230, 0.6))' }}
                    />
                    <path
                        className="opacity-80"
                        d="M 40,50 C 130,120 180,120 250,70 C 320,20 400,10 460,60"
                        fill="none"
                        stroke="#ffffff"
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
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-gray-700 px-3 py-1 rounded-[16px] text-sm font-bold shadow-md whitespace-nowrap flex items-center gap-1 z-20 animate-bounce">
                                    <Leaf className="text-[#58cc02] w-4 h-4" fill="currentColor" /> +10
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-white"></div>
                                </div>

                                {/* Current Node Popup */}
                                <Link href={`/lesson/${lesson.id}`}>
                                    <div className="w-[60px] h-[60px] rounded-full bg-white shadow-[0_4px_0_#e5e5e5] flex items-center justify-center relative cursor-pointer group ring-4 ring-white/30 hover:scale-105 transition-transform">
                                        <IconComponent className="text-[#cecece] w-8 h-8 group-hover:text-gray-400 transition-colors" fill="currentColor" />

                                        {/* Start Button Tooltip */}
                                        <div className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-white text-[#1cb0f6] font-extrabold uppercase tracking-wide px-6 py-2 sm:px-8 sm:py-3 rounded-2xl shadow-[0_4px_0_#e5e5e5] whitespace-nowrap z-20 hover:bg-gray-50 hover:-translate-y-0.5 transition-all text-sm sm:text-lg">
                                            COMEÇAR
                                            <div className="absolute top-1/2 -left-[8px] -translate-y-1/2 w-0 h-0 border-y-[8px] border-y-transparent border-r-[8px] border-r-white"></div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    }

                    if (lesson.completed) {
                        return (
                            <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                                <div
                                    className="absolute z-10 w-14 h-14 rounded-full bg-[#58cc02] shadow-[0_4px_0_#4da918] flex items-center justify-center cursor-pointer hover:bg-[#61df02] transition-colors"
                                    style={pos}
                                >
                                    <Check className="text-white w-6 h-6" strokeWidth={4} />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <div
                            key={lesson.id}
                            className="absolute z-10 w-14 h-14 rounded-full bg-[#cecece] shadow-[0_4px_0_#b3b3b3] flex items-center justify-center opacity-50 cursor-not-allowed"
                            style={pos}
                        >
                            <IconComponent className="text-white w-6 h-6" fill="currentColor" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
