"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { onChallengeComplete, onChallengeWrong } from "@/actions/user-progress";

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
    initialPoints
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
            setPoints((prev) => prev + 10);
            setCorrectCount((prev) => prev + 1);
            setXpGained((prev) => prev + 10);

            startTransition(() => {
                onChallengeComplete(currentChallenge.id);
            });
        } else {
            setStatus("wrong");
            playSound("wrong");
            setWrongCount((prev) => prev + 1);

            startTransition(() => {
                onChallengeWrong().then((result) => {
                    if (result.hearts !== undefined) {
                        setHearts(result.hearts);
                        setHeartsLost((prev) => prev + 1);
                    }
                });
            });
        }
    };

    const handleContinue = () => {
        if (hearts === 0) {
            setLessonComplete(true);
            return;
        }

        if (activeIndex < challenges.length - 1) {
            setActiveIndex((prev) => prev + 1);
            setSelectedOption(null);
            setStatus("none");
        } else {
            // Lesson complete!
            setLessonComplete(true);
        }
    };

    const handleExit = () => {
        setShowExitModal(true);
    };

    const confirmExit = () => {
        router.push("/learn");
    };

    const cancelExit = () => {
        setShowExitModal(false);
    };

    // Lesson Complete Screen
    if (lessonComplete) {
        const isSuccess = hearts > 0;
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-400 to-green-500 px-6">
                <div className="w-full max-w-md text-center">
                    {/* Mascot */}
                    <div className="mb-6 animate-bounce">
                        <span className="text-8xl">{isSuccess ? "🎉" : "😢"}</span>
                    </div>

                    {/* Title */}
                    <h1 className="mb-2 text-4xl font-extrabold text-white">
                        {isSuccess ? "Lição Completa!" : "Fica para a próxima!"}
                    </h1>
                    <p className="mb-8 text-lg text-white/80">
                        {isSuccess ? "Excelente trabalho! Continua assim!" : "Não desistas, tenta outra vez!"}
                    </p>

                    {/* Stats Card */}
                    <div className="mb-8 rounded-2xl bg-white p-6 shadow-xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl bg-amber-50 p-4">
                                <span className="text-3xl">⚡</span>
                                <p className="mt-2 text-2xl font-bold text-amber-500">+{xpGained}</p>
                                <p className="text-sm text-slate-500">XP Ganho</p>
                            </div>
                            <div className="rounded-xl bg-green-50 p-4">
                                <span className="text-3xl">✓</span>
                                <p className="mt-2 text-2xl font-bold text-green-500">{correctCount}</p>
                                <p className="text-sm text-slate-500">Corretas</p>
                            </div>
                            <div className="rounded-xl bg-rose-50 p-4">
                                <span className="text-3xl">✗</span>
                                <p className="mt-2 text-2xl font-bold text-rose-500">{wrongCount}</p>
                                <p className="text-sm text-slate-500">Erradas</p>
                            </div>
                            <div className="rounded-xl bg-rose-50 p-4">
                                <span className="text-3xl">💔</span>
                                <p className="mt-2 text-2xl font-bold text-rose-500">{heartsLost}</p>
                                <p className="text-sm text-slate-500">Corações Perdidos</p>
                            </div>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <Button
                        variant="super"
                        size="lg"
                        className="w-full"
                        onClick={() => router.push("/learn")}
                    >
                        Continuar
                    </Button>
                </div>
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

                    {/* Stats Card */}
                    <div className="mb-8 rounded-2xl bg-white p-6 shadow-xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl bg-amber-50 p-4">
                                <span className="text-3xl">⚡</span>
                                <p className="mt-2 text-2xl font-bold text-amber-500">+{xpGained}</p>
                                <p className="text-sm text-slate-500">XP Ganho</p>
                            </div>
                            <div className="rounded-xl bg-green-50 p-4">
                                <span className="text-3xl">✓</span>
                                <p className="mt-2 text-2xl font-bold text-green-500">{correctCount}</p>
                                <p className="text-sm text-slate-500">Corretas</p>
                            </div>
                        </div>
                    </div>

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
                    <Hearts hearts={hearts} />
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
                        {status === "none" && (
                            <>
                                <Button variant="ghost" onClick={handleExit}>
                                    Saltar
                                </Button>
                                <Button
                                    variant="primary"
                                    disabled={selectedOption === null || isPending}
                                    onClick={handleCheck}
                                >
                                    Verificar
                                </Button>
                            </>
                        )}

                        {status === "correct" && (
                            <>
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
                            </>
                        )}

                        {status === "wrong" && (
                            <>
                                <div className="flex items-center gap-x-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500">
                                        <span className="text-white">✗</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-rose-600">Incorreto!</p>
                                        <p className="text-sm text-rose-500">
                                            Resposta correta:{" "}
                                            {options.find((o) => o.correct)?.text}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="danger" onClick={handleContinue} disabled={isPending}>
                                    {hearts === 0 ? "Terminar" : "Continuar"}
                                </Button>
                            </>
                        )}
                    </div>
                </footer>
            </div>
        </>
    );
};

