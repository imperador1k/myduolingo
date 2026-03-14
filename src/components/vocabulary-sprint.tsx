"use client";

import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { updateWordStrength, getAIHint } from "@/actions/vocabulary";
import {
    Eye,
    ThumbsDown,
    ThumbsUp,
    Sparkles,
    Loader2,
    ArrowLeft,
    Wand2,
    Dumbbell,
    Keyboard,
} from "lucide-react";
import { toast } from "sonner";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { HappyStarLottie } from "@/components/lottie-animation";

interface WordEntry {
    id: number;
    word: string;
    translation: string;
    explanation: string;
    contextSentence: string | null;
    language: string | null;
    strength: number;
}

interface VocabularySprintProps {
    words: WordEntry[];
    language?: string;
}

export const VocabularySprint = ({ words, language }: VocabularySprintProps) => {
    const [deck, setDeck] = useState<WordEntry[]>([...words]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [hint, setHint] = useState<string | null>(null);
    const [isLoadingHint, setIsLoadingHint] = useState(false);
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [stats, setStats] = useState({ remembered: 0, forgot: 0 });
    const [isPending, startTransition] = useTransition();

    // Typing Mode State
    const [mode, setMode] = useState<'swipe' | 'type'>('swipe');
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

    // UI Sounds
    const { playReward, playWhoosh, playClick } = useUISounds();

    const currentCard = deck[currentIndex];
    const progress = deck.length > 0 ? ((currentIndex) / deck.length) * 100 : 0;

    const animateAndNext = useCallback(
        (direction: "left" | "right") => {
            setSlideDirection(direction);
            setTimeout(() => {
                setSlideDirection(null);
                setIsRevealed(false);
                setHint(null);
                setUserInput('');
                setFeedback('idle');
            }, 300);
        },
        []
    );

    const handleKnewIt = useCallback(() => {
        if (!currentCard || isPending) return;

        setStats((prev) => ({ ...prev, remembered: prev.remembered + 1 }));
        playReward();
        animateAndNext("right");

        startTransition(async () => {
            try {
                await updateWordStrength(currentCard.id, true);
            } catch {
                toast.error("Erro ao atualizar força da palavra.");
            }
        });

        setTimeout(() => {
            const nextIndex = currentIndex + 1;
            if (nextIndex >= deck.length) {
                setIsFinished(true);
            } else {
                setCurrentIndex(nextIndex);
            }
        }, 300);
    }, [currentCard, currentIndex, deck.length, animateAndNext, isPending, startTransition, playReward]);

    const handleForgot = useCallback(() => {
        if (!currentCard || isPending) return;

        setStats((prev) => ({ ...prev, forgot: prev.forgot + 1 }));
        playWhoosh();
        animateAndNext("left");

        startTransition(async () => {
            try {
                await updateWordStrength(currentCard.id, false);
            } catch {
                toast.error("Erro ao atualizar força da palavra.");
            }
        });

        // Move this card to the end of the deck so user sees it again
        setTimeout(() => {
            setDeck((prev) => {
                const newDeck = [...prev];
                const card = newDeck[currentIndex];
                newDeck.push(card);
                return newDeck;
            });
            setCurrentIndex((prev) => prev + 1);
        }, 300);
    }, [currentCard, currentIndex, animateAndNext, isPending, startTransition, playWhoosh]);

    const handleVerifyTyping = useCallback(() => {
        if (!currentCard || feedback !== 'idle' || !userInput.trim() || isPending) return;

        const cleanString = (str: string) => str.trim().toLowerCase().replace(/[.,!?;:]/g, "");
        const actual = cleanString(userInput);
        const expected = cleanString(currentCard.translation);

        if (actual === expected) {
            // Correct
            setFeedback('correct');
            playReward();
            setStats((prev) => ({ ...prev, remembered: prev.remembered + 1 }));

            startTransition(async () => {
                try { await updateWordStrength(currentCard.id, true); } catch {}
            });

            setTimeout(() => {
                animateAndNext("right");
                setTimeout(() => {
                    const nextIndex = currentIndex + 1;
                    if (nextIndex >= deck.length) setIsFinished(true);
                    else setCurrentIndex(nextIndex);
                }, 300);
            }, 1000);
        } else {
            // Wrong
            setFeedback('wrong');
            playWhoosh();
            setStats((prev) => ({ ...prev, forgot: prev.forgot + 1 }));

            startTransition(async () => {
                try { await updateWordStrength(currentCard.id, false); } catch {}
            });

            setTimeout(() => {
                animateAndNext("left");
                setTimeout(() => {
                    setDeck((prev) => {
                        const newDeck = [...prev];
                        const card = newDeck[currentIndex];
                        newDeck.push(card);
                        return newDeck;
                    });
                    setCurrentIndex((prev) => prev + 1);
                }, 300);
            }, 2000);
        }
    }, [currentCard, currentIndex, deck.length, feedback, userInput, playReward, playWhoosh, startTransition, animateAndNext]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleVerifyTyping();
    };

    const handleGetHint = async () => {
        if (!currentCard || isLoadingHint) return;
        setIsLoadingHint(true);
        try {
            const result = await getAIHint(currentCard.word, currentCard.language || "English");
            setHint(result.hint);
        } catch {
            toast.error("Erro ao gerar dica.");
        } finally {
            setIsLoadingHint(false);
        }
    };

    // ═══════════ FINISHED SCREEN ═══════════
    if (isFinished) {
        const total = stats.remembered + stats.forgot;
        const accuracy = total > 0 ? Math.round((stats.remembered / total) * 100) : 0;

        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in fade-in zoom-in-95 duration-500">
                {/* Lottie Animation */}
                <div className="mb-6 w-48 h-48 relative">
                    <HappyStarLottie className="w-full h-full drop-shadow-2xl" />
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2">
                    Treino Completo! 💪
                </h1>
                <p className="text-lg text-slate-500 font-medium mb-8">
                    Treinaste {words.length} palavras nesta sessão.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-10">
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                        <p className="text-3xl font-black text-emerald-600">{stats.remembered}</p>
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mt-1">Lembrei</p>
                    </div>
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                        <p className="text-3xl font-black text-red-500">{stats.forgot}</p>
                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mt-1">Esqueci</p>
                    </div>
                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4">
                        <p className="text-3xl font-black text-indigo-600">{accuracy}%</p>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mt-1">Precisão</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Link
                        href="/vocabulary"
                        className="flex-1 flex items-center justify-center gap-2 font-bold text-lg px-6 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Cofre
                    </Link>
                    <Link
                        href="/practice/vocabulary"
                        className="flex-1 flex items-center justify-center gap-2 font-bold text-lg px-6 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-all active:scale-95"
                    >
                        <Dumbbell className="h-5 w-5" />
                        Treinar Outra Vez
                    </Link>
                </div>
            </div>
        );
    }

    if (!currentCard) return null;

    // ═══════════ GAME SCREEN ═══════════
    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 pb-8">
            {/* ── Header ── */}
            <div className="flex items-center justify-between w-full mb-6">
                <Link
                    href="/vocabulary"
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Dumbbell className="h-4 w-4 text-indigo-500" />
                    <span>Sprint{language ? `: ${language}` : ""}</span>
                </div>
                <span className="text-sm font-bold text-slate-400 tabular-nums">
                    {currentIndex + 1} / {deck.length}
                </span>
            </div>

            {/* ── Progress Bar ── */}
            <div className="w-full h-3 bg-slate-100 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* ── AI Hint Box ── */}
            {hint && (
                <div className="w-full mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-2 border-violet-200 rounded-2xl p-4 flex items-start gap-3">
                        <Wand2 className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-violet-800 leading-relaxed">
                            {hint}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Mode Toggle ── */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6 font-bold text-sm w-full max-w-sm">
                <button
                    onClick={() => setMode('swipe')}
                    className={cn(
                        "flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2",
                        mode === 'swipe' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Eye className="h-4 w-4" /> Rápido
                </button>
                <button
                    onClick={() => setMode('type')}
                    className={cn(
                        "flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2",
                        mode === 'type' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <Keyboard className="h-4 w-4" /> Escrita
                </button>
            </div>

            {/* ── The Card ── */}
            <div
                className={cn(
                    "w-full min-h-[360px] md:min-h-[420px] rounded-3xl border-2 shadow-lg transition-all duration-300 ease-out relative overflow-hidden",
                    isRevealed
                        ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                        : "bg-white border-slate-200",
                    slideDirection === "right" && "translate-x-[120%] rotate-6 opacity-0",
                    slideDirection === "left" && "-translate-x-[120%] -rotate-6 opacity-0"
                )}
            >
                {/* Language Badge */}
                {currentCard.language && (
                    <div className="absolute top-5 right-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100/80 text-slate-400 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            {currentCard.language}
                        </span>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center text-center h-full p-8 md:p-12">
                    {!isRevealed ? (
                        /* ── QUESTION VIEW ── */
                        <div className="flex flex-col items-center w-full animate-in fade-in duration-200">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-800 break-words hyphens-auto leading-tight mb-4">
                                {currentCard.word}
                            </h2>

                            {currentCard.contextSentence && (
                                <p className="text-base md:text-lg text-slate-400 italic leading-relaxed max-w-lg break-words mb-2">
                                    &quot;{currentCard.contextSentence.replace(
                                        new RegExp(`\\b${currentCard.word}\\b`, "gi"),
                                        "_______"
                                    )}&quot;
                                </p>
                            )}

                            {mode === "swipe" ? (
                                <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-sm">
                                    <button
                                        onClick={() => setIsRevealed(true)}
                                        className="flex-1 w-full flex items-center justify-center gap-2 font-bold text-lg px-6 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-all active:scale-95"
                                    >
                                        <Eye className="h-5 w-5" />
                                        Revelar Resposta
                                    </button>
                                    <button
                                        onClick={handleGetHint}
                                        disabled={isLoadingHint || !!hint}
                                        className={cn(
                                            "w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-5 py-4 rounded-xl border-2 transition-all active:scale-95",
                                            hint
                                                ? "bg-violet-50 border-violet-200 text-violet-400 cursor-default"
                                                : "bg-white hover:bg-violet-50 border-violet-300 text-violet-600 hover:border-violet-400"
                                        )}
                                    >
                                        {isLoadingHint ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Wand2 className="h-4 w-4" />
                                                <span className="text-sm">Dica</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* TYPE MODE INPUT */
                                <div className="flex flex-col gap-4 mt-6 w-full max-w-sm">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={feedback !== 'idle' || isPending}
                                        placeholder="Traduzir..."
                                        className={cn(
                                            "w-full text-center text-xl font-bold rounded-2xl border-4 p-5 transition-all outline-none md:text-2xl",
                                            feedback === 'idle' && "border-slate-200 focus:border-indigo-400 bg-slate-50 text-slate-700",
                                            feedback === 'correct' && "border-emerald-400 bg-emerald-50 text-emerald-600 shadow-inner",
                                            feedback === 'wrong' && "border-red-400 bg-red-50 text-red-600 shadow-inner"
                                        )}
                                        autoFocus
                                    />
                                    {feedback === 'wrong' && (
                                        <div className="text-center animate-in slide-in-from-top-2">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">A resposta certa é:</p>
                                            <p className="text-2xl font-black text-emerald-500 mt-1">{currentCard.translation}</p>
                                        </div>
                                    )}
                                    {feedback === 'idle' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleVerifyTyping}
                                                disabled={!userInput.trim()}
                                                className="flex-1 flex items-center justify-center gap-2 font-bold text-lg px-6 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                            >
                                                Verificar
                                            </button>
                                            <button
                                                onClick={handleGetHint}
                                                disabled={isLoadingHint || !!hint}
                                                className={cn(
                                                    "flex flex-col items-center justify-center font-bold px-4 rounded-xl border-2 transition-all active:scale-95",
                                                    hint
                                                        ? "bg-violet-50 border-violet-200 text-violet-400 cursor-default"
                                                        : "bg-white hover:bg-violet-50 border-violet-300 text-violet-600 hover:border-violet-400"
                                                )}
                                            >
                                                {isLoadingHint ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    )}
                                    {feedback === 'correct' && (
                                        <div className="w-full flex items-center justify-center gap-2 font-black text-lg px-6 py-4 rounded-xl bg-emerald-100 text-emerald-700 animate-in zoom-in-95">
                                            <Sparkles className="h-5 w-5" /> Excelente!
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ── ANSWER VIEW ── */
                        <div className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-300">
                            {/* Original word */}
                            <p className="text-lg font-bold text-emerald-800/60 uppercase tracking-wider">
                                {currentCard.word}
                            </p>

                            {/* Translation */}
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-emerald-400 shrink-0" />
                                <h2 className="text-3xl md:text-4xl font-black text-emerald-600 break-words hyphens-auto leading-tight">
                                    {currentCard.translation}
                                </h2>
                            </div>

                            {/* Explanation */}
                            {currentCard.explanation && (
                                <p className="text-base text-emerald-800/70 leading-relaxed max-w-lg">
                                    {currentCard.explanation}
                                </p>
                            )}

                            {/* Context Sentence */}
                            {currentCard.contextSentence && (
                                <p className="text-sm text-emerald-700/50 italic max-w-lg mt-1">
                                    &quot;{currentCard.contextSentence}&quot;
                                </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 mt-6 w-full max-w-md">
                                <button
                                    onClick={handleForgot}
                                    disabled={isPending}
                                    className="flex-1 flex items-center justify-center gap-2 font-bold text-lg px-6 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <ThumbsDown className="h-5 w-5" />
                                    Esqueci
                                </button>
                                <button
                                    onClick={handleKnewIt}
                                    disabled={isPending}
                                    className="flex-1 flex items-center justify-center gap-2 font-bold text-lg px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <ThumbsUp className="h-5 w-5" />
                                    Lembrei!
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
