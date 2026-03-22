import { cn } from "@/lib/utils";

type ChallengeOption = {
    id: number;
    text: string;
    correct: boolean;
};

type MatchGridProps = {
    leftColumn: ChallengeOption[];
    rightColumn: ChallengeOption[];
    selectedMatchIds: number[];
    matchedIds: number[];
    wrongMatchFlash: number[];
    onSelect: (optId: number) => void;
};

export const MatchGrid = ({ leftColumn, rightColumn, selectedMatchIds, matchedIds, wrongMatchFlash, onSelect }: MatchGridProps) => {
    return (
        <div className="grid w-full max-w-[800px] grid-cols-2 gap-8">
            {/* Left Column (Portuguese) */}
            <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2">Português</span>
                {leftColumn.map((opt) => {
                    const isSelected = selectedMatchIds.includes(opt.id);
                    const isMatched = matchedIds.includes(opt.id);
                    const isWrongFlash = wrongMatchFlash.includes(opt.id);

                    return (
                        <button
                            key={opt.id}
                            onClick={() => onSelect(opt.id)}
                            disabled={isMatched}
                            className={cn(
                                "p-4 min-h-[70px] rounded-2xl border-2 border-b-[5px] text-lg font-bold text-center transition-all duration-200 outline-none cursor-pointer",
                                !isSelected && !isMatched && !isWrongFlash && "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-1 active:border-b-2",
                                isSelected && !isWrongFlash && "border-sky-400 bg-sky-50 text-sky-700 scale-[1.02] shadow-md shadow-sky-100/50",
                                isMatched && "border-green-400 bg-green-50 text-green-600 opacity-40 cursor-default scale-95 border-b-2 translate-y-1",
                                isWrongFlash && "border-rose-400 bg-rose-50 text-rose-600 animate-shake"
                            )}
                        >
                            {opt.text}
                        </button>
                    );
                })}
            </div>

            {/* Right Column (Target Language) */}
            <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2">Língua Alvo</span>
                {rightColumn.map((opt) => {
                    const isSelected = selectedMatchIds.includes(opt.id);
                    const isMatched = matchedIds.includes(opt.id);
                    const isWrongFlash = wrongMatchFlash.includes(opt.id);

                    return (
                        <button
                            key={opt.id}
                            onClick={() => onSelect(opt.id)}
                            disabled={isMatched}
                            className={cn(
                                "p-4 min-h-[70px] rounded-2xl border-2 border-b-[5px] text-lg font-bold text-center transition-all duration-200 outline-none cursor-pointer",
                                !isSelected && !isMatched && !isWrongFlash && "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-1 active:border-b-2",
                                isSelected && !isWrongFlash && "border-sky-400 bg-sky-50 text-sky-700 scale-[1.02] shadow-md shadow-sky-100/50",
                                isMatched && "border-green-400 bg-green-50 text-green-600 opacity-40 cursor-default scale-95 border-b-2 translate-y-1",
                                isWrongFlash && "border-rose-400 bg-rose-50 text-rose-600 animate-shake"
                            )}
                        >
                            {opt.text}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
