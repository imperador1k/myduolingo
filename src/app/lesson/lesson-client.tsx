"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onChallengeComplete, onChallengeWrong, onLessonComplete, onClinicComplete } from "@/actions/user-progress";
import { useTTS } from "@/hooks/use-tts";
import { useUISounds } from "@/hooks/use-ui-sounds";
import { DuoAnimationLottie, LaughingCatLottie } from "@/components/ui/lottie-animation";
import { InteractiveText } from "@/components/ui/interactive-text";
import { isAnswerAcceptable } from "@/lib/string-matching";
import { Button } from "@/components/ui/button";
import { Ear, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReviewModal } from "@/store/use-review-modal-store";

import { LessonHeader } from "./_components/header";
import { ChallengeOptionCard } from "./_components/challenge-card";
import { MatchGrid } from "./_components/match-grid";
import { ResultScreen } from "./_components/result-screen";
import { LessonFooter } from "./_components/footer";

type ChallengeOption = {
    id: number;
    text: string;
    correct: boolean;
    imageSrc: string | null;
    audioSrc: string | null;
    audioLang?: string | null;
};

export type Challenge = {
    id: number;
    question: string;
    type: "SELECT" | "ASSIST" | "INSERT" | "MATCH" | "DICTATION";
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
    const { open: openReviewModal, close: closeReviewModal } = useReviewModal();

    const [hearts, setHearts] = useState(initialHearts);
    const [points, setPoints] = useState(initialPoints);
    const [challenges, setChallenges] = useState(initialLesson.challenges);
    
    const [activeIndex, setActiveIndex] = useState(() => {
        const incompleteIndex = initialLesson.challenges.findIndex(c => !c.completed);
        return incompleteIndex === -1 ? 0 : incompleteIndex;
    });

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");
    const [showExitModal, setShowExitModal] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [showTransition, setShowTransition] = useState(false);

    // INSERT mode state
    const [inputValue, setInputValue] = useState("");
    const [typoMessage, setTypoMessage] = useState<string | null>(null);

    // MATCH mode state
    const [selectedMatchIds, setSelectedMatchIds] = useState<number[]>([]);
    const [matchedIds, setMatchedIds] = useState<number[]>([]);
    const [wrongMatchFlash, setWrongMatchFlash] = useState<number[]>([]);
    const [shuffledLeft, setShuffledLeft] = useState<ChallengeOption[]>([]);
    const [shuffledRight, setShuffledRight] = useState<ChallengeOption[]>([]);

    // Mute state
    const [isAudioMuted, setIsAudioMuted] = useState(false);

    // Streak State
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [streakDays, setStreakDays] = useState(0);

    // Stats
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [heartsLost, setHeartsLost] = useState(0);
    const [xpGained, setXpGained] = useState(0);

    const currentChallenge = challenges[activeIndex];
    const options = currentChallenge?.challengeOptions || [];
    const progress = ((activeIndex) / challenges.length) * 100;

    useEffect(() => {
        if (currentChallenge?.type === "MATCH" && currentChallenge.challengeOptions.length > 0) {
            const left = currentChallenge.challengeOptions.filter(o => o.correct).sort(() => Math.random() - 0.5);
            const right = currentChallenge.challengeOptions.filter(o => !o.correct).sort(() => Math.random() - 0.5);
            setShuffledLeft(left);
            setShuffledRight(right);
        }
    }, [activeIndex, currentChallenge?.type, currentChallenge?.challengeOptions]);

    const { playAudio, playMixedSpeech, isPlaying, playingText } = useTTS(languageCode);
    const { playWhoosh } = useUISounds();

    const playSound = (type: "correct" | "wrong" | "completed") => {
        try {
            const audioSrc = type === "correct" ? "/correct.mp3" : type === "wrong" ? "/duolingo-wrong.mp3" : "/duolingo-completed-lesson.mp3";
            const audio = new Audio(audioSrc);
            audio.play().catch(e => console.error(e));
        } catch (e) {}
    };

    const handleSelect = (optionId: number) => {
        if (status !== "none") return;
        setSelectedOption(optionId);
        if (!isAudioMuted) {
            const selectedOpt = options.find((opt) => opt.id === optionId);
            if (selectedOpt?.text) playAudio(selectedOpt.text, 0.9, selectedOpt.audioLang || languageCode);
        }
    };

    const handleCheck = () => {
        const isInsert = currentChallenge.type === "INSERT";
        const isDictation = currentChallenge.type === "DICTATION";

        if (isInsert || isDictation) {
            if (status !== "none") {
                handleContinue();
                return;
            }

            const correctText = isDictation ? currentChallenge.question : options.find((opt) => opt.correct)?.text || "";
            const result = isAnswerAcceptable(inputValue, correctText);

            if (result.isCorrect) {
                setStatus("correct");
                playSound("correct");
                setCorrectCount((prev) => prev + 1);
                if (result.isTypo) setTypoMessage(`Quase perfeito! Atenção à ortografia: ${correctText}`);
                else setTypoMessage(null);

                if (isClinic) {
                    setPoints((prev) => prev + 10);
                    setXpGained((prev) => prev + 10);
                } else {
                    startTransition(() => {
                        onChallengeComplete(currentChallenge.id).then((res) => {
                            const xp = res.xpGained || 10;
                            setPoints((prev) => prev + xp);
                            setXpGained((prev) => prev + xp);
                        });
                    });
                }
            } else {
                setStatus("wrong");
                playSound("wrong");
                setWrongCount((prev) => prev + 1);
                setTypoMessage(null);
                setChallenges((prev) => [...prev, { ...currentChallenge, id: currentChallenge.id + Math.random() }]);

                if (!isClinic) {
                    startTransition(() => {
                        onChallengeWrong().then((result) => {if (!result.shieldUsed && result.hearts !== undefined) { setHearts(result.hearts); setHeartsLost((prev) => prev + 1);}});
                    });
                }
            }
            return;
        }

        if (selectedOption === null) return;
        const selectedOpt = options.find((opt) => opt.id === selectedOption);
        if (selectedOpt?.correct) {
            setStatus("correct");
            playSound("correct");
            setCorrectCount((prev) => prev + 1);

            if (isClinic) {
                setPoints((prev) => prev + 10);
                setXpGained((prev) => prev + 10);
            } else {
                startTransition(() => {
                    onChallengeComplete(currentChallenge.id).then((result) => {
                        const xp = result.xpGained || 10;
                        setPoints((prev) => prev + xp);
                        setXpGained((prev) => prev + xp);
                    });
                });
            }
        } else {
            setStatus("wrong");
            playSound("wrong");
            setWrongCount((prev) => prev + 1);
            setChallenges((prev) => [...prev, { ...currentChallenge, id: currentChallenge.id + Math.random() }]);

            if (!isClinic) {
                startTransition(() => {
                    onChallengeWrong().then((result) => {if (!result.shieldUsed && result.hearts !== undefined) { setHearts(result.hearts); setHeartsLost((prev) => prev + 1);}});
                });
            }
        }
    };

    const handleExit = () => { playWhoosh(); setShowExitModal(true); };
    const confirmExit = () => router.push("/learn");
    const cancelExit = () => setShowExitModal(false);

    const [startTime] = useState(Date.now());
    const [endTime, setEndTime] = useState<number | null>(null);

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

        if (activeIndex < challenges.length - 1) {
            setShowTransition(true);
            setTimeout(() => {
                setShowTransition(false);
                setActiveIndex((prev) => prev + 1);
                setSelectedOption(null);
                setStatus("none");
                setInputValue("");
                setTypoMessage(null);
                setSelectedMatchIds([]);
                setMatchedIds([]);
                setWrongMatchFlash([]);
                setShuffledLeft([]);
                setShuffledRight([]);
            }, 1200);
            return;
        }

        handleLessonComplete();
    };

    const handleFinishLesson = () => {
        startTransition(() => {
            const completeAction = isClinic ? onClinicComplete : onLessonComplete;
            completeAction().then((res: any) => {
                const nextRoute = isClinic ? "/shop" : "/learn";
                
                // Smart Trigger: If streak is 3, 7, or multiples of 14, intercept with Review Modal
                // We delay the redirect until the modal is dismissed.
                const shouldAskReview = res?.streak === 3 || res?.streak === 7 || (res?.streak && res.streak > 0 && res.streak % 14 === 0);
                
                if (shouldAskReview && !isClinic) {
                    openReviewModal();
                    // We don't route immediately. The modal being global on layout would persist, 
                    // but since the user is in /lesson, when they close the modal, where do they go?
                    // Let's hook into the modal's close event if possible, or simpler: 
                    // just redirect, and the modal stays open in the global layout!
                }

                if (res?.streakExtended) {
                    setStreakDays(res.streak ?? 0);
                    setShowStreakModal(true);
                } else {
                    router.push(nextRoute);
                }
            }).catch(() => router.push(isClinic ? "/shop" : "/learn"));
        });
    };

    if (lessonComplete) {
        if (hearts === 0 && !isClinic) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-400 to-rose-500 px-6">
                    <div className="w-full max-w-md text-center">
                        <div className="mb-6"><span className="text-8xl">💔</span></div>
                        <h1 className="mb-2 text-4xl font-extrabold text-white">Gastaste todos os teus corações!</h1>
                        <p className="mb-8 text-lg text-white/80">O teu progresso foi guardado. Recarrega os corações para continuar.</p>
                        <div className="flex flex-col gap-3">
                            <Button variant="super" size="lg" className="w-full" onClick={() => router.push("/shop")}>Recarregar Corações</Button>
                            <Button variant="primary" size="lg" className="w-full border-green-400 bg-green-500 hover:bg-green-400" onClick={() => router.push("/lesson?clinic=true")}>Praticar para ganhar vidas ❤️</Button>
                            <Button variant="ghost" size="lg" className="w-full text-white hover:bg-white/20" onClick={() => router.push("/learn")}>Voltar</Button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <ResultScreen 
                isSuccess={hearts > 0 || !!isClinic} 
                xpGained={xpGained} 
                timeString={timeString} 
                accuracy={accuracy} 
                showStreakModal={showStreakModal} 
                streakDays={streakDays} 
                onContinue={handleFinishLesson} 
                onShowStreakModalChange={(open) => {
                    if (!open) router.push("/learn");
                    setShowStreakModal(open);
                }} 
            />
        );
    }

    if (!currentChallenge) {
        router.push("/learn");
        return null;
    }

    const isInsert = currentChallenge.type === "INSERT";
    const isDictation = currentChallenge.type === "DICTATION";
    const userAnswerText = isInsert || isDictation ? inputValue : options.find((opt) => opt.id === selectedOption)?.text || "";

    return (
        <>
            {showExitModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500 border-4 border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-50 to-white -z-10" />
                        <div className="w-56 h-56 -mt-4 relative animate-bounce"><LaughingCatLottie className="w-full h-full drop-shadow-xl" /></div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight -mt-4">Vais mesmo <span className="text-rose-500">desistir</span> agora?! 😭</h2>
                        <p className="mt-4 mb-8 text-lg font-medium text-slate-500 px-2 leading-relaxed">
                            O gatinho está a rir-se da tua fraqueza... Fica e prova o teu valor! 
                            <span className="block mt-2 text-sm text-slate-400 font-normal">(Relaxa, o progresso fica guardado de qualquer forma).</span>
                        </p>
                        <div className="flex flex-col w-full gap-3">
                            <Button variant="primary" size="lg" className="w-full h-14 text-lg rounded-2xl tracking-wide uppercase active:border-b-0 active:translate-y-1 transition-all" onClick={cancelExit}>CONTINUAR A APRENDER</Button>
                            <Button variant="danger" size="lg" className="w-full h-14 text-lg rounded-2xl bg-white text-rose-500 border-2 border-slate-200 hover:bg-rose-50 hover:text-rose-600 active:border-b-0 active:translate-y-1 transition-all" onClick={confirmExit}>Sair porque sou fraco</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white">
                <LessonHeader progress={progress} hearts={hearts} xpBoostLessons={xpBoostLessons} heartShields={heartShields} isAudioMuted={isAudioMuted} onToggleMute={() => setIsAudioMuted(!isAudioMuted)} onExit={handleExit} />

                {showTransition && (
                    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white animate-in fade-in duration-300">
                        <div className="w-80 h-80 animate-in zoom-in duration-500"><DuoAnimationLottie className="w-full h-full drop-shadow-2xl" /></div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-400 mt-4 animate-pulse">A carregar a próxima...</h2>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto min-h-0 w-full px-6 py-6 no-scrollbar">
                    <div className="mx-auto flex w-full max-w-[1140px] min-h-full flex-col items-center justify-center gap-y-6">
                    {currentChallenge.context && (
                        <div className="w-full max-w-[600px] bg-blue-50 border-2 border-blue-100 border-b-4 rounded-2xl p-6 shadow-sm text-center mb-[-10px] relative transition-all duration-300">
                            <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 block">Contexto</span>
                            <Button variant="ghost" className="absolute top-3 right-3 rounded-xl w-10 h-10 p-0 text-blue-500 bg-white border-2 border-slate-100 border-b-4 shadow-sm transition-all active:translate-y-1 active:border-b-2"
                                onClick={() => playAudio(currentChallenge.context as string, 0.9, currentChallenge.contextAudioLang || languageCode)}>
                                {isPlaying && playingText === currentChallenge.context ? <div className="w-4 h-4 bg-blue-500 rounded-sm animate-pulse" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                            <div className="text-xl font-medium text-slate-700 mt-2 px-8 leading-relaxed">
                                &quot;<InteractiveText text={currentChallenge.context} language={language} />&quot;
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-50 border-r-2 border-b-2 border-blue-100 rotate-45" />
                        </div>
                    )}

                    <div className="flex flex-col gap-6 mb-6 items-center justify-center mt-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" className="bg-[#1CB0F6] border-b-[8px] border-[#0092d6] w-20 h-20 rounded-full shadow-sm transition-all active:translate-y-2 active:border-b-0 hover:bg-[#159fdf] p-0"
                                onClick={() => playAudio(currentChallenge.question, 0.9, currentChallenge.questionAudioLang || languageCode)}>
                                {isPlaying && playingText === currentChallenge.question ? <div className="w-8 h-8 bg-white rounded-md animate-pulse" /> : <Volume2 className="h-10 w-10 text-white" />}
                            </Button>
                            <Button variant="ghost" className="bg-white border-2 border-stone-200 border-b-4 w-12 h-12 rounded-2xl shadow-sm hover:bg-stone-50 transition-all active:translate-y-1 active:border-b-2 p-0"
                                onClick={() => playAudio(currentChallenge.question, 0.5, currentChallenge.questionAudioLang || languageCode)}>
                                <span className="text-xl">🐢</span>
                            </Button>
                        </div>
                        <div className="text-center text-3xl font-extrabold lg:text-4xl text-slate-800 tracking-tight">
                            {currentChallenge.type !== "DICTATION" && <InteractiveText text={currentChallenge.question} language={language} />}
                        </div>
                    </div>

                    {currentChallenge.type === "DICTATION" ? (
                        <div className="w-full max-w-[600px] flex flex-col items-center gap-6">
                            <button onClick={() => playAudio(currentChallenge.question, 0.85, currentChallenge.questionAudioLang || languageCode)}
                                className={cn("w-32 h-32 rounded-full border-4 border-b-[8px] flex items-center justify-center transition-all duration-200 outline-none cursor-pointer", "bg-sky-50 border-sky-300 text-sky-500 hover:bg-sky-100 active:translate-y-2 active:border-b-0", isPlaying && "animate-pulse bg-sky-100 border-sky-400")}>
                                <Ear className="h-14 w-14" />
                            </button>
                            <p className="text-slate-400 text-sm font-medium">Ouve e escreve o que ouves</p>
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && inputValue.trim() && status === "none") { e.preventDefault(); handleCheck(); } }}
                                disabled={status !== "none" || isPending} placeholder="Escreve o que ouviste..." autoFocus
                                className={cn("w-full bg-stone-100 border-2 border-stone-200 border-b-4 rounded-2xl p-4 text-xl font-bold text-stone-700 focus:outline-none focus:border-[#1CB0F6] focus:bg-white transition-all text-center", status === "correct" && "border-[#58CC02] bg-[#d7ffb8]/30 text-[#46a302] border-b-2 translate-y-0.5", status === "wrong" && "border-rose-400 bg-rose-50 text-rose-700 border-b-2 translate-y-0.5")} />
                            {typoMessage && status === "correct" && <p className="text-amber-600 text-sm font-medium bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 animate-in fade-in duration-300">✏️ {typoMessage}</p>}
                        </div>
                    ) : currentChallenge.type === "MATCH" ? (
                        <MatchGrid leftColumn={shuffledLeft} rightColumn={shuffledRight} selectedMatchIds={selectedMatchIds} matchedIds={matchedIds} wrongMatchFlash={wrongMatchFlash}
                            onSelect={(optId) => {
                                if (matchedIds.includes(optId) || wrongMatchFlash.length > 0) return;
                                const newSelected = selectedMatchIds.includes(optId) ? selectedMatchIds.filter((id) => id !== optId) : [...selectedMatchIds, optId];
                                if (newSelected.length === 2) {
                                    const [idA, idB] = newSelected;
                                    const idxA = options.findIndex((o) => o.id === idA);
                                    const idxB = options.findIndex((o) => o.id === idB);
                                    const isPair = (idxA < 4 && idxB === idxA + 4) || (idxB < 4 && idxA === idxB + 4);

                                    if (isPair) {
                                        playSound("correct");
                                        const newMatched = [...matchedIds, idA, idB];
                                        setMatchedIds(newMatched);
                                        setSelectedMatchIds([]);
                                        if (newMatched.length === 8) {
                                            setStatus("correct");
                                            setCorrectCount((prev) => prev + 1);
                                            if (isClinic) { setPoints((prev) => prev + 10); setXpGained((prev) => prev + 10); } else {
                                                onChallengeComplete(currentChallenge.id).then((res) => { const xp = res.xpGained || 10; setPoints((prev) => prev + xp); setXpGained((prev) => prev + xp); });
                                            }
                                        }
                                    } else {
                                        playSound("wrong"); setWrongMatchFlash(newSelected);
                                        setTimeout(() => { setWrongMatchFlash([]); setSelectedMatchIds([]); }, 600);
                                    }
                                } else { setSelectedMatchIds(newSelected); }
                            }} />
                    ) : currentChallenge.type === "INSERT" ? (
                        <div className="w-full max-w-[600px] flex flex-col gap-3">
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && inputValue.trim() && status === "none") { e.preventDefault(); handleCheck(); } }}
                                disabled={status !== "none" || isPending} placeholder="Escreve a tua resposta..." autoFocus
                                className={cn("w-full bg-stone-100 border-2 border-stone-200 border-b-4 rounded-2xl p-4 text-xl font-bold text-stone-700 focus:outline-none focus:border-[#1CB0F6] focus:bg-white transition-all text-center", status === "correct" && "border-[#58CC02] bg-[#d7ffb8]/30 text-[#46a302] border-b-2 translate-y-0.5", status === "wrong" && "border-rose-400 bg-rose-50 text-rose-700 border-b-2 translate-y-0.5")} />
                            {typoMessage && status === "correct" && <p className="text-amber-600 text-sm font-medium bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 animate-in fade-in duration-300">✏️ {typoMessage}</p>}
                        </div>
                    ) : (
                        <div className="grid w-full max-w-[600px] grid-cols-1 gap-3 sm:grid-cols-2">
                            {options.map((option) => (
                                <ChallengeOptionCard key={option.id} id={option.id} text={option.text} imageSrc={option.imageSrc} selected={selectedOption === option.id} disabled={status !== "none" || isPending} isCorrect={option.correct}
                                    status={status !== "none" && selectedOption === option.id ? status : option.correct && status === "wrong" ? "correct" : "none"}
                                    onClick={() => handleSelect(option.id)} />
                            ))}
                        </div>
                    )}
                    {/* Massive Spacer to Guarantee Scroll clearance for the new fixed footer */}
                    <div className="h-40 w-full shrink-0 pointer-events-none" />
                    </div>
                </main>
                
                <LessonFooter 
                    status={status} 
                    isPending={isPending} 
                    isDisabled={(currentChallenge.type === "INSERT" || currentChallenge.type === "DICTATION" ? !inputValue.trim() : currentChallenge.type === "MATCH" ? matchedIds.length < 8 : selectedOption === null)} 
                    hearts={hearts} 
                    currentChallenge={currentChallenge as any} 
                    languageCode={languageCode} 
                    onCheck={handleCheck} 
                    onContinue={handleContinue} 
                    onSkip={handleExit} 
                    playMixedSpeech={playMixedSpeech} 
                    userAnswer={userAnswerText}
                />
            </div>
        </>
    );
};
