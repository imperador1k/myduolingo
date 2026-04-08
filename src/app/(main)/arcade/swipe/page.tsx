"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { VOCAB_DICTIONARY } from "@/constants/dictionary";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { Zap, X, Check, Flame, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { addArcadePoints } from "@/actions/user-progress";

type CardData = {
    id: string;
    pt: string; // The PT word
    displayEn: string; // The displayed En word (might be fake)
    isCorrect: boolean;
};

const GAME_TIME = 60; // seconds

export default function VocabularySwipe() {
    const router = useRouter();
    const { playClick, playReward, playPop, playFahh } = useUISounds();

    const [status, setStatus] = useState<'playing' | 'gameover'>('playing');
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [deck, setDeck] = useState<CardData[]>([]);
    
    // UI Feedback ('correct', 'wrong', null)
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const controls = useAnimation();

    // 1. Generation Engine
    const generateDeck = useCallback((amount = 10) => {
        const newCards: CardData[] = [];
        for (let i = 0; i < amount; i++) {
            const randomSource = VOCAB_DICTIONARY[Math.floor(Math.random() * VOCAB_DICTIONARY.length)];
            const isCorrect = Math.random() > 0.5;
            
            let displayEn = randomSource.en;

            if (!isCorrect) {
                // Find a fake in the same category
                const fakes = VOCAB_DICTIONARY.filter(w => w.category === randomSource.category && w.en !== randomSource.en);
                if (fakes.length > 0) {
                    displayEn = fakes[Math.floor(Math.random() * fakes.length)].en;
                } else {
                    // Fallback to any random fake if no peers in category
                    const allFakes = VOCAB_DICTIONARY.filter(w => w.en !== randomSource.en);
                    displayEn = allFakes[Math.floor(Math.random() * allFakes.length)].en;
                }
            }

            newCards.push({
                id: Math.random().toString(36).substring(7),
                pt: randomSource.pt,
                displayEn,
                isCorrect
            });
        }
        return newCards;
    }, []);

    // Initial load
    useEffect(() => {
        setDeck(generateDeck(20));
    }, [generateDeck]);

    // Timer logic
    useEffect(() => {
        if (status !== 'playing') return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setStatus('gameover');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [status]);

    // Top up deck if it gets low
    useEffect(() => {
        if (deck.length < 5 && status === 'playing') {
            setDeck(prev => [...generateDeck(20), ...prev]);
        }
    }, [deck.length, status, generateDeck]);

    // Mechanics
    const handleSwipe = useCallback(async (dir: 'left' | 'right') => {
        if (deck.length === 0 || status !== 'playing') return;
        
        const swipedCard = deck[deck.length - 1];
        
        // Right = True, Left = False
        const answerTrue = dir === 'right';
        const correct = answerTrue === swipedCard.isCorrect;

        if (correct) {
            playReward();
            setFeedback('correct');
            setScore(prev => prev + 1);
            setCombo(prev => prev + 1);
            
            if (combo >= 2 && combo % 5 === 0) {
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.8 },
                    colors: ['#58CC02', '#FFC800']
                });
            }

            // Sync with backend async
            addArcadePoints(1).catch(console.error);

        } else {
            playFahh();
            setFeedback('wrong');
            setCombo(0);
        }

        setTimeout(() => setFeedback(null), 300);

        setDeck(prev => prev.slice(0, -1));

    }, [deck, combo, playReward, playFahh, status]);

    const triggerManualSwipe = async (dir: 'left' | 'right') => {
        // Animate out then handle logic
        playClick();
        await controls.start({ x: dir === 'left' ? -300 : 300, opacity: 0, transition: { duration: 0.2 } });
        controls.set({ x: 0, opacity: 1 });
        handleSwipe(dir);
    };


    if (status === 'gameover') {
        return (
            <div className="max-w-md mx-auto py-10 px-4 min-h-[85vh] flex flex-col justify-center items-center">
                <div className="bg-amber-100 border-2 border-amber-300 border-b-8 rounded-3xl p-8 w-full flex flex-col items-center">
                    <Trophy className="h-20 w-20 text-amber-500 fill-amber-300 mb-6 drop-shadow-md" />
                    <h1 className="text-4xl font-black text-amber-700 uppercase mb-2">Tempo Esgotado!</h1>
                    <p className="font-bold text-amber-600/80 mb-8">Bom treino reflexo!</p>
                    
                    <div className="bg-white rounded-2xl w-full p-6 flex flex-col items-center border-2 border-amber-200 border-b-4 mb-8">
                        <span className="text-stone-400 font-bold uppercase tracking-wider text-sm mb-2">Pontuação Total</span>
                        <span className="text-6xl font-black text-amber-500">{score}</span>
                    </div>

                    <button
                        onClick={() => router.push('/arcade')}
                        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-xl uppercase tracking-widest rounded-2xl border-2 border-amber-600 border-b-8 active:border-b-2 active:translate-y-[6px] transition-all"
                    >
                        Voltar ao Arcade
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "max-w-xl mx-auto py-6 px-4 flex flex-col min-h-[85vh] transition-colors duration-300",
            feedback === 'correct' ? "bg-emerald-50/50" : feedback === 'wrong' ? "bg-rose-50/50" : "bg-transparent"
        )}>
            
            {/* Header: Timer & Combo */}
            <div className="flex items-center justify-between mb-8 px-2">
                <button 
                    onClick={() => router.push('/arcade')}
                    className="text-stone-400 hover:text-stone-600 font-bold uppercase text-sm tracking-wider"
                >
                    &larr; Sair
                </button>
                <div className="flex gap-3">
                    <div className="flex flex-col items-center bg-stone-100 px-4 py-2 rounded-2xl border-2 border-stone-200">
                        <span className="text-[10px] font-black text-stone-400 uppercase">Tempo</span>
                        <span className={cn("font-black text-xl", timeLeft <= 10 ? "text-rose-500 animate-pulse" : "text-stone-600")}>
                            {timeLeft}s
                        </span>
                    </div>
                    {combo > 1 && (
                        <div className="flex flex-col items-center bg-orange-100 px-4 py-2 rounded-2xl border-2 border-orange-200 animate-in zoom-in">
                            <span className="text-[10px] font-black text-orange-400 uppercase flex items-center gap-1">
                                <Flame className="h-3 w-3 fill-orange-400" /> Combo
                            </span>
                            <span className="font-black text-xl text-orange-500">
                                x{combo}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* The Deck Area */}
            <div className="flex-1 relative flex items-center justify-center min-h-[400px]">
                <AnimatePresence>
                    {deck.slice(-3).map((card, idx, arr) => {
                        const isTop = idx === arr.length - 1;
                        const offsetIndex = arr.length - 1 - idx; // 0 for top, 1 for second, 2 for third
                        
                        return (
                            <motion.div
                                key={card.id}
                                className={cn(
                                    "absolute bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] w-72 md:w-80 h-96 shadow-xl flex flex-col p-6 overflow-hidden",
                                    isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
                                )}
                                style={{ 
                                    zIndex: idx,
                                }}
                                initial={{ scale: 0.8, y: 40, opacity: 0 }}
                                animate={{ 
                                    scale: isTop ? 1 : 1 - (offsetIndex * 0.05), 
                                    y: isTop ? 0 : offsetIndex * 15,
                                    opacity: 1
                                }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                drag={isTop ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={(e, info) => {
                                    if (info.offset.x > 100) handleSwipe('right');
                                    else if (info.offset.x < -100) handleSwipe('left');
                                }}
                                whileDrag={{ rotate: 5, scale: 1.05 }}
                            >
                            {/* Visual Feedback Overlays on Drag */}
                            <div className="absolute inset-0 bg-emerald-400 opacity-0 transition-opacity flex items-center justify-center -z-0" id="right-indicator"></div>
                            <div className="absolute inset-0 bg-rose-400 opacity-0 transition-opacity flex items-center justify-center -z-0" id="left-indicator"></div>

                            <div className="flex-1 flex items-center justify-center z-10 w-full text-center">
                                <h2 className="text-4xl md:text-5xl font-black text-[#1CB0F6] uppercase tracking-tight break-words">
                                    {card.displayEn}
                                </h2>
                            </div>
                            
                            <div className="w-full h-1 bg-stone-100 rounded-full my-4 z-10" />
                            
                            <div className="flex-1 flex items-center justify-center z-10 w-full text-center">
                                <h2 className="text-2xl md:text-3xl font-black text-stone-600 break-words">
                                    {card.pt}
                                </h2>
                            </div>
                        </motion.div>
                    );
                })}
                </AnimatePresence>
            </div>

            {/* Manual Controls */}
            <div className="mt-8 flex items-center justify-center gap-6 pb-6 z-10 relative">
                <button 
                    onClick={() => triggerManualSwipe('left')}
                    className="h-20 w-20 rounded-full bg-white border-2 border-stone-200 border-b-8 active:border-b-2 active:translate-y-[6px] hover:bg-rose-50 flex items-center justify-center transition-all group shadow-sm"
                >
                    <X className="h-10 w-10 text-rose-500 group-hover:scale-110 transition-transform" strokeWidth={3} />
                </button>

                <button 
                    onClick={() => triggerManualSwipe('right')}
                    className="h-20 w-20 rounded-full bg-white border-2 border-stone-200 border-b-8 active:border-b-2 active:translate-y-[6px] hover:bg-emerald-50 flex items-center justify-center transition-all group shadow-sm"
                >
                    <Check className="h-10 w-10 text-emerald-500 group-hover:scale-110 transition-transform" strokeWidth={3} />
                </button>
            </div>

            {/* Instruction Footer */}
            <div className="text-center">
                <p className="text-stone-400 font-bold text-sm tracking-wide">
                    Mentira (Esquerda) <span className="mx-2">&bull;</span> Verdade (Direita)
                </p>
            </div>
            
        </div>
    );
}
