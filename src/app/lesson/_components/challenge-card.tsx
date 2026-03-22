import { cn } from "@/lib/utils";

type ChallengeOptionProps = {
    id: number;
    text: string;
    imageSrc?: string | null;
    selected: boolean;
    disabled: boolean;
    status: "none" | "correct" | "wrong";
    isCorrect: boolean;
    onClick: () => void;
};

export const ChallengeOptionCard = ({
    text,
    imageSrc,
    selected,
    disabled,
    status,
    isCorrect,
    onClick,
}: ChallengeOptionProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex w-full cursor-pointer items-center gap-5 rounded-2xl border-2 border-b-[5px] p-5 transition-all outline-none",
                !selected && status === "none" && !disabled && "border-slate-200 bg-white hover:bg-slate-50 hover:-translate-y-1 hover:border-b-[6px] active:translate-y-1 active:border-b-2 hover:shadow-sm",
                selected && status === "none" && "border-sky-400 bg-sky-50 shadow-md shadow-sky-100/50 scale-[1.02]",
                status === "correct" && selected && "border-green-400 bg-green-50 scale-[1.02] shadow-md shadow-green-100/50",
                status === "correct" && !selected && "border-slate-200 bg-white opacity-50 grayscale",
                status === "wrong" && selected && "border-rose-400 bg-rose-50 scale-[1.02] shadow-md shadow-rose-100/50",
                status === "wrong" && !selected && !isCorrect && "border-slate-200 bg-white opacity-50 grayscale",
                status === "wrong" && !selected && isCorrect && "border-green-400 bg-green-50 scale-[1.02] shadow-md shadow-green-100/50",
                disabled && status === "none" && "pointer-events-none opacity-50"
            )}
        >
            {imageSrc && (
                <div className="relative h-20 w-20 shrink-0 rounded-xl bg-slate-100 overflow-hidden border-2 border-slate-200/50">
                    <img src={imageSrc} alt={text} className="w-full h-full object-cover" />
                </div>
            )}
            <span className={cn(
                "text-lg font-bold w-full text-left",
                selected && status === "none" && "text-sky-600",
                status === "correct" && (selected || isCorrect) && "text-green-600",
                status === "wrong" && selected && "text-rose-600",
                !selected && status === "none" && "text-slate-700"
            )}>
                {text}
            </span>
        </button>
    );
};
