"use client";

import { useState, useCallback, useTransition, useEffect, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { updateWordStrength, getAIHint } from "@/actions/vocabulary";
import {
    Activity,
    Eye,
    Sparkles,
    Loader2,
    ArrowLeft,
    Wand2,
    Dumbbell,
    Link as LinkIcon,
    Swords,
} from "lucide-react";
import { toast } from "sonner";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { HappyStarLottie } from "@/components/ui/lottie-animation";

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

    // Dojo Mode State
    const [options, setOptions] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // UI Sounds
    const { playReward, playWhoosh, playClick } = useUISounds();

    const currentCard = deck[currentIndex];
    const progress = deck.length > 0 ? ((currentIndex) / deck.length) * 100 : 0;

    // Generate Multiple Choice Options
    useEffect(() => {
        if (!currentCard) return;
        
        const answer = currentCard.translation;
        const others = words.filter(c => c.translation !== answer).map(c => c.translation);
        
        // Shuffle and pick up to 3 distractors
        const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
        const distractors = Array.from(new Set(shuffledOthers)).slice(0, 3);
        
        // Ensure we always have 3 distractors (pad with generic options if deck is too small)
        const fillerWords = ["Incrível", "Desconhecido", "Rápido", "Lento", "Forte", "Triste", "Feliz", "Zangado"];
        let fillerIndex = 0;
        while (distractors.length < 3) {
            const filler = fillerWords[fillerIndex % fillerWords.length];
            if (!distractors.includes(filler) && filler !== answer) {
                distractors.push(filler);
            }
            fillerIndex++;
        }
        
        // Combine and shuffle
        const allOptions = [answer, ...distractors].sort(() => 0.5 - Math.random());
        setOptions(allOptions);
        setIsRevealed(false);
        setFeedback('idle');
        setSelectedOption(null);
    }, [currentIndex, currentCard, words]);

    const animateAndNext = useCallback(
        (direction: "left" | "right") => {
            setSlideDirection(direction);
            setTimeout(() => {
                setSlideDirection(null);
                setIsRevealed(false);
                setHint(null);
                setFeedback('idle');
            }, 300);
        },
        []
    );

    const handleSelectOption = useCallback((option: string) => {
        if (!currentCard || feedback !== 'idle' || isPending) return;

        setSelectedOption(option);
        const isCorrect = option === currentCard.translation;

        if (isCorrect) {
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
            setFeedback('wrong');
            setIsRevealed(true); // Reveal the back of the card automatically on error
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
            }, 3000); // Wait longer so they can read the explanation
        }
    }, [currentCard, currentIndex, deck.length, feedback, playReward, playWhoosh, startTransition, animateAndNext]);

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

    // â•â•â•â•â•â•â•â•â•â•â• FINISHED SCREEN â•â•â•â•â•â•â•â•â•â•â•
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

    // â•â•â•â•â•â•â•â•â•â•â• GAME SCREEN â•â•â•â•â•â•â•â•â•â•â•
    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4 pb-8">
            {/* â”€â”€ Header â”€â”€ */}
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
            <div className="w-full h-4 bg-stone-200 rounded-full mb-8 overflow-hidden shadow-inner border-2 border-stone-300">
                <div
                    className="h-full bg-[#58CC02] border-t-4 border-white/30 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
                </div>
            </div>

            {/* ── AI Hint Box ── */}
            {hint && (
                <div className="w-full mb-4 animate-in fade-in slide-in-from-top-4 duration-300 z-10">
                    <div className="bg-sky-50 border-2 border-sky-200 border-b-[4px] rounded-[16px] p-4 flex items-start gap-3 shadow-sm">
                        <Wand2 className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                        <p className="text-sm font-bold text-sky-800 leading-relaxed">
                            {hint}
                        </p>
                    </div>
                </div>
            )}

            {/* ── The Card ── */}
            <div
                className={cn(
                    "w-full rounded-[32px] border-2 shadow-sm transition-all duration-300 ease-out relative overflow-hidden",
                    isRevealed
                        ? "bg-slate-50 border-emerald-200 border-b-[8px]"
                        : "bg-white border-stone-200 border-b-[8px]",
                    slideDirection === "right" && "translate-x-[120%] rotate-6 opacity-0",
                    slideDirection === "left" && "-translate-x-[120%] -rotate-6 opacity-0"
                )}
            >
                <div className="flex flex-col items-center justify-center text-center h-full p-6 md:p-8">
                    {!isRevealed ? (
                        /* ── QUESTION VIEW (DOJO) ── */
                        <div className="flex flex-col items-center w-full animate-in fade-in duration-200">
                            
                            {/* The Challenge Word */}
                            <h2 className="text-4xl md:text-5xl font-black text-slate-800 break-words hyphens-auto leading-tight mb-2">
                                {currentCard.word}
                            </h2>

                            {/* CENA DO CONTEXTO BLOCK (FIXED UX) */}
                            {currentCard.contextSentence && (
                                <div className="w-full bg-stone-50 border-2 border-stone-100 border-b-[4px] rounded-[16px] p-4 mb-6 shadow-sm mt-4 text-left relative">
                                    <div className="absolute top-0 right-4 -translate-y-1/2 bg-sky-500 text-white px-3 py-1 rounded-full border-2 border-sky-600 shadow-sm flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">Contexto</span>
                                    </div>
                                    <p className="text-[15px] font-bold text-stone-600 italic leading-relaxed break-words">
                                        &quot;{currentCard.contextSentence.replace(
                                            new RegExp(`\\b${currentCard.word}\\b`, "gi"),
                                            "_______"
                                        )}&quot;
                                    </p>
                                </div>
                            )}

                            {/* Multiple Choice Arcade Buttons */}
                            <div className="flex flex-col gap-3 w-full mt-2">
                                {options.map((option, idx) => {
                                    const isSelected = selectedOption === option;
                                    const isCorrectOpt = option === currentCard.translation;
                                    
                                    let btnStyle = "bg-white text-stone-600 border-stone-200 border-b-[6px] hover:bg-stone-50 hover:translate-y-[2px] hover:border-b-[4px] active:translate-y-[6px] active:border-b-0";
                                    
                                    if (feedback !== 'idle') {
                                        if (isCorrectOpt) {
                                            btnStyle = "bg-[#58CC02] text-white border-[#46a302] border-b-[6px] scale-105 z-10 shadow-lg"; // Highlight right answer
                                        } else if (isSelected && !isCorrectOpt) {
                                            btnStyle = "bg-rose-500 text-white border-rose-600 border-b-[2px] translate-y-[4px]"; // Pressed wrong
                                        } else {
                                            btnStyle = "bg-stone-100 text-stone-400 border-stone-200 border-b-[2px] opacity-50"; // Dim others
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(option)}
                                            disabled={feedback !== 'idle' || isPending}
                                            className={cn(
                                                "w-full flex items-center justify-between p-5 rounded-[20px] border-2 transition-all font-black text-lg",
                                                btnStyle
                                            )}
                                        >
                                            <span className="text-left w-full truncate">{option}</span>
                                            {feedback !== 'idle' && isCorrectOpt && <Sparkles className="w-6 h-6 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Extra Help Controls (Hint & Reveal Back) */}
                            <div className="flex items-center gap-3 mt-6 w-full opacity-60 hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setIsRevealed(true); setFeedback('wrong'); }}
                                    className="flex-[2] flex items-center justify-center gap-2 font-bold px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-500 transition-all border-b-4 border-stone-200 active:translate-y-1 active:border-b-0"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>Não sei</span>
                                </button>
                                <button
                                    onClick={handleGetHint}
                                    disabled={isLoadingHint || !!hint}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 font-bold px-4 py-3 rounded-xl transition-all border-b-4",
                                        hint
                                            ? "bg-sky-50 border-sky-200 text-sky-400 cursor-default"
                                            : "bg-sky-100 hover:bg-sky-200 border-sky-200 text-sky-600 active:translate-y-1 active:border-b-0"
                                    )}
                                >
                                    {isLoadingHint ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Wand2 className="h-4 w-4" />
                                            <span>Dica</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ── ANSWER VIEW (BACK OF FLASHCARD - ONLY SHOWN ON "NÃO SEI" OR WRONG) ── */
                        <div className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-rose-100 text-rose-500 px-4 py-2 rounded-2xl border-b-4 border-rose-200 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                <Swords className="w-5 h-5" />
                                Continuamos a praticar
                            </div>

                            {/* Original word */}
                            <p className="text-xl font-bold text-slate-400 uppercase tracking-wider mt-4">
                                {currentCard.word}
                            </p>

                            {/* Translation */}
                            <h2 className="text-4xl md:text-5xl font-black text-[#58CC02] break-words hyphens-auto leading-tight mb-2">
                                {currentCard.translation}
                            </h2>

                            {/* Explanation */}
                            {currentCard.explanation && (
                                <p className="text-base font-bold text-slate-500 leading-relaxed max-w-lg mb-4">
                                    {currentCard.explanation}
                                </p>
                            )}

                            {/* Content Sentence (REPEATED) */}
                            {currentCard.contextSentence && (
                                <div className="w-full bg-white border-2 border-stone-100 border-b-[4px] rounded-[16px] p-4 text-left relative mt-2 shadow-sm">
                                    <div className="absolute top-0 right-4 -translate-y-1/2 bg-sky-500 text-white px-3 py-1 rounded-full border-2 border-sky-600 shadow-sm flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">Contexto Completo</span>
                                    </div>
                                    <p className="text-[15px] font-bold text-sky-700 italic leading-relaxed break-words">
                                        &quot;{currentCard.contextSentence.split(new RegExp(`(${currentCard.word})`, 'gi')).map((part, i) => 
                                            part.toLowerCase() === currentCard.word.toLowerCase() 
                                                ? <strong key={i} className="font-black bg-sky-100 px-1 rounded mx-0.5 text-sky-800 border-b-2 border-sky-200">{part}</strong> 
                                                : part
                                        )}&quot;
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => {
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
                                }}
                                disabled={isPending}
                                className="w-full mt-6 flex flex-col items-center justify-center gap-1 font-black text-xl px-8 py-5 rounded-[24px] bg-[#1CB0F6] text-white border-2 border-transparent border-b-[6px] border-b-[#0092d6] shadow-sm hover:translate-y-[2px] hover:border-b-[4px] active:translate-y-[6px] active:border-b-0 transition-all duration-150"
                            >
                                CONTINUAR
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

