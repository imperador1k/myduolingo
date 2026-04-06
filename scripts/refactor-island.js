const fs = require('fs');

let code = fs.readFileSync('src/components/shared/unit-card-island.tsx', 'utf8');

// We need to replace the UnitCardIsland function body
// Let's find: `export function UnitCardIsland({` and the end of the file.

const functionStart = `export function UnitCardIsland({`;
const newFunction = `export function UnitCardIsland({ 
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
            left: \`\${leftPercent}%\`,
            top: \`\${topPercent}%\`
        };
    };

    // Calculate dynamic container height based on total nodes to ensure they don't overlap
    const containerHeight = Math.max(lessons.length * 150, 400);

    return (
        <div 
            className={cn(
                "w-full relative flex flex-col items-center pt-12 sm:pt-16 pb-20 sm:pb-24 transition-colors duration-500",
                isLockedUnit ? "opacity-75 grayscale sepia-[.3]" : ""
            )}
            style={{ backgroundColor: theme.bg }}
        >
            {/* Integrated Full-Bleed Header */}
            <div className={cn(
                "w-full max-w-[800px] px-6 sm:px-12 mb-10 z-10",
                align === 'right' ? "text-right" : "text-left"
            )}>
                <h2 
                    className="text-sm sm:text-base font-black mb-3 tracking-[0.25em] uppercase opacity-80"
                    style={{ color: theme.dark }}
                >
                    Capítulo {unitIndex + 1}
                </h2>
                <h3 
                    className="text-3xl sm:text-4xl font-black leading-tight tracking-tight drop-shadow-sm"
                    style={{ color: theme.text }}
                >
                    {title}
                </h3>
            </div>

            {/* The Path Container */}
            <div 
                className="relative w-full max-w-[800px] mx-auto"
                style={{
                    minHeight: \`\${containerHeight}px\`,
                }}
            >
                {/* Subtle Dashed Center Trail (z-0) */}
                <div className="absolute inset-0 pointer-events-none flex justify-center z-0">
                    <svg width="12" height="100%">
                        <line x1="6" y1="0" x2="6" y2="100%" 
                            stroke={theme.trail} 
                            strokeWidth="6" 
                            strokeDasharray="16 16" 
                            strokeLinecap="round" 
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
                                className="absolute z-20 pointer-events-auto"
                                style={{
                                    left: pos.left, top: pos.top,
                                    transform: "translate(-50%, -50%)", 
                                }}
                            >
                                {/* Current Active Node */}
                                {lesson.isCurrent && (
                                    <div className="relative group cursor-pointer z-40 flex flex-col items-center justify-center">
                                        
                                        {/* Accessory Stack (Centered above the node) */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col items-center mb-2 pointer-events-none">
                                            
                                            {/* Massive COMEÇAR Directional Bubble */}
                                            {!noHearts && (
                                                <div 
                                                    className="relative flex bg-white font-black text-sm uppercase tracking-[0.15em] px-6 py-4 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.15)] border-2 border-slate-200 transition-transform hover:scale-105 active:scale-95 animate-bounce z-50 whitespace-nowrap mb-6 pointer-events-auto cursor-pointer"
                                                    style={{ color: theme.text }}
                                                >
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
                                            className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] bg-white rounded-full border-4 border-b-[12px] shadow-[0_15px_20px_-5px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center hover:-translate-y-2 hover:scale-105 active:scale-95 active:translate-y-2 active:border-b-[4px] transition-all relative z-20 mx-auto"
                                            style={{ borderColor: theme.dark }}
                                        >
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-inner border-2" style={{ backgroundColor: theme.bg, borderColor: theme.dark }}>
                                                <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" style={{ color: theme.dark }} />
                                            </div>
                                        </div>

                                        {/* Bottom Accessory Stack (Centered below the node) */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center mt-3 pointer-events-none">
                                            {/* Active Node XP Floating Text */}
                                            <div className="opacity-100 group-hover:translate-y-1 transition-transform z-30 pointer-events-auto">
                                                <div 
                                                    className="bg-white px-3 py-1.5 rounded-2xl text-[11px] font-black tracking-widest uppercase shadow-md flex items-center gap-1.5 border-2 border-slate-200 whitespace-nowrap cursor-default"
                                                    style={{ color: theme.text }}
                                                >
                                                    <Leaf className="w-3.5 h-3.5" fill="currentColor" style={{ color: theme.text }} /> +10 XP
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Completed Node */}
                                {lesson.completed && !lesson.isCurrent && (
                                    <div className="relative group cursor-pointer z-20 flex flex-col items-center">
                                        <div 
                                            onClick={() => !noHearts && onLessonClick({
                                                id: lesson.id, title: lesson.title, unitTitle,
                                                challengeCount: lesson.challenges?.length || 0,
                                                completedCount: lesson.challenges?.filter(c => c.challengeProgress?.some(p => p.completed)).length || 0,
                                                xpReward: (lesson.challenges?.length || 0) * 10
                                            })}
                                            className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full border-4 border-b-[8px] shadow-lg flex flex-col items-center justify-center hover:-translate-y-1 hover:scale-105 active:scale-95 active:translate-y-1 active:border-b-4 transition-all"
                                            style={{ backgroundColor: theme.text, borderColor: theme.dark }}
                                        >
                                            <Check className="text-white w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm" strokeWidth={5} />
                                        </div>
                                    </div>
                                )}

                                {/* Locked Node */}
                                {lesson.isLocked && !isLockedUnit && !lesson.isCurrent && !lesson.completed && (
                                    <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] bg-slate-200 rounded-full border-4 border-slate-300 border-b-[8px] flex flex-col items-center justify-center opacity-90 cursor-not-allowed">
                                        <IconComponent className="text-slate-400 w-7 h-7 sm:w-9 sm:h-9" fill="currentColor" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}`;

const idx = code.indexOf(functionStart);
const head = code.slice(0, idx);

fs.writeFileSync('src/components/shared/unit-card-island.tsx', head + newFunction);
console.log('LEARN ISLAND REFACTORED TO MODERN FLAT UI!');
