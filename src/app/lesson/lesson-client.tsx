"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart, X, Zap, Shield, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { onChallengeComplete, onChallengeWrong, onLessonComplete, onClinicComplete } from "@/actions/user-progress";
import { StreakModal } from "@/components/modals/streak-modal";
import { useTTS } from "@/hooks/use-tts";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { BearDanceLottie, StarAngryLottie, HappyStarLottie, DuoAnimationLottie, LaughingCatLottie } from "@/components/lottie-animation";
import { InteractiveText } from "@/components/ui/interactive-text";

// Types
type ChallengeOption = {
    id: number;
    text: string;
    correct: boolean;
    imageSrc: string | null;
    audioSrc: string | null;
    audioLang?: string | null;
};

type Challenge = {
    id: number;
    question: string;
    type: "SELECT" | "ASSIST";
    order: number;
    completed: boolean;
    challengeOptions: ChallengeOption[];
    context?: string | null;
    explanation?: string | null;
    questionAudioLang?: string | null;
    contextAudioLang?: string | null;
};

type Lesson = {
    id: number;
    title: string;
    challenges: Challenge[];
};

type Props = {
    initialLesson: Lesson;
    initialHearts: number;
    initialPoints: number;
    xpBoostLessons: number;
    heartShields: number;
    languageCode: string;
    language: string;
    isClinic?: boolean;
};

// Progress Bar Component
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

// Hearts Display Component
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

// Challenge Option Card
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

