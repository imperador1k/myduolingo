"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const ChallengeOption = ({
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
                    {/* Image placeholder */}
                    <div className="flex h-full w-full items-center justify-center text-2xl">
                        🖼️
                    </div>
                </div>
            )}
            <span className="font-bold">{text}</span>
        </button>
    );
};

// Mock challenge data - in production this comes from Supabase
const MOCK_CHALLENGES = [
    {
        id: 1,
        question: "Como se diz 'Hello' em Português?",
        type: "SELECT" as const,
        options: [
            { id: 1, text: "Olá", correct: true },
            { id: 2, text: "Tchau", correct: false },
            { id: 3, text: "Obrigado", correct: false },
            { id: 4, text: "Por favor", correct: false },
        ],
    },
    {
        id: 2,
        question: "Qual é a tradução de 'Goodbye'?",
        type: "SELECT" as const,
        options: [
            { id: 5, text: "Olá", correct: false },
            { id: 6, text: "Tchau", correct: true },
            { id: 7, text: "Bom dia", correct: false },
            { id: 8, text: "Boa noite", correct: false },
        ],
    },
    {
        id: 3,
        question: "Como se diz 'Thank you'?",
        type: "SELECT" as const,
        options: [
            { id: 9, text: "De nada", correct: false },
            { id: 10, text: "Desculpa", correct: false },
            { id: 11, text: "Obrigado", correct: true },
            { id: 12, text: "Com licença", correct: false },
        ],
    },
];

export default function LessonPage() {
    const router = useRouter();
    const [hearts, setHearts] = useState(5);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");

    const challenges = MOCK_CHALLENGES;
    const currentChallenge = challenges[currentIndex];
    const progress = ((currentIndex) / challenges.length) * 100;

    // Play sound feedback
    const playSound = (type: "correct" | "wrong") => {
        // Using Web Audio API for simple beep sounds
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
    };

    const handleSelect = (optionId: number) => {
        if (status !== "none") return;
        setSelectedOption(optionId);
    };

    const handleCheck = () => {
        if (selectedOption === null) return;

        const selectedOpt = currentChallenge.options.find(
            (opt) => opt.id === selectedOption
        );

        if (selectedOpt?.correct) {
            setStatus("correct");
            playSound("correct");
        } else {
            setStatus("wrong");
            setHearts((prev) => Math.max(0, prev - 1));
            playSound("wrong");
        }
    };

    const handleContinue = () => {
        if (hearts === 0) {
            // Game over - redirect to learn page
            router.push("/learn");
            return;
        }

        if (currentIndex < challenges.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
            setStatus("none");
        } else {
            // Lesson complete!
            router.push("/learn");
        }
    };

    const handleExit = () => {
        router.push("/learn");
    };

    return (
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
                    {currentChallenge.options.map((option) => (
                        <ChallengeOption
                            key={option.id}
                            id={option.id}
                            text={option.text}
                            selected={selectedOption === option.id}
                            disabled={status !== "none"}
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
                                disabled={selectedOption === null}
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
                                    Correto!
                                </span>
                            </div>
                            <Button variant="primary" onClick={handleContinue}>
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
                                        {currentChallenge.options.find((o) => o.correct)?.text}
                                    </p>
                                </div>
                            </div>
                            <Button variant="danger" onClick={handleContinue}>
                                {hearts === 0 ? "Terminar" : "Continuar"}
                            </Button>
                        </>
                    )}
                </div>
            </footer>
        </div>
    );
}
