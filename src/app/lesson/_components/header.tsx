import { X, Volume2, VolumeX, Zap, Shield, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const ProgressBar = ({ value }: { value: number }) => {
    return (
        <div className="h-4 w-full rounded-full bg-slate-200">
            <div
                className="h-full rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${value}%` }}
            />
        </div>
    );
};

const Hearts = ({ hearts }: { hearts: number }) => {
    return (
        <div className="flex items-center gap-x-1">
            <Heart
                className={cn(
                    "h-6 w-6",
                    hearts > 0 ? "fill-rose-500 text-rose-500" : "text-slate-300"
                )}
            />
            <span className="font-bold text-rose-500">{hearts}</span>
        </div>
    );
};

type HeaderProps = {
    progress: number;
    hearts: number;
    xpBoostLessons: number;
    heartShields: number;
    isAudioMuted: boolean;
    onToggleMute: () => void;
    onExit: () => void;
};

export const LessonHeader = ({
    progress,
    hearts,
    xpBoostLessons,
    heartShields,
    isAudioMuted,
    onToggleMute,
    onExit,
}: HeaderProps) => {
    return (
        <header className="mx-auto flex w-full max-w-[1140px] shrink-0 items-center justify-between gap-x-4 px-6 pt-6 lg:pt-12">
            <button onClick={onExit} className="text-slate-500 hover:text-slate-700">
                <X className="h-6 w-6" />
            </button>
            <div className="flex-1">
                <ProgressBar value={progress} />
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleMute}
                    className={cn(
                        "rounded-xl p-2 transition-all active:scale-90",
                        isAudioMuted
                            ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            : "bg-sky-50 text-sky-500 hover:bg-sky-100"
                    )}
                    title={isAudioMuted ? "Ativar som" : "Silenciar"}
                >
                    {isAudioMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>

                {xpBoostLessons > 0 && (
                    <div className="flex items-center gap-2 rounded-xl border-2 border-purple-200 bg-purple-100 px-4 py-2 text-purple-600">
                        <Zap className="h-5 w-5 fill-current" />
                        <span className="font-bold">{xpBoostLessons}</span>
                    </div>
                )}

                {heartShields > 0 && (
                    <div className="flex items-center gap-2 rounded-xl border-2 border-sky-200 bg-sky-100 px-4 py-2 text-sky-600">
                        <Shield className="h-5 w-5 fill-current" />
                        <span className="font-bold">{heartShields}</span>
                    </div>
                )}

                <Hearts hearts={hearts} />
            </div>
        </header>
    );
};