const ChallengeOptionCard = ({
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
                // Base state (Idle)
                !selected && status === "none" && !disabled && "border-slate-200 bg-white hover:bg-slate-50 hover:-translate-y-1 hover:border-b-[6px] active:translate-y-1 active:border-b-2 hover:shadow-sm",
                
                // Selected state (Before check)
                selected && status === "none" && "border-sky-400 bg-sky-50 shadow-md shadow-sky-100/50 scale-[1.02]",
                
                // Correct state
                status === "correct" && selected && "border-green-400 bg-green-50 scale-[1.02] shadow-md shadow-green-100/50",
                status === "correct" && !selected && "border-slate-200 bg-white opacity-50 grayscale",
                
                // Wrong state
                status === "wrong" && selected && "border-rose-400 bg-rose-50 scale-[1.02] shadow-md shadow-rose-100/50",
                status === "wrong" && !selected && !isCorrect && "border-slate-200 bg-white opacity-50 grayscale",
                status === "wrong" && !selected && isCorrect && "border-green-400 bg-green-50 scale-[1.02] shadow-md shadow-green-100/50", // Highlight correct option if missed

                // Disabled state
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

export const LessonClient = ({
    initialLesson,
    initialHearts,
    initialPoints,
    xpBoostLessons,
    heartShields,
    languageCode,
    language,
    isClinic
}: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [hearts, setHearts] = useState(initialHearts);
    const [points, setPoints] = useState(initialPoints);
    const [challenges, setChallenges] = useState(initialLesson.challenges);
    const [activeIndex, setActiveIndex] = useState(() => {
        // Start from first incomplete challenge
        const incompleteIndex = initialLesson.challenges.findIndex(c => !c.completed);
        return incompleteIndex === -1 ? 0 : incompleteIndex;
    });
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");
    const [showExitModal, setShowExitModal] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [showTransition, setShowTransition] = useState(false);

    // Streak State
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [streakDays, setStreakDays] = useState(0);

    // Stats tracking
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [heartsLost, setHeartsLost] = useState(0);
    const [xpGained, setXpGained] = useState(0);

    const currentChallenge = challenges[activeIndex];
    const options = currentChallenge?.challengeOptions || [];
    const progress = ((activeIndex) / challenges.length) * 100;

    // Audio Logic (using Smart TTS Hook)
    const { playAudio, playMixedSpeech, stopAudio, isPlaying, playingText } = useTTS(languageCode);

    // Audio is now user-triggered only (no autoplay)

    // Play sound feedback
    const playSound = (type: "correct" | "wrong" | "completed") => {
        try {
            const audioSrc = type === "correct"
                ? "/correct.mp3"
                : type === "wrong"
                    ? "/duolingo-wrong.mp3"
                    : "/duolingo-completed-lesson.mp3";

            const audio = new Audio(audioSrc);
            audio.play().catch(e => console.error("Error playing audio:", e));
        } catch (e) {
            // Audio not supported
        }
    };

    const handleSelect = (optionId: number) => {
        if (status !== "none") return;

        setSelectedOption(optionId);

        // Find the selected option text and speak it
        const selectedOpt = options.find((opt) => opt.id === optionId);
        if (selectedOpt?.text) {
            playAudio(
                selectedOpt.text, 
                0.9, 
                selectedOpt.audioLang || languageCode
            );
        }
    };

    const handleCheck = () => {
        if (selectedOption === null) return;

        const selectedOpt = options.find((opt) => opt.id === selectedOption);
        if (selectedOpt?.correct) {
            setStatus("correct");
            playSound("correct");
            setCorrectCount((prev) => prev + 1);

            if (isClinic) {
                // Local points for the clinic
                setPoints((prev) => prev + 10);
                setXpGained((prev) => prev + 10);
            } else {
                onChallengeComplete(currentChallenge.id).then((result) => {
                    const xp = result.xpGained || 10;
                    setPoints((prev) => prev + xp);
                    setXpGained((prev) => prev + xp);
                });
            }

        } else {
            setStatus("wrong");
            playSound("wrong");
            setWrongCount((prev) => prev + 1);

            // Re-append the failed challenge to the end of the lesson so the user MUST get it right later
            setChallenges((prev) => [...prev, { ...currentChallenge, id: currentChallenge.id + Math.random() }]); // using slight random id variation for mapping keys internally if needed, or structured cloning

            if (!isClinic) {
                onChallengeWrong().then((result) => {
                    if (result.shieldUsed) {
                        // Shield protected
                    } else if (result.hearts !== undefined) {
                        setHearts(result.hearts);
                        setHeartsLost((prev) => prev + 1);
                    }
                });
            }
        }
    };

    // Old handleContinue removed, new one is integrated above.
    /* 
       Wait, I need to make sure I don't leave duplicate handleContinue in the file.
       The previous block REPLACED text from line 217 onwards, which was inside render?
       Let me check the line numbers again.
       The previous replace TARGET was:
       // Lesson Complete Screen ... (line 247)
       Wait, I targetted line 217 in my previous 'TargetContent', but the 'StartLine' argument says 217.
       Looking at the file content from step 1957:
       Line 216 was "// Lesson Complete Screen".
       My previous replacement replaced the render logic for lesson complete.
       BUT, in my 'ReplacementContent', I also included:
       const handleLessonComplete = ...
       const handleContinue = ...

       Wait, I can't declare functions inside the render logic if this block is inside the 'if (lessonComplete)' block?
       Ah, I need to be careful.
       Line 217 starts: if (lessonComplete) {
       My replacement started with: 
       // Timing const [startTime]...
       
       This means I replaced the 'if (lessonComplete)' block with HOOKS and FUNCTIONS followed by the new 'if (lessonComplete)' block.
       This is VALID, IF line 217 is inside the main component body (it is).
       
       HOWEVER, I now have DUPLICATE `handleContinue` if I didn't remove the old one.
       Old `handleContinue` was at line 188.
       I need to delete the old `handleContinue` at line 188.
    */

    const { playWhoosh } = useUISounds();

    const handleExit = () => {
        playWhoosh();
        setShowExitModal(true);
    };

    const confirmExit = () => {
        router.push("/learn");
    };

    const cancelExit = () => {
        setShowExitModal(false);
    };

    // Timing
    const [startTime] = useState(Date.now());
    const [endTime, setEndTime] = useState<number | null>(null);

    // Calculate time and accuracy
    const duration = endTime ? Math.floor((endTime - startTime) / 1000) : 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const totalQuestions = correctCount + wrongCount;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const handleLessonComplete = () => {
        playSound("completed");
        setEndTime(Date.now());
        setLessonComplete(true);
    };

    const handleContinue = () => {
        if (hearts === 0 && !isClinic) {
            handleLessonComplete();
            return;
        }

        // Trigger transition animation if moving to the next question
        if (activeIndex < challenges.length - 1) {
            setShowTransition(true);
            setTimeout(() => {
                setShowTransition(false);
                setActiveIndex((prev) => prev + 1);
                setSelectedOption(null);
                setStatus("none");
            }, 1200);
            return;
        }

        // If it's the last challenge
        handleLessonComplete();
    };

    // Lesson Complete Screen
    if (lessonComplete) {
        const isSuccess = hearts > 0;
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
                <div className="w-full max-w-[400px] text-center flex flex-col items-center">

                    {/* Header */}
                    <div className="mb-10 pt-10">
                        <h1 className="text-3xl font-extrabold text-amber-400 uppercase tracking-widest">
                            Prática Concluída!
                        </h1>
                    </div>

                    {/* Hero Mascot Lottie */}
                    <div className="mb-8 w-72 h-72 relative animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <HappyStarLottie className="w-full h-full drop-shadow-2xl" />
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4 w-full mb-12">
                        {/* XP Card */}
                        <div className="flex flex-col items-center overflow-hidden rounded-2xl border-2 border-amber-400 bg-amber-400">
                            <div className="w-full bg-amber-400 p-1 text-center text-xs font-bold text-white uppercase">
                                Total XP
                            </div>
                            <div className="flex w-full flex-col items-center justify-center bg-white p-3">
                                <Zap className="h-6 w-6 text-amber-400 mb-1 fill-amber-400" />
                                <span className="text-xl font-bold text-amber-400">{xpGained}</span>
                            </div>
                        </div>

                        {/* Time Card */}
                        <div className="flex flex-col items-center overflow-hidden rounded-2xl border-2 border-sky-400 bg-sky-400">
                            <div className="w-full bg-sky-400 p-1 text-center text-xs font-bold text-white uppercase">
                                Tempo
                            </div>
                            <div className="flex w-full flex-col items-center justify-center bg-white p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-sky-400 mb-1"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                <span className="text-xl font-bold text-sky-400">{timeString}</span>
                            </div>
                        </div>

                        {/* Accuracy Card */}
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

                    {/* Footer / Continue Button */}
                    <div className="w-full mt-auto pb-10">
                        <Button
                            variant="primary" // Changed from super/secondary to match existing styles but let's check variant
                            size="lg"
                            className="w-full h-12 text-lg uppercase tracking-wide"
                            onClick={() => {
                                if (isSuccess) {
                                    startTransition(() => {
                                        const completeAction = isClinic ? onClinicComplete : onLessonComplete;
                                        completeAction()
                                            .then((res: any) => {
                                                if (res?.streakExtended) {
                                                    setStreakDays(res.streak ?? 0);
                                                    setShowStreakModal(true);
                                                } else {
                                                    router.push(isClinic ? "/shop" : "/learn");
                                                }
                                            })
                                            .catch((err) => {
                                                console.error("Error completing lesson:", err);
                                                // Fallback to exit even on error to avoid sticking
                                                router.push(isClinic ? "/shop" : "/learn");
                                            });
                                    });
                                } else {
                                    router.push("/learn");
                                }
                            }}
                        >
                            Continuar
                        </Button>
                    </div>
                </div>
                <StreakModal
                    open={showStreakModal}
                    onOpenChange={(open) => {
                        if (!open) router.push("/learn");
                        setShowStreakModal(open);
                    }}
                    streak={streakDays}
                    variant="gained"
                />
            </div>
        );
    }

    // Out of Hearts Screen
    if (hearts === 0 && !isClinic && status === "none") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-400 to-rose-500 px-6">
                <div className="w-full max-w-md text-center">
                    {/* Sad Mascot */}
                    <div className="mb-6">
                        <span className="text-8xl">💔</span>
                    </div>

                    {/* Title */}
                    <h1 className="mb-2 text-4xl font-extrabold text-white">
                        Gastaste todos os teus corações!
                    </h1>
                    <p className="mb-8 text-lg text-white/80">
                        O teu progresso foi guardado. Recarrega os corações para continuar.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <Button
                            variant="super"
                            size="lg"
                            className="w-full"
                            onClick={() => router.push("/shop")}
                        >
                            Recarregar Corações
                        </Button>
                        <Button
                            variant="primary" // Re-using primary for positive actions
                            size="lg"
                            className="w-full border-green-400 bg-green-500 hover:bg-green-400"
                            onClick={() => router.push("/lesson?clinic=true")}
                        >
                            Praticar para ganhar vidas ❤️
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-full text-white hover:bg-white/20"
                            onClick={() => router.push("/learn")}
                        >
                            Voltar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentChallenge) {
        // Fallback if index out of bounds
        router.push("/learn");
        return null;
    }



    return (
        <>

            {/* Exit Confirmation Modal */}
            {showExitModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500 border-4 border-slate-100 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-50 to-white -z-10" />
                        
                        <div className="w-56 h-56 -mt-4 relative animate-bounce">
                            <LaughingCatLottie className="w-full h-full drop-shadow-xl" />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight -mt-4">
                            Vais mesmo <span className="text-rose-500">desistir</span> agora?! 😭
                        </h2>
                        
                        <p className="mt-4 mb-8 text-lg font-medium text-slate-500 px-2 leading-relaxed">
                            O gatinho está a rir-se da tua fraqueza... Fica e prova o teu valor! 
                            <span className="block mt-2 text-sm text-slate-400 font-normal">(Relaxa, o progresso fica guardado de qualquer forma).</span>
                        </p>
                        
                        <div className="flex flex-col w-full gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full h-14 text-lg rounded-2xl tracking-wide uppercase active:border-b-0 active:translate-y-1 transition-all"
                                onClick={cancelExit}
                            >
                                CONTINUAR A APRENDER
                            </Button>
                            <Button
                                variant="danger"
                                size="lg"
                                className="w-full h-14 text-lg rounded-2xl bg-white text-rose-500 border-2 border-slate-200 hover:bg-rose-50 hover:text-rose-600 active:border-b-0 active:translate-y-1 transition-all"
                                onClick={confirmExit}
                            >
                                Sair porque sou fraco
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white">
                {/* Header */}
                <header className="mx-auto flex w-full max-w-[1140px] shrink-0 items-center justify-between gap-x-4 px-6 pt-6 lg:pt-12">
                    <button onClick={handleExit} className="text-slate-500 hover:text-slate-700">
                        <X className="h-6 w-6" />
                    </button>
                    <div className="flex-1">
                        <ProgressBar value={progress} />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* XP Boost Indicator */}
                        {xpBoostLessons > 0 && (
                            <div className="flex items-center gap-2 rounded-xl border-2 border-purple-200 bg-purple-100 px-4 py-2 text-purple-600">
                                <Zap className="h-5 w-5 fill-current" />
                                <span className="font-bold">{xpBoostLessons}</span>
                            </div>
                        )}

                        {/* Heart Shield Indicator */}
                        {heartShields > 0 && (
                            <div className="flex items-center gap-2 rounded-xl border-2 border-sky-200 bg-sky-100 px-4 py-2 text-sky-600">
                                <Shield className="h-5 w-5 fill-current" />
                                <span className="font-bold">{heartShields}</span>
                            </div>
                        )}

                        <Hearts hearts={hearts} />
                    </div>
                </header>

                {/* Transition Animation Overlay */}
                {showTransition && (
                    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white animate-in fade-in duration-300">
                        <div className="w-80 h-80 animate-in zoom-in duration-500">
                            <DuoAnimationLottie className="w-full h-full drop-shadow-2xl" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-400 mt-4 animate-pulse">
                            A carregar a próxima...
                        </h2>
                    </div>
                )}

                {/* Main content */}
                <main className="flex-1 overflow-y-auto min-h-0 w-full px-6 py-6 no-scrollbar">
                    <div className="mx-auto flex w-full max-w-[1140px] min-h-full flex-col items-center justify-center gap-y-6">

                    {/* CONTEXT (Scenario) - Shows up if present */}
                    {currentChallenge.context && (
                        <div className="w-full max-w-[600px] bg-sky-50/80 backdrop-blur-sm p-5 rounded-3xl border-2 border-sky-100/50 shadow-sm text-center mb-[-10px] relative transition-all duration-300">
                            <span className="text-[11px] font-black text-sky-400 uppercase tracking-[0.2em] mb-2 block">Contexto</span>
                            <Button 
                                variant="ghost" 
                                className={cn(
                                    "absolute top-3 right-3 rounded-xl w-10 h-10 p-0 text-sky-500 bg-white border-2 border-slate-100 shadow-sm transition-all hover:bg-sky-50 hover:border-sky-200 hover:scale-105 active:scale-95",
                                    isPlaying && playingText === currentChallenge.context && "border-sky-300 bg-sky-100 scale-105"
                                )}
                                onClick={() => playAudio(
                                    currentChallenge.context as string, 
                                    0.9, 
                                    currentChallenge.contextAudioLang || languageCode
                                )}
                            >
                                {isPlaying && playingText === currentChallenge.context ? (
                                    <div className="w-4 h-4 bg-sky-500 rounded-sm animate-pulse" />
                                ) : (
                                    <Volume2 className="h-5 w-5" />
                                )}
                            </Button>
                            <div className="text-xl font-medium text-slate-700 mt-2 px-8 leading-relaxed">
                                &quot;<InteractiveText text={currentChallenge.context} language={language} />&quot;
                            </div>
                            {/* Decorative tail for speech bubble effect */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-sky-50/80 border-r-2 border-b-2 border-sky-100/50 rotate-45 backdrop-blur-sm" />
                        </div>
                    )}

                    {/* Question */}
                    <div className="flex flex-col gap-6 mb-6 items-center justify-center mt-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "bg-white border-2 border-slate-200 w-28 h-28 rounded-full shadow-md transition-all active:scale-95 hover:bg-slate-50 hover:border-sky-200 hover:shadow-lg",
                                    isPlaying && playingText === currentChallenge.question && "border-sky-400 bg-sky-50 scale-105 shadow-sky-200"
                                )}
                                onClick={() => playAudio(
                                    currentChallenge.question, 
                                    0.9, 
                                    currentChallenge.questionAudioLang || languageCode
                                )}
                            >
                                {isPlaying && playingText === currentChallenge.question ? (
                                    <div className="w-10 h-10 bg-sky-500 rounded-md animate-pulse" />
                                ) : (
                                    <Volume2 className="h-14 w-14 text-sky-500" />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                className="bg-white border-2 border-slate-200 w-14 h-14 rounded-2xl shadow-sm hover:bg-slate-50 hover:border-sky-200 transition-all active:scale-95"
                                onClick={() => playAudio(
                                    currentChallenge.question, 
                                    0.5, 
                                    currentChallenge.questionAudioLang || languageCode
                                )}
                            >
                                <span className="text-2xl">🐢</span>
                            </Button>
                        </div>
                        <div className="text-center text-3xl font-extrabold lg:text-4xl text-slate-800 tracking-tight">
                            <InteractiveText text={currentChallenge.question} language={language} />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="grid w-full max-w-[600px] grid-cols-1 gap-3 sm:grid-cols-2">
                        {options.map((option) => (
                            <ChallengeOptionCard
                                key={option.id}
                                id={option.id}
                                text={option.text}
                                imageSrc={option.imageSrc}
                                selected={selectedOption === option.id}
                                disabled={status !== "none" || isPending}
                                isCorrect={option.correct}
                                status={
                                    status !== "none" && selectedOption === option.id
                                        ? status
                                        : option.correct && status === "wrong"
                                            ? "correct"
                                            : "none"
                                }
                                onClick={() => handleSelect(option.id)}
                            />
                        ))}
                    </div>
                    </div>
                </main>

                {/* Footer */}
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
                                    <Button variant="ghost" onClick={handleExit} className="hidden lg:block">Saltar</Button>
                                    <Button
                                        variant="primary"
                                        disabled={selectedOption === null || isPending}
                                        onClick={handleCheck}
                                        className="ml-auto"
                                    >
                                        Verificar
                                    </Button>
                                </div>
                            )}

                            {status === "wrong" && (
                                <div className="flex flex-col w-full gap-4 animate-in slide-in-from-bottom-4 duration-300">
                                    {/* Hero row: Lottie + status */}
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
                                    {/* Explanation */}
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
                                    {/* Continue button */}
                                    <Button 
                                        variant="danger" 
                                        onClick={handleContinue} 
                                        disabled={isPending} 
                                        className="w-full py-4 text-base font-extrabold rounded-2xl border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all"
                                    >
                                        {hearts === 0 ? "Terminar" : "Continuar"}
                                    </Button>
                                </div>
                            )}

                            {status === "correct" && (
                                <div className="flex flex-col w-full gap-4 animate-in slide-in-from-bottom-4 duration-300">
                                    {/* Hero row: Lottie + status */}
                                    <div className="flex items-center gap-4">
                                        <BearDanceLottie className="w-20 h-20 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xl font-black text-green-600 tracking-tight">Correto! 🎉</p>
                                            <p className="text-sm text-green-500 font-bold mt-0.5">+10 XP — Muito bem!</p>
                                        </div>
                                    </div>
                                    {/* Explanation */}
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
                                    {/* Continue button */}
                                    <Button 
                                        variant="primary" 
                                        onClick={handleContinue} 
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
            </div>
        </>
    );
};
