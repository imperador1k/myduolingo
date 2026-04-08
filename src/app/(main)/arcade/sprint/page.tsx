"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { VOCAB_DICTIONARY } from "@/constants/dictionary";
import { cn } from "@/lib/utils";
import { Heart, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { addArcadePoints } from "@/actions/user-progress";

type GameStatus = 'playing' | 'correct' | 'wrong';

type WordData = {
    pt: string;
    en: string;
};

export default function VocabularySprint() {
    const router = useRouter();
    const { playClick, playReward, playPop, playFahh } = useUISounds();
    
    // Game State
    const [score, setScore] = useState(0);
    const [currentWord, setCurrentWord] = useState<WordData | null>(null);
    const [inputs, setInputs] = useState<string[]>([]);
    const [hintIndices, setHintIndices] = useState<number[]>([]);
    const [status, setStatus] = useState<GameStatus>('playing');
    const [isChecking, setIsChecking] = useState(false);
    
    // Refs for auto-focus
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Initialization Algorithm
    const loadNextWord = useCallback(() => {
        setStatus('playing');
        setIsChecking(false);
        const randomWord = VOCAB_DICTIONARY[Math.floor(Math.random() * VOCAB_DICTIONARY.length)];
        setCurrentWord(randomWord);
        
        const targetWord = randomWord.en;
        const length = targetWord.length;
        
        // Calculate Hints
        let hintCount = 0;
        if (length <= 3) hintCount = 0;
        else if (length <= 5) hintCount = 1;
        else hintCount = 2;

        const indices = new Set<number>();
        while (indices.size < hintCount) {
            const r = Math.floor(Math.random() * length);
            // don't hint spaces if there are any
            if (targetWord[r] !== ' ') {
                indices.add(r);
            }
        }
        
        const hintsArray = Array.from(indices);
        setHintIndices(hintsArray);

        // Pre-fill inputs array with empty strings
        const initialInputs = Array(length).fill("");
        setInputs(initialInputs);

        // Auto-focus first empty input after small delay to allow render
        setTimeout(() => {
            const firstEmpty = initialInputs.findIndex(v => v === "");
            if (firstEmpty !== -1 && inputRefs.current[firstEmpty]) {
                inputRefs.current[firstEmpty]?.focus();
            }
        }, 50);

    }, []);

    // Initial load
    useEffect(() => {
        loadNextWord();
    }, [loadNextWord]);

    const handleInputChange = (index: number, value: string) => {
        if (status !== 'playing') return;
        
        // Only accept single characters (or clear)
        const char = value.slice(-1); 
        
        const newInputs = [...inputs];
        newInputs[index] = char;
        setInputs(newInputs);

        if (char !== "") {
            // Auto-focus next input
            let nextEmpty = index + 1;
            if (nextEmpty < inputs.length) {
                inputRefs.current[nextEmpty]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && inputs[index] === "") {
            // Move focus back
            let prevEmpty = index - 1;
            if (prevEmpty >= 0) {
                inputRefs.current[prevEmpty]?.focus();
            }
        } else if (e.key === 'Enter') {
            checkAnswer();
        }
    };

    const checkAnswer = useCallback(() => {
        if (status !== 'playing' || !currentWord) return;
        
        setIsChecking(true);
        const joinedAnswers = inputs.join("").toLowerCase();
        const targetTarget = currentWord.en.toLowerCase();

        if (joinedAnswers === targetTarget) {
            setStatus('correct');
            playReward();
            setScore(prev => prev + 1);
            
            // Add 1 XP to Database
            addArcadePoints(1).catch(console.error);
            
            // Confetti
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#58CC02', '#FFC800']
            });

            setTimeout(() => {
                loadNextWord();
            }, 1000);
        } else {
            setStatus('wrong');
            playFahh();
            
            // Show correct answer by forcing it into inputs
            const correctInputs = currentWord.en.split('');
            setInputs(correctInputs);

            setTimeout(() => {
                loadNextWord();
            }, 2500);
        }
    }, [status, currentWord, inputs, playReward, playFahh, loadNextWord]);

    // Handle global Enter key
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [checkAnswer]);


    if (!currentWord) return null;

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 flex flex-col min-h-[80vh]">
            
            {/* Header: Score */}
            <div className="flex items-center justify-between mb-12">
                <button 
                    onClick={() => router.push('/arcade')}
                    className="text-stone-400 hover:text-stone-600 font-bold uppercase text-sm tracking-wider"
                >
                    &larr; Sair
                </button>
                <div className="flex items-center gap-2 bg-amber-100 text-amber-500 px-4 py-2 rounded-2xl border-2 border-amber-200 border-b-4">
                    <Zap className="h-5 w-5 fill-amber-500" />
                    <span className="font-black text-xl">{score}</span>
                </div>
            </div>

            {/* Game Content */}
            <div className="flex-1 flex flex-col items-center justify-center">
                
                {/* The PT Word */}
                <h1 className="text-3xl md:text-5xl font-black text-stone-700 text-center mb-12 tracking-tight uppercase">
                    {currentWord.pt}
                </h1>

                {/* The Input Tiles */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-16">
                    {inputs.map((char, index) => {
                        const isHint = hintIndices.includes(index);
                        const isSpace = currentWord.en[index] === ' ';
                        
                        if (isSpace) {
                            return <div key={index} className="w-4 md:w-8 h-16" />;
                        }

                        return (
                            <input
                                key={index}
                                ref={(el: any) => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={char}
                                placeholder={isHint ? currentWord.en[index].toUpperCase() : ""}
                                readOnly={status !== 'playing'}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className={cn(
                                    "w-12 h-14 md:w-16 md:h-16 text-center text-2xl md:text-3xl font-black uppercase rounded-2xl border-2 border-b-[6px] outline-none transition-all duration-200 placeholder:text-stone-300 placeholder:opacity-50",
                                    // Visual States
                                    status === 'playing'
                                        ? "border-stone-200 text-stone-700 focus:border-[#1CB0F6] focus:bg-[#ddf4ff] bg-white shadow-sm" 
                                        : "",
                                    status === 'correct' 
                                        ? "bg-[#58CC02] border-[#46a302] text-white transform scale-105" 
                                        : "",
                                    status === 'wrong' 
                                        ? "bg-rose-500 border-rose-600 text-white animate-shake" 
                                        : ""
                                )}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Bottom Action Area */}
            <div className="w-full mt-auto">
                <button
                    onClick={checkAnswer}
                    disabled={status !== 'playing' || inputs.join("").length !== currentWord.en.length}
                    className={cn(
                        "w-full py-4 rounded-2xl font-black text-xl uppercase tracking-widest transition-all border-2 border-b-8 active:border-b-2 active:translate-y-[6px]",
                        status === 'playing' 
                            ? "bg-[#58CC02] text-white border-[#46a302] hover:bg-[#46a302]" 
                            : status === 'wrong'
                                ? "bg-rose-500 text-white border-rose-600 grayscale opacity-80 cursor-not-allowed"
                                : "bg-stone-300 text-stone-500 border-stone-400 cursor-not-allowed"
                    )}
                >
                    {status === 'playing' ? "VERIFICAR" : status === 'correct' ? "EXCELENTE!" : "INCORRETO"}
                </button>
            </div>
        </div>
    );
}
