"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, X, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { onChallengeComplete, onChallengeWrong, onLessonComplete } from "@/actions/user-progress";
import { StreakModal } from "@/components/modals/streak-modal";

// Types
type ChallengeOption = {
    id: number;
    text: string;
    correct: boolean;
    imageSrc: string | null;
    audioSrc: string | null;
};

type Challenge = {
    id: number;
    question: string;
    type: "SELECT" | "ASSIST";
    order: number;
    completed: boolean;
    challengeOptions: ChallengeOption[];
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
    onClick: () => void;
};

const ChallengeOptionCard = ({
    text,
    imageSrc,
    selected,
    disabled,
    status,
    onClick,
}: ChallengeOptionProps) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-b-4 p-4 transition-all hover:bg-slate-100 active:border-b-2",
                selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
                status === "correct" &&
                "border-green-300 bg-green-100 hover:bg-green-100",
                status === "wrong" && "border-rose-300 bg-rose-100 hover:bg-rose-100",
                disabled && "pointer-events-none"
            )}
        >
            {imageSrc && (
                <div className="relative h-16 w-16 rounded-lg bg-slate-100">
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                        🖼️
                    </div>
                </div>
            )}
            <span className="font-bold">{text}</span>
        </button>
    );
};

export const LessonClient = ({
    initialLesson,
    initialHearts,
    initialPoints,
    xpBoostLessons,
    heartShields
}: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [hearts, setHearts] = useState(initialHearts);
    const [points, setPoints] = useState(initialPoints);
    const [challenges] = useState(initialLesson.challenges);
    const [activeIndex, setActiveIndex] = useState(() => {
        // Start from first incomplete challenge
        const incompleteIndex = initialLesson.challenges.findIndex(c => !c.completed);
        return incompleteIndex === -1 ? 0 : incompleteIndex;
    });
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");
    const [showExitModal, setShowExitModal] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);

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

    // Play sound feedback
    const playSound = (type: "correct" | "wrong") => {
        try {
            const audioContext = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = type === "correct" ? 800 : 300;
            oscillator.type = "sine";

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime + 0.3
            );

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Audio not supported
        }
    };

    const handleSelect = (optionId: number) => {
        if (status !== "none") return;
        setSelectedOption(optionId);
    };

    const handleCheck = () => {
        if (selectedOption === null) return;

        const selectedOpt = options.find((opt) => opt.id === selectedOption);

        if (selectedOpt?.correct) {
            setStatus("correct");
            playSound("correct");
            setCorrectCount((prev) => prev + 1);

            startTransition(() => {
                onChallengeComplete(currentChallenge.id).then((result) => {
                    // Use XP from server (10 normal, 20 with boost)
                    const xp = result.xpGained || 10;
                    setPoints((prev) => prev + xp);
                    setXpGained((prev) => prev + xp);
                });
            });
        } else {
            setStatus("wrong");
            playSound("wrong");
            setWrongCount((prev) => prev + 1);

            startTransition(() => {
                onChallengeWrong().then((result) => {
                    if (result.shieldUsed) {
                        // Shield protected - don't lose heart, show message
                    } else if (result.hearts !== undefined) {
                        setHearts(result.hearts);
                        setHeartsLost((prev) => prev + 1);
                    }
                });
            });
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
       
       This means I inserted hooks and functions INSIDE the component body, replacing the 'if (lessonComplete)' block?
       NO.
       I need to check where I inserted.
       I targeted line 217.
       Previous content:
       217:     if (lessonComplete) {
       
       My replacement content:
       // Timing
       const [startTime] = useState...
       ...
       const handleContinue = ...
       
       if (lessonComplete) { ... }
       
       This means I replaced the 'if (lessonComplete)' block with HOOKS and FUNCTIONS followed by the new 'if (lessonComplete)' block.
       This is VALID, IF line 217 is inside the main component body (it is).
       
       HOWEVER, I now have DUPLICATE `handleContinue` if I didn't remove the old one.
       Old `handleContinue` was at line 188.
       I need to delete the old `handleContinue` at line 188.
    */

    const handleExit = () => {
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
        setEndTime(Date.now());
        setLessonComplete(true);
    };

    const handleContinue = () => {
        if (hearts === 0) {
            handleLessonComplete();
            return;
        }

        // If it's the last challenge
        if (activeIndex >= challenges.length - 1) {
            handleLessonComplete();
        } else {
            // Move to next challenge
            setActiveIndex((prev) => prev + 1);
            setSelectedOption(null);
            setStatus("none");
        }
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

                    {/* Mascot */}
                    <div className="mb-10 w-[200px] h-[200px] relative">
                        <img src="/mascot.svg" alt="Mascot" className="w-full h-full object-contain" />
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
                                        onLessonComplete()
                                            .then((res) => {
                                                if (res?.streakExtended) {
                                                    setStreakDays(res.streak ?? 0);
                                                    setShowStreakModal(true);
                                                } else {
                                                    router.push("/learn");
                                                }
                                            })
                                            .catch((err) => {
                                                console.error("Error completing lesson:", err);
                                                // Fallback to exit even on error to avoid sticking
                                                router.push("/learn");
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
    if (hearts === 0 && status === "none") {
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 text-center">
                            <span className="text-5xl">😢</span>
                            <h2 className="mt-4 text-xl font-bold text-slate-700">
                                Tens a certeza que queres sair?
                            </h2>
                            <p className="mt-2 text-slate-500">
                                O teu progresso nesta lição será guardado.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={cancelExit}
                            >
                                Continuar
                            </Button>
                            <Button
                                variant="danger"
                                className="flex-1"
                                onClick={confirmExit}
                            >
                                Sair
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex min-h-screen flex-col">
                {/* Header */}
                <header className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-x-4 px-6 pt-6 lg:pt-12">
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

                {/* Main content */}
                <main className="mx-auto flex w-full max-w-[1140px] flex-1 flex-col items-center justify-center gap-y-8 px-6 py-12">
                    {/* Question */}
                    <h1 className="text-center text-2xl font-bold lg:text-3xl">
                        {currentChallenge.question}
                    </h1>

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
                </main>

                {/* Footer */}
                <footer
                    className={cn(
                        "border-t-2 p-4 lg:p-8",
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
                                <div className="flex flex-col lg:flex-row justify-between w-full items-center gap-4">
                                    <div className="flex items-center gap-x-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500">
                                            <span className="text-white">✗</span>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-rose-600">Incorreto!</p>
                                            <p className="text-sm text-rose-500">
                                                Resposta correta:{" "}
                                                {currentChallenge.challengeOptions.find((o) => o.correct)?.text}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="danger" onClick={handleContinue} disabled={isPending} className="w-full lg:w-auto">
                                        {hearts === 0 ? "Terminar" : "Continuar"}
                                    </Button>
                                </div>
                            )}

                            {status === "correct" && (
                                <div className="flex justify-between w-full items-center">
                                    <div className="flex items-center gap-x-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                            <span className="text-white">✓</span>
                                        </div>
                                        <span className="text-lg font-bold text-green-600">
                                            Correto! +10 XP
                                        </span>
                                    </div>
                                    <Button variant="primary" onClick={handleContinue} disabled={isPending}>
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
