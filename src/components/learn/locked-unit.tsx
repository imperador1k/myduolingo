import { Lock, Globe, Mic, Book, Pencil, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Lesson {
    id: number;
    title: string;
    completed: boolean;
    isCurrent: boolean;
    isLocked: boolean;
}

interface LockedUnitProps {
    unitNumber: number;
    align: 'left' | 'right';
    iconType?: 'globe' | 'buildings' | 'default';
    title: string;
    lessons: Lesson[];
    isCompleted?: boolean;
}

const ICONS = [Mic, Book, Pencil];

export function LockedUnit({ unitNumber, align, iconType = 'default', title, lessons, isCompleted }: LockedUnitProps) {
    
    // Distribute completion styling
    const isUnitActive = !isCompleted && lessons.some(l => l.completed || l.isCurrent);
    
    // Even if it's the "LockedUnit" component visually, historically completed units exist above the active unit.
    // If it's a PAST unit, we make it green and unlocked. If it's a FUTURE unit, we make it gray and locked.
    const bgColor = isCompleted ? "bg-[#58cc02]" : "bg-[#e5e5e5]";
    const shadowColor = isCompleted ? "#4da918" : "#b1b5b9";
    const headerColor = isCompleted ? "text-white/80" : "text-gray-400";
    const titleColor = isCompleted ? "text-white" : "text-gray-500";
    const nodeBgColor = isCompleted ? "bg-[#58cc02] shadow-[0_4px_0_#4da918]" : "bg-[#cecece] shadow-[0_4px_0_#b3b3b3]";
    
    return (
        <div className={`rounded-[24px] p-6 w-full max-w-[450px] h-auto sm:h-[180px] relative z-10 ${bgColor} shadow-[0_10px_0_${shadowColor}] ${align === 'right' ? 'sm:self-end' : 'sm:self-start'} mb-8`}>
            
            {/* Overlay for locked state (only if strictly future unit) */}
            {!isCompleted && !isUnitActive && (
                <div className="absolute inset-0 bg-white/20 rounded-[32px] z-20 flex items-center justify-center">
                    <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center shadow-inner border-4 border-white mb-8">
                        <Lock className="text-gray-400 w-8 h-8" fill="currentColor" />
                    </div>
                </div>
            )}
            
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h2 className={`text-sm sm:text-lg font-bold ${headerColor} uppercase tracking-wide`}>
                        UNIDADE {unitNumber}
                    </h2>
                    <p className={`font-black text-lg sm:text-xl truncate max-w-[200px] ${titleColor}`}>
                        {title}
                    </p>
                </div>
                
                {/* Monochrome Illustration */}
                <div className="absolute right-0 top-[-30px] w-32 h-24 items-end justify-end pointer-events-none opacity-50 hidden sm:flex">
                    {iconType === 'globe' ? (
                        <div className={`w-16 h-16 ${isCompleted ? 'bg-white/20' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
                            <Globe className={`${isCompleted ? 'text-white' : 'text-gray-400'} w-10 h-10`} />
                        </div>
                    ) : (
                        <div className="flex items-end space-x-1">
                            <div className={`w-4 h-12 ${isCompleted ? 'bg-white/20' : 'bg-gray-300'} rounded-t-sm`}></div>
                            <div className={`w-6 h-16 ${isCompleted ? 'bg-white/20' : 'bg-gray-300'} rounded-t-sm`}></div>
                            <div className={`w-8 h-10 ${isCompleted ? 'bg-white/20' : 'bg-gray-300'} rounded-t-sm`}></div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Linear Path representation inside the locked/completed boxes */}
            <div className="relative w-full h-16 flex items-center justify-center px-4 sm:px-8 gap-6 sm:gap-12 z-10">
                {/* Connecting Line */}
                <div className={`absolute top-1/2 left-8 right-8 h-2 ${isCompleted ? 'bg-white/40' : 'bg-[#cecece]'} -translate-y-1/2 z-0 rounded-full`}></div>
                
                {/* Map up to 3 lessons to fit nicely inside the small card */}
                {lessons.slice(0, 3).map((lesson, idx) => {
                    const IconComponent = ICONS[idx % ICONS.length];
                    
                    return (
                        <div key={lesson.id} className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${nodeBgColor} flex items-center justify-center ring-2 ring-white/10`}>
                            {isCompleted ? (
                                <Check className="text-white w-5 h-5 sm:w-6 sm:h-6" strokeWidth={4} />
                            ) : (
                                <IconComponent className="text-white w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
