import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreakModal } from "@/components/modals/streak-modal";
import { HappyStarLottie } from "@/components/ui/lottie-animation";

type ResultScreenProps = {
    isSuccess: boolean;
    xpGained: number;
    timeString: string;
    accuracy: number;
    showStreakModal: boolean;
    streakDays: number;
    onContinue: () => void;
    onShowStreakModalChange: (open: boolean) => void;
};

export const ResultScreen = ({
    isSuccess,
    xpGained,
    timeString,
    accuracy,
    showStreakModal,
    streakDays,
    onContinue,
    onShowStreakModalChange,
}: ResultScreenProps) => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
            <div className="w-full max-w-[400px] text-center flex flex-col items-center">
                <div className="mb-10 pt-10">
                    <h1 className="text-3xl font-extrabold text-amber-400 uppercase tracking-widest">
                        Prática Concluída!
                    </h1>
                </div>

                <div className="mb-8 w-72 h-72 relative animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <HappyStarLottie className="w-full h-full drop-shadow-2xl" />
                </div>

                <div className="grid grid-cols-3 gap-4 w-full mb-12">
                    <div className="flex flex-col items-center overflow-hidden rounded-2xl border-2 border-amber-400 bg-amber-400">
                        <div className="w-full bg-amber-400 p-1 text-center text-xs font-bold text-white uppercase">
                            Total XP
                        </div>
                        <div className="flex w-full flex-col items-center justify-center bg-white p-3">
                            <Zap className="h-6 w-6 text-amber-400 mb-1 fill-amber-400" />
                            <span className="text-xl font-bold text-amber-400">{xpGained}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center overflow-hidden rounded-2xl border-2 border-sky-400 bg-sky-400">
                        <div className="w-full bg-sky-400 p-1 text-center text-xs font-bold text-white uppercase">
                            Tempo
                        </div>
                        <div className="flex w-full flex-col items-center justify-center bg-white p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-sky-400 mb-1"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            <span className="text-xl font-bold text-sky-400">{timeString}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center overflow-hidden rounded-2xl border-2 border-green-400 bg-green-400">
                        <div className="w-full bg-green-400 p-1 text-center text-xs font-bold text-white uppercase">
                            Precisão
                        </div>
                        <div className="flex w-full flex-col items-center justify-center bg-white p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-400 mb-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            <span className="text-xl font-bold text-green-400">{accuracy}%</span>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-auto pb-10">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full h-12 text-lg uppercase tracking-wide"
                        onClick={onContinue}
                    >
                        Continuar
                    </Button>
                </div>
            </div>
            <StreakModal
                open={showStreakModal}
                onOpenChange={onShowStreakModalChange}
                streak={streakDays}
                variant="gained"
            />
        </div>
    );
};
