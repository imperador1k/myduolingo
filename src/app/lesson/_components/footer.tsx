import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarAngryLottie, BearDanceLottie } from "@/components/ui/lottie-animation";

type ChallengeOption = {
    id: number;
    text: string;
    correct: boolean;
};

type Challenge = {
    id: number;
    question: string;
    type: "SELECT" | "ASSIST" | "INSERT" | "MATCH" | "DICTATION";
    order: number;
    completed: boolean;
    challengeOptions: ChallengeOption[];
    context?: string | null;
    explanation?: string | null;
};

type FooterProps = {
    status: "none" | "correct" | "wrong";
    isPending: boolean;
    isDisabled: boolean;
    hearts: number;
    currentChallenge: Challenge;
    languageCode: string;
    onCheck: () => void;
    onContinue: () => void;
    onSkip: () => void;
    playMixedSpeech: (text: string, lang1: string, lang2: string) => void;
};

export const LessonFooter = ({
    status,
    isPending,
    isDisabled,
    hearts,
    currentChallenge,
    languageCode,
    onCheck,
    onContinue,
    onSkip,
    playMixedSpeech,
}: FooterProps) => {
    return (
        <footer
            className={cn(
                "shrink-0 border-t-2 p-4 lg:p-8",
                status === "correct" && "border-transparent bg-green-100",
                status === "wrong" && "border-transparent bg-rose-100"
            )}
        >
            <div className="mx-auto flex w-full max-w-[1140px] items-center justify-between">
                <div className="w-full">
                    {status === "none" && (
                        <div className="flex justify-between w-full">
                            <Button variant="ghost" onClick={onSkip} className="hidden lg:block">Saltar</Button>
                            <Button
                                variant="primary"
                                disabled={isDisabled || isPending}
                                onClick={onCheck}
                                className="ml-auto"
                            >
                                Verificar
                            </Button>
                        </div>
                    )}

                    {status === "wrong" && (
                        <div className="flex flex-col w-full gap-4 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-4">
                                <StarAngryLottie className="w-20 h-20 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xl font-black text-rose-600 tracking-tight">Incorreto! 😞</p>
                                    <p className="text-sm text-rose-500 mt-0.5">
                                        Resposta correta:{" "}
                                        <span className="font-bold">{currentChallenge.challengeOptions.find((o) => o.correct)?.text}</span>
                                    </p>
                                </div>
                            </div>
                            {currentChallenge.explanation && (
                                <div className="text-rose-800 bg-rose-200/60 p-4 rounded-2xl text-sm border-l-4 border-rose-500 relative pb-10 sm:pb-4 sm:pr-14 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                                    <strong className="text-rose-700">💡 Explicação:</strong>{" "}
                                    {currentChallenge.explanation}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute bottom-2 right-2 sm:top-2 sm:bottom-auto rounded-full w-9 h-9 p-0 text-rose-500 bg-rose-100 hover:bg-rose-200 shadow-sm"
                                        onClick={() => playMixedSpeech(currentChallenge.explanation as string, "pt-PT", languageCode)}
                                    >
                                        <Volume2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <Button
                                variant="danger"
                                onClick={onContinue}
                                disabled={isPending}
                                className="w-full py-4 text-base font-extrabold rounded-2xl border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all"
                            >
                                {hearts === 0 ? "Terminar" : "Continuar"}
                            </Button>
                        </div>
                    )}

                    {status === "correct" && (
                        <div className="flex flex-col w-full gap-4 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-4">
                                <BearDanceLottie className="w-20 h-20 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xl font-black text-green-600 tracking-tight">Correto! 🎉</p>
                                    <p className="text-sm text-green-500 font-bold mt-0.5">+10 XP — Muito bem!</p>
                                </div>
                            </div>
                            {currentChallenge.explanation && (
                                <div className="text-green-800 bg-green-200/60 p-4 rounded-2xl text-sm border-l-4 border-green-500 relative pb-10 sm:pb-4 sm:pr-14 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                                    <strong className="text-green-700">💡 Sabias que?</strong>{" "}
                                    {currentChallenge.explanation}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute bottom-2 right-2 sm:top-2 sm:bottom-auto rounded-full w-9 h-9 p-0 text-green-600 bg-green-100 hover:bg-green-200 shadow-sm"
                                        onClick={() => playMixedSpeech(currentChallenge.explanation as string, "pt-PT", languageCode)}
                                    >
                                        <Volume2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <Button
                                variant="primary"
                                onClick={onContinue}
                                disabled={isPending}
                                className="w-full py-4 text-base font-extrabold rounded-2xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
                            >
                                Continuar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
};
