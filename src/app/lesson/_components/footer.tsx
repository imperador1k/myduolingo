import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarAngryLottie, BearDanceLottie } from "@/components/ui/lottie-animation";
import { AITutorFeedback } from "@/components/shared/ai-tutor-feedback";

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
    userAnswer?: string;
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
    userAnswer,
}: FooterProps) => {
    return (
        <footer
            className={cn(
                "fixed bottom-0 left-0 right-0 w-full z-50 border-t-2 transition-colors duration-300",
                status === "none" ? "bg-white border-stone-200" :
                status === "correct" ? "bg-[#d7ffb8] border-[#b8f28b]" :
                "bg-[#ffdfe0] border-[#ffb3b8]"
            )}
        >
            <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 w-full">
                {status === "none" && (
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={onSkip}
                            className="hidden sm:block uppercase font-bold text-stone-400 hover:bg-stone-100 rounded-xl px-5 py-3 transition-colors tracking-widest text-sm"
                        >
                            Saltar
                        </button>
                        <button
                            onClick={onCheck}
                            disabled={isDisabled || isPending}
                            className={cn(
                                "uppercase font-extrabold text-base tracking-widest px-10 py-3 rounded-2xl w-full sm:w-auto transition-all",
                                isDisabled || isPending
                                    ? "bg-stone-200 text-stone-400 border-none cursor-not-allowed"
                                    : "bg-[#58CC02] border-b-4 border-[#46a302] text-white active:translate-y-1 active:border-b-0 shadow-sm"
                            )}
                        >
                            Verificar
                        </button>
                    </div>
                )}

                {status === "correct" && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <BearDanceLottie className="w-14 h-14" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-2xl font-black text-[#58CC02] tracking-tight">Correto!</p>
                                {currentChallenge.explanation && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-sm text-green-700 max-w-[300px] truncate">{currentChallenge.explanation}</p>
                                        <button
                                            onClick={() => playMixedSpeech(currentChallenge.explanation as string, "pt-PT", languageCode)}
                                            className="shrink-0 rounded-full w-6 h-6 flex items-center justify-center bg-white text-green-500 hover:bg-green-50 shadow-sm"
                                        >
                                            <Volume2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onContinue}
                            disabled={isPending}
                            className="bg-[#58CC02] border-b-4 border-[#46a302] text-white uppercase font-extrabold text-base tracking-widest px-10 py-3.5 rounded-2xl w-full sm:w-auto transition-all active:translate-y-1 active:border-b-0 shadow-sm shrink-0"
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {status === "wrong" && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-2 w-full">
                        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                            <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full items-center justify-center shadow-sm hidden sm:flex">
                                <StarAngryLottie className="w-10 h-10 md:w-14 md:h-14" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className="text-xl md:text-2xl font-black text-[#ea2b2b] tracking-tight">Incorreto.</p>
                                <p className="text-base md:text-lg text-[#ff4b4b] whitespace-normal break-words">
                                    Resposta:{" "}
                                    <span className="font-bold">{currentChallenge.challengeOptions.find((o) => o.correct)?.text}</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3 w-full md:w-auto shrink-0 flex-1 justify-end min-w-0">
                            {userAnswer && currentChallenge.question && (
                                <AITutorFeedback 
                                    className="w-full md:w-auto max-w-full py-2.5 px-3 md:py-4 md:px-4"
                                    question={currentChallenge.question || "Tradução"} 
                                    userAnswer={userAnswer}
                                    correctAnswer={currentChallenge.challengeOptions.find((o) => o.correct)?.text || ""}
                                    targetLanguage={languageCode === "en" ? "Inglês" : languageCode === "es" ? "Espanhol" : "outro idioma"}
                                />
                            )}
                            <button
                                onClick={onContinue}
                                disabled={isPending}
                                className="w-full md:w-auto md:min-w-[150px] shrink-0 bg-[#ff4b4b] text-white border-b-4 border-[#ea2b2b] hover:bg-[#ff5f5f] active:border-b-0 active:translate-y-1 py-3 px-6 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-sm"
                            >
                                {hearts === 0 ? "Terminar" : "Continuar"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Safe Area padding for very bottom text if needed on mobile devices without home buttons */}
            <div className="h-safe w-full bg-transparent" />
        </footer>
    );
};
