"use client";

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    generatePlacementBatch,
    generateComprehension,
    generateWritingTopic,
    gradeWritingOutput,
    savePlacementResult,
    getActiveLanguage,
    type PlacementQuestion,
    type ComprehensionData,
    type WritingTopic,
    type GradeResult,
} from "@/actions/evaluation";
import {
    Loader2,
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    GraduationCap,
    BookOpen,
    Headphones,
    PenTool,
    Trophy,
    Volume2,
    VolumeX,
    Sparkles,
    CheckCircle2,
    XCircle,
    Home,
    Star,
    Globe,
    Rocket,
    Zap,
    Target,
    Settings,
    Info,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES, getLocaleForLanguage } from "@/lib/constants";
import Link from "next/link";
import { InteractiveText } from "@/components/ui/interactive-text";
import { LottieAnimation } from "@/components/ui/lottie-animation";
import { AITutorFeedback } from "@/components/shared/ai-tutor-feedback";


// ============================================================
// TYPES
// ============================================================

type Phase = "welcome" | "grammar" | "reading" | "listening" | "writing" | "results";

type PhaseResult = {
    grammar: { score: number; answeredCorrectly: string[] };
    reading: { score: number; correctCount: number; totalCount: number };
    listening: { score: number; correctCount: number; totalCount: number };
    writing: { score: number; feedback: string };
};

// ============================================================
// CONSTANTS
// ============================================================

const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
const GRAMMAR_QUESTION_COUNT = 15;



const LEVEL_COLORS: Record<string, string> = {
    A1: "from-emerald-400 to-green-500",
    A2: "from-green-400 to-teal-500",
    B1: "from-sky-400 to-blue-500",
    B2: "from-blue-400 to-indigo-500",
    C1: "from-indigo-400 to-violet-500",
    C2: "from-violet-400 to-purple-500",
};

const LEVEL_LABELS: Record<string, string> = {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper Intermediate",
    C1: "Advanced",
    C2: "Mastery",
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function EvaluationPage() {
    // Phase management
    const [phase, setPhase] = useState<Phase>("welcome");
    const [isLoading, startTransition] = useTransition();

    // Language selector
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [languageLoaded, setLanguageLoaded] = useState(false);

    // Data stores
    const [allQuestions, setAllQuestions] = useState<PlacementQuestion[]>([]);
    const [targetLanguage, setTargetLanguage] = useState("");
    const [readingExercises, setReadingExercises] = useState<ComprehensionData[]>([]);
    const [listeningExercises, setListeningExercises] = useState<ComprehensionData[]>([]);
    const [writingTopic, setWritingTopic] = useState<WritingTopic | null>(null);
    const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

    // Grammar state machine
    const [currentLevel, setCurrentLevel] = useState("B1");
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [grammarAnswers, setGrammarAnswers] = useState<{ level: string; correct: boolean }[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [lockedQuestion, setLockedQuestion] = useState<PlacementQuestion | null>(null);

    // Reading state (multi-exercise)
    const [readingExIdx, setReadingExIdx] = useState(0);
    const [readingQIdx, setReadingQIdx] = useState(0);
    const [readingAnswers, setReadingAnswers] = useState<boolean[]>([]);
    const [readingShowFeedback, setReadingShowFeedback] = useState(false);
    const [readingIsCorrect, setReadingIsCorrect] = useState(false);

    // Listening state (multi-exercise)
    const [listeningExIdx, setListeningExIdx] = useState(0);
    const [listeningQIdx, setListeningQIdx] = useState(0);
    const [listeningAnswers, setListeningAnswers] = useState<boolean[]>([]);
    const [listeningShowFeedback, setListeningShowFeedback] = useState(false);
    const [listeningIsCorrect, setListeningIsCorrect] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Writing state
    const [writingText, setWritingText] = useState("");

    // Results
    const [estimatedLevel, setEstimatedLevel] = useState("B1");
    const [finalLevel, setFinalLevel] = useState("");
    const [phaseResults, setPhaseResults] = useState<PhaseResult>({
        grammar: { score: 0, answeredCorrectly: [] },
        reading: { score: 0, correctCount: 0, totalCount: 0 },
        listening: { score: 0, correctCount: 0, totalCount: 0 },
        writing: { score: 0, feedback: "" },
    });
    const [showConfetti, setShowConfetti] = useState(false);

    // Feedback bar
    const pendingContinue = useRef<(() => void) | null>(null);
    const feedbackActive = showFeedback || readingShowFeedback || listeningShowFeedback;
    const feedbackIsCorrect = showFeedback ? isCorrect : readingShowFeedback ? readingIsCorrect : listeningIsCorrect;

    // ============================================================
    // INIT: Pre-select language from active course
    // ============================================================
    useEffect(() => {
        getActiveLanguage().then((lang) => {
            if (lang) {
                const match = SUPPORTED_LANGUAGES.find(
                    (l) => l.value.toLowerCase() === lang.toLowerCase()
                );
                if (match) setSelectedLanguage(match.value);
            }
            setLanguageLoaded(true);
        });
    }, []);

    // ============================================================
    // PHASE 0: WELCOME → Start test
    // ============================================================
    const handleStartTest = () => {
        const lang = selectedLanguage;
        setTargetLanguage(lang);
        startTransition(async () => {
            const { questions } = await generatePlacementBatch(lang);
            setAllQuestions(questions);
            setPhase("grammar");
        });
    };

    // ============================================================
    // PHASE 1: GRAMMAR — Adaptive State Machine (15 questions)
    // ============================================================

    const getNextQuestion = useCallback((): PlacementQuestion | null => {
        const levelQs = allQuestions.filter((q) => q.level === currentLevel);
        const usedAtLevel = grammarAnswers.filter((a) => a.level === currentLevel).length;
        return levelQs[usedAtLevel] || levelQs[0] || null;
    }, [allQuestions, currentLevel, grammarAnswers]);

    const activeQuestion = lockedQuestion || getNextQuestion();

    const handleGrammarSelect = (optionIndex: number) => {
        if (showFeedback || !activeQuestion) return;
        setSelectedOption(optionIndex);
    };

    const handleGrammarVerify = () => {
        if (selectedOption === null || showFeedback || !activeQuestion) return;

        

        const correct = activeQuestion.options[selectedOption]?.is_correct || false;
        setLockedQuestion(activeQuestion);
        
        setIsCorrect(correct);
        setShowFeedback(true);

        const newAnswers = [...grammarAnswers, { level: currentLevel, correct }];
        setGrammarAnswers(newAnswers);

        pendingContinue.current = () => {
            const answered = questionsAnswered + 1;
            setQuestionsAnswered(answered);

            if (answered >= GRAMMAR_QUESTION_COUNT) {
                // Calculate estimated level
                const correctByLevel: Record<string, number> = {};
                newAnswers.forEach((a) => {
                    if (a.correct) {
                        correctByLevel[a.level] = (correctByLevel[a.level] || 0) + 1;
                    }
                });

                let estimated = "A1";
                for (const level of LEVELS) {
                    if (correctByLevel[level] && correctByLevel[level] > 0) {
                        estimated = level;
                    }
                }

                setEstimatedLevel(estimated);
                setPhaseResults((prev) => ({
                    ...prev,
                    grammar: {
                        score: Math.round((newAnswers.filter((a) => a.correct).length / GRAMMAR_QUESTION_COUNT) * 100),
                        answeredCorrectly: Object.keys(correctByLevel),
                    },
                }));

                startTransition(async () => {
                    const exercises = await generateComprehension(estimated, targetLanguage, "reading");
                    setReadingExercises(exercises);
                    setPhase("reading");
                });
            } else {
                // Adaptive: move level up or down
                const currentIdx = LEVELS.indexOf(currentLevel as (typeof LEVELS)[number]);
                let nextIdx: number;
                if (correct) {
                    nextIdx = Math.min(currentIdx + 1, LEVELS.length - 1);
                } else {
                    nextIdx = Math.max(currentIdx - 1, 0);
                }
                setCurrentLevel(LEVELS[nextIdx]);
            }

            setSelectedOption(null);
            setShowFeedback(false);
            setLockedQuestion(null);
            pendingContinue.current = null;
        };
    };

    // ============================================================
    // PHASE 2: READING — 3 Sequential Exercises
    // ============================================================

    const currentReadingEx = readingExercises[readingExIdx] || null;
    const currentReadingQ = currentReadingEx?.questions[readingQIdx] || null;

    const handleReadingSelect = (optionIndex: number) => {
        if (readingShowFeedback || !currentReadingQ) return;
        setSelectedOption(optionIndex);
    };

    const handleReadingVerify = () => {
        if (selectedOption === null || readingShowFeedback || !currentReadingQ) return;

        

        const correct = currentReadingQ.options[selectedOption]?.is_correct || false;
        const newAnswers = [...readingAnswers, correct];
        setReadingAnswers(newAnswers);
        setReadingIsCorrect(correct);
        setReadingShowFeedback(true);

        pendingContinue.current = () => {
            setSelectedOption(null);
            setReadingShowFeedback(false);

            const nextQIdx = readingQIdx + 1;
            if (nextQIdx < (currentReadingEx?.questions.length || 0)) {
                // Next question in same exercise
                setReadingQIdx(nextQIdx);
            } else {
                // Next exercise
                const nextExIdx = readingExIdx + 1;
                if (nextExIdx < readingExercises.length) {
                    setReadingExIdx(nextExIdx);
                    setReadingQIdx(0);
                } else {
                    // Phase complete — calculate score
                    const correctCount = newAnswers.filter(Boolean).length;
                    setPhaseResults((prev) => ({
                        ...prev,
                        reading: {
                            score: Math.round((correctCount / newAnswers.length) * 100),
                            correctCount,
                            totalCount: newAnswers.length,
                        },
                    }));

                    startTransition(async () => {
                        const exercises = await generateComprehension(estimatedLevel, targetLanguage, "listening");
                        setListeningExercises(exercises);
                        setPhase("listening");
                    });
                }
            }
            pendingContinue.current = null;
        };
    };

    // ============================================================
    // PHASE 3: LISTENING — 3 Sequential Exercises (TTS)
    // ============================================================

    const currentListeningEx = listeningExercises[listeningExIdx] || null;
    const currentListeningQ = currentListeningEx?.questions[listeningQIdx] || null;

    const handlePlayTTS = () => {
        if (!currentListeningEx) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(currentListeningEx.text);
        utterance.lang = getLocaleForLanguage(targetLanguage);
        utterance.rate = 0.85;
        utterance.onend = () => setIsSpeaking(false);
        synthRef.current = utterance;
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const handleListeningSelect = (optionIndex: number) => {
        if (listeningShowFeedback || !currentListeningQ) return;
        setSelectedOption(optionIndex);
    };

    const handleListeningVerify = () => {
        if (selectedOption === null || listeningShowFeedback || !currentListeningQ) return;

        

        const correct = currentListeningQ.options[selectedOption]?.is_correct || false;
        const newAnswers = [...listeningAnswers, correct];
        setListeningAnswers(newAnswers);
        setListeningIsCorrect(correct);
        setListeningShowFeedback(true);

        pendingContinue.current = () => {
            setSelectedOption(null);
            setListeningShowFeedback(false);
            window.speechSynthesis.cancel();
            setIsSpeaking(false);

            const nextQIdx = listeningQIdx + 1;
            if (nextQIdx < (currentListeningEx?.questions.length || 0)) {
                setListeningQIdx(nextQIdx);
            } else {
                const nextExIdx = listeningExIdx + 1;
                if (nextExIdx < listeningExercises.length) {
                    setListeningExIdx(nextExIdx);
                    setListeningQIdx(0);
                } else {
                    // Phase complete
                    const correctCount = newAnswers.filter(Boolean).length;
                    setPhaseResults((prev) => ({
                        ...prev,
                        listening: {
                            score: Math.round((correctCount / newAnswers.length) * 100),
                            correctCount,
                            totalCount: newAnswers.length,
                        },
                    }));

                    startTransition(async () => {
                        const topic = await generateWritingTopic(estimatedLevel, targetLanguage);
                        setWritingTopic(topic);
                        setPhase("writing");
                    });
                }
            }
            pendingContinue.current = null;
        };
    };

    useEffect(() => {
        return () => { window.speechSynthesis?.cancel(); };
    }, []);

    // ============================================================
    // PHASE 4: WRITING
    // ============================================================

    const handleSubmitWriting = () => {
        if (!writingText.trim()) return;
        startTransition(async () => {
            const result = await gradeWritingOutput(writingText, estimatedLevel, targetLanguage);
            setGradeResult(result);
            setFinalLevel(result.final_cefr_level);
            setPhaseResults((prev) => ({ ...prev, writing: { score: 0, feedback: result.feedback } }));
            await savePlacementResult(result.final_cefr_level, targetLanguage);
            setPhase("results");
            setTimeout(() => setShowConfetti(true), 300);
        });
    };

    // ============================================================
    // CONTINUE BUTTON HANDLER
    // ============================================================

    const handleContinue = useCallback(() => {
        if (pendingContinue.current) pendingContinue.current();
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Enter" && feedbackActive) {
                e.preventDefault();
                handleContinue();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [feedbackActive, handleContinue]);

    // ============================================================
    // PROGRESS CALCULATION
    // ============================================================

    const getProgress = (): number => {
        if (phase === "welcome") return 0;
        if (phase === "results") return 100;
        if (phase === "grammar") return 5 + (questionsAnswered / GRAMMAR_QUESTION_COUNT) * 20;
        if (phase === "reading") {
            const totalReadingQs = readingExercises.reduce((sum, ex) => sum + ex.questions.length, 0);
            const answeredReading = readingAnswers.length;
            return 25 + (answeredReading / Math.max(totalReadingQs, 1)) * 25;
        }
        if (phase === "listening") {
            const totalListeningQs = listeningExercises.reduce((sum, ex) => sum + ex.questions.length, 0);
            const answeredListening = listeningAnswers.length;
            return 50 + (answeredListening / Math.max(totalListeningQs, 1)) * 25;
        }
        if (phase === "writing") return 80;
        return 0;
    };

    const progress = getProgress();

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-white relative flex flex-col font-sans overflow-x-hidden">
            {/* ── Background Layer: dot pattern ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] [background-size:24px_24px] opacity-40"
            />

            {/* SUPER ADVANCED GAMIFIED HEADER (HD PLAY) */}
            {phase !== "results" && (
                <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b-[3px] border-slate-200/80 pt-4 sm:pt-6 pb-4 px-4 md:px-8 w-full shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] transition-all">
                    <div className="max-w-5xl mx-auto w-full flex items-center gap-4 sm:gap-8">
                        
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Tactile Close Button */}
                            <Link
                                href="/learn"
                                className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl border-2 border-slate-200 border-b-[6px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:translate-y-1 active:border-b-[2px] transition-all flex items-center justify-center shadow-lg group relative overflow-hidden"
                            >
                                <XCircle className="h-7 w-7 sm:h-8 sm:w-8 stroke-[2.5] group-hover:text-red-500 transition-colors relative z-10" />
                                <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>

                            {/* Info Button in Sticky Header */}
                            <button
                                onClick={() => setIsInfoModalOpen(true)}
                                className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl border-2 border-slate-200 border-b-[6px] text-slate-400 hover:text-[#1CB0F6] hover:bg-slate-50 active:translate-y-1 active:border-b-[2px] transition-all flex items-center justify-center shadow-lg group"
                            >
                                <Info className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
                            </button>
                        </div>

                        {/* Massive 3D Progress Bar System */}
                        {phase !== "welcome" ? (
                            <div className="flex-1 relative flex items-center gap-4 sm:gap-6">
                                
                                {/* Floating Phase Icon (Enhanced) */}
                                <div className="hidden md:flex shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-[1.25rem] border-2 border-slate-200 border-b-[6px] items-center justify-center shadow-xl z-10 relative group">
                                    <div className={cn(
                                        "absolute inset-1 rounded-lg opacity-10 transition-opacity group-hover:opacity-20",
                                        phase === "grammar" && "bg-[#58CC02]",
                                        phase === "reading" && "bg-[#1CB0F6]",
                                        phase === "listening" && "bg-[#CE82FF]",
                                        phase === "writing" && "bg-[#FF9600]"
                                    )} />
                                    {phase === "grammar" && <GraduationCap className="h-8 w-8 text-[#58CC02] stroke-[2.5]" />}
                                    {phase === "reading" && <BookOpen className="h-8 w-8 text-[#1CB0F6] stroke-[2.5]" />}
                                    {phase === "listening" && <Headphones className="h-8 w-8 text-[#CE82FF] stroke-[2.5]" />}
                                    {phase === "writing" && <PenTool className="h-8 w-8 text-[#FF9600] stroke-[2.5]" />}
                                </div>

                                {/* Main Bar Wrapper (HD Play) */}
                                <div className="flex-1 h-7 sm:h-9 bg-slate-100 rounded-2xl relative overflow-hidden border-2 border-slate-200/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                                    {/* Background Track Glow */}
                                    <div className={cn(
                                        "absolute inset-0 opacity-5",
                                        phase === "grammar" && "bg-[#58CC02]",
                                        phase === "reading" && "bg-[#1CB0F6]",
                                        phase === "listening" && "bg-[#CE82FF]",
                                        phase === "writing" && "bg-[#FF9600]"
                                    )} />

                                    {/* Color track */}
                                    <div
                                        className={cn(
                                            "absolute top-0 left-0 h-full rounded-2xl transition-all duration-1000 ease-out border-r-[4px] border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.1)]",
                                            phase === "grammar" && "bg-[#58CC02] shadow-[#58CC02]/40",
                                            phase === "reading" && "bg-[#1CB0F6] shadow-[#1CB0F6]/40",
                                            phase === "listening" && "bg-[#CE82FF] shadow-[#CE82FF]/40",
                                            phase === "writing" && "bg-[#FF9600] shadow-[#FF9600]/40"
                                        )}
                                        style={{ width: `${progress}%` }}
                                    >
                                        {/* Shiny Internal Reflection */}
                                        <div className="absolute top-1.5 left-4 right-4 h-2 sm:h-3 bg-white/25 rounded-full" />
                                        
                                        {/* Animated Gradient Stripes */}
                                        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)] bg-[length:32px_32px] animate-[pushScroll_3s_linear_infinite]" />
                                    </div>
                                </div>

                                {/* Tactical Percentage Pill */}
                                <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white rounded-2xl border-2 border-slate-200 border-b-[6px] font-black text-slate-600 text-base sm:text-lg shadow-xl shrink-0 tabular-nums min-w-[4.5rem] sm:min-w-[6rem] text-center active:translate-y-1 active:border-b-[2px] transition-all">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1CB0F6]">Portal de Acesso</span>
                                    <span className="text-xl font-black text-slate-800 tracking-tight">Avaliação de Proficiência</span>
                                </div>
                                <div className="hidden sm:flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 italic">Mais de 10k alunos testados</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-modal flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="relative">
                            <Loader2 className="h-12 w-12 animate-spin text-sky-500" />
                            <Sparkles className="h-5 w-5 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
                        </div>
                        <p className="text-lg font-bold text-slate-600">
                            {phase === "welcome" && "A gerar o teu teste..."}
                            {phase === "grammar" && "A preparar exercícios de leitura..."}
                            {phase === "reading" && "A preparar exercícios de audição..."}
                            {phase === "listening" && "A criar tema de escrita..."}
                            {phase === "writing" && "A IA está a avaliar a tua redação..."}
                        </p>
                        <p className="text-sm text-slate-400">Desenvolvido por IA ✨</p>
                    </div>
                </div>
            )}

            {/* Content Area with Decorative Blobs */}
            <div className="flex-1 relative flex flex-col p-4 sm:p-8 pt-6 sm:pt-10 w-full max-w-7xl mx-auto z-10">
                {/* Soft decorative blobs scoped to content */}
                <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#58CC02]/10 blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#1CB0F6]/10 blur-3xl" />

                <div className="relative w-full max-w-6xl mx-auto flex flex-col gap-6 pb-6 sm:pb-10 pt-2">


                    {/* ====================== WELCOME ====================== */}
                    {phase === "welcome" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="w-full flex flex-col gap-6"
                        >
                            {/* ── PILLAR 1: Imposing Header Banner (Light Theme) ── */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.05 }}
                                className="relative w-full rounded-[2.5rem] overflow-hidden bg-white border-2 border-slate-200 border-b-[8px] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] p-8 md:p-10"
                            >
                                {/* Inner glow blobs - softened for light theme */}
                                <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-[#58CC02]/10 rounded-full blur-3xl" />
                                <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 bg-[#1CB0F6]/10 rounded-full blur-3xl" />
                                {/* Dot overlay - darker for white background */}
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />

                                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                    {/* Left: title + badge */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 text-[#58CC02] bg-[#58CC02]/10 border border-[#58CC02]/20 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                <Sparkles className="w-3 h-3" /> Avaliação CEFR
                                            </span>
                                        </div>
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight leading-tight">
                                            Avaliação de<br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58CC02] to-[#1CB0F6]">Nível</span>
                                        </h1>
                                        <p className="text-slate-500 font-medium text-base md:text-lg max-w-md leading-relaxed">
                                            Descobre a tua fluência em 4 fases interativas. Um teste inteligente em tempo real.
                                        </p>
                                    </div>

                                    {/* Right: 3D Level Badge + settings icon */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        {/* Tactical Level Badge */}
                                        <div className="relative">
                                            <div className="bg-gradient-to-b from-[#58CC02] to-[#46a302] rounded-2xl px-6 py-4 border-b-[6px] border-[#378200] shadow-[0_8px_24px_rgba(88,204,2,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col items-center gap-0.5">
                                                <span className="text-white/80 text-[10px] font-black uppercase tracking-widest">Nível</span>
                                                <span className="text-white text-2xl font-black tracking-tight leading-none">Iniciante</span>
                                                <span className="text-[#d7ffb8] text-sm font-black tracking-widest">A1</span>
                                            </div>
                                        </div>
                                        {/* Settings gear */}
                                        <button 
                                            onClick={() => setIsInfoModalOpen(true)}
                                            className="w-12 h-12 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 border-b-4 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all hover:scale-110 active:scale-95 active:border-b-0 active:translate-y-1"
                                        >
                                            <Info className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* ── PILLAR 2 + MASCOT: Side-by-side layout ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">

                                {/* Bento Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        {
                                            icon: GraduationCap, label: "Gramática", desc: "Avalia a tua estrutura gramatical e vocabulário.", time: "15 questões · ~5 min",
                                            bg: "from-[#58CC02] to-[#46a302]", border: "border-[#378200]", iconBg: "bg-[#58CC02]", glow: "hover:shadow-[0_8px_30px_rgba(88,204,2,0.25)]", ring: "hover:border-[#58CC02]/60",
                                        },
                                        {
                                            icon: BookOpen, label: "Leitura", desc: "Verifica a tua compreensão de textos escritos.", time: "3 textos · ~5 min",
                                            bg: "from-[#1CB0F6] to-[#0092D6]", border: "border-[#006fa3]", iconBg: "bg-[#1CB0F6]", glow: "hover:shadow-[0_8px_30px_rgba(28,176,246,0.25)]", ring: "hover:border-[#1CB0F6]/60",
                                        },
                                        {
                                            icon: Headphones, label: "Audição", desc: "Verifica a tua compreensão auditiva em contexto.", time: "3 áudios · ~4 min",
                                            bg: "from-[#CE82FF] to-[#A547D9]", border: "border-[#8330b5]", iconBg: "bg-[#CE82FF]", glow: "hover:shadow-[0_8px_30px_rgba(206,130,255,0.25)]", ring: "hover:border-[#CE82FF]/60",
                                        },
                                        {
                                            icon: PenTool, label: "Escrita", desc: "Demonstra a tua capacidade de escrita livre.", time: "1 redação · ~5 min",
                                            bg: "from-[#FF9600] to-[#D67B00]", border: "border-[#b56200]", iconBg: "bg-[#FF9600]", glow: "hover:shadow-[0_8px_30px_rgba(255,150,0,0.25)]", ring: "hover:border-[#FF9600]/60",
                                        },
                                    ].map(({ icon: Icon, label, desc, time, bg, border, iconBg, glow, ring }, i) => (
                                        <motion.div
                                            key={label}
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                                            className={cn(
                                                "group bg-white rounded-[1.75rem] border-2 border-slate-200 border-b-[6px] p-5 flex flex-col gap-4 cursor-default transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-sm",
                                                glow, ring
                                            )}
                                        >
                                            {/* Icon */}
                                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border-b-[4px] shadow-md bg-gradient-to-b", bg, border)}>
                                                <Icon className="h-6 w-6 text-white stroke-[2.5]" />
                                            </div>
                                            {/* Text */}
                                            <div className="flex flex-col gap-1">
                                                <span className="text-base font-black text-slate-800 leading-tight">{label}</span>
                                                <span className="text-xs font-medium text-slate-500 leading-snug">{desc}</span>
                                            </div>
                                            {/* Footer pill */}
                                            <div className="mt-auto flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-fit">
                                                <Zap className="w-3 h-3 text-slate-400" />
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{time}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* ── Mascot Hero ── */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 }}
                                    className="hidden lg:flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-b-[6px] border-slate-200 shadow-sm p-6 relative overflow-hidden"
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#58CC02]/5 to-transparent" />
                                    <motion.div
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-full h-44 relative z-10"
                                    >
                                        <LottieAnimation className="w-full h-full drop-shadow-xl" />
                                    </motion.div>
                                    <div className="relative z-10 mt-4 text-center">
                                        <span className="text-slate-700 font-black text-sm">Marco diz:</span>
                                        <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">«Estás pronto para descobrires o teu nível?»</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* ── CEFR Progression Visualization (Pro Animated) ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.45 }}
                                className="relative bg-white rounded-[2.5rem] border-2 border-b-[8px] border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 overflow-hidden group"
                            >
                                {/* Decorative Background Grid */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                                     style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                
                                <div className="relative z-10 flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                            <Target className="w-6 h-6 text-[#1CB0F6]" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-[#1CB0F6] uppercase tracking-[0.2em]">Framework Europeu</span>
                                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Progressão CEFR</h3>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#58CC02] animate-pulse" />
                                        Tempo Real
                                    </div>
                                </div>

                                <div className="relative z-10 flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56 px-2">
                                    {[
                                        { level: "A1", label: "Iniciante", h: "30%", from: "#58CC02", to: "#46a302" },
                                        { level: "A2", label: "Básico", h: "45%", from: "#22c55e", to: "#16a34a" },
                                        { level: "B1", label: "Intermédio", h: "60%", from: "#1CB0F6", to: "#1899d6" },
                                        { level: "B2", label: "Avançado", h: "75%", from: "#3b82f6", to: "#2563eb" },
                                        { level: "C1", label: "Proficiente", h: "85%", from: "#8b5cf6", to: "#7c3aed" },
                                        { level: "C2", label: "Maestria", h: "100%", from: "#a855f7", to: "#9333ea" },
                                    ].map(({ level, label, h, from, to }, i) => (
                                        <motion.div
                                            key={level}
                                            className="flex-1 flex flex-col items-center gap-3 group/bar h-full justify-end"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 + i * 0.08 }}
                                        >
                                            {/* Bar Container */}
                                            <div className="relative w-full group-hover:scale-x-110 transition-transform origin-bottom flex flex-col items-center justify-end h-full">
                                                {/* Tooltip on Hover */}
                                                <div className="absolute -top-8 opacity-0 group-hover/bar:opacity-100 transition-all -translate-y-2 group-hover/bar:-translate-y-4 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-20">
                                                    {label}
                                                </div>

                                                {/* Actual Animated Bar */}
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: h }}
                                                    transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                                    className="w-full relative rounded-t-xl sm:rounded-t-2xl shadow-lg overflow-hidden"
                                                    style={{ 
                                                        background: `linear-gradient(to top, ${from}, ${to})`,
                                                        boxShadow: `0 10px 20px -5px ${from}44`
                                                    }}
                                                >
                                                    {/* Glossy Reflection */}
                                                    <div className="absolute top-0 left-0 right-0 h-full w-full bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                                                    <div className="absolute top-2 left-1.5 right-1.5 h-4 bg-white/30 rounded-full blur-[1px]" />
                                                    
                                                    {/* Scanning light animation */}
                                                    <motion.div 
                                                        animate={{ y: [-100, 200] }}
                                                        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                                                        className="absolute top-0 left-0 right-0 h-8 bg-white/20 -skew-y-12 blur-md"
                                                    />
                                                </motion.div>
                                            </div>

                                            {/* Labels */}
                                            <div className="flex flex-col items-center">
                                                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-tighter hidden sm:block">{label}</span>
                                                <span className="text-xs sm:text-sm font-black text-slate-600 mt-1">{level}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* ── Language Selector ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.55 }}
                                className="bg-white rounded-3xl border-2 border-b-[6px] border-slate-200 p-3 pl-5 flex items-center justify-between gap-4 transition-all focus-within:border-sky-300 focus-within:ring-4 ring-sky-300/30 shadow-sm group hover:border-sky-200"
                            >
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500 border-2 border-sky-200 group-hover:border-sky-300 transition-colors">
                                        <Globe className="h-6 w-6 stroke-[2.5]" />
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Língua Alvo</p>
                                        <p className="text-sm font-bold text-slate-700 leading-none">O teu Idioma</p>
                                    </div>
                                </div>
                                {languageLoaded ? (
                                    <div className="flex-1 relative h-full">
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            className="w-full h-14 bg-slate-50 hover:bg-slate-100 px-5 rounded-[1.25rem] text-lg font-black text-slate-700 cursor-pointer outline-none border-2 border-slate-200 hover:border-slate-300 transition-all appearance-none"
                                        >
                                            {SUPPORTED_LANGUAGES.map((lang) => (
                                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 h-14 rounded-[1.25rem] bg-slate-100 border-2 border-slate-200 animate-pulse" />
                                )}
                            </motion.div>

                            {/* ── PILLAR 3: Tactical CTA ── */}
                            <motion.button
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.62 }}
                                whileHover={{ scale: (isLoading || !languageLoaded) ? 1 : 1.02 }}
                                whileTap={{ scale: (isLoading || !languageLoaded) ? 1 : 0.97 }}
                                onClick={handleStartTest}
                                disabled={isLoading || !languageLoaded}
                                className={cn(
                                    "w-full py-6 text-2xl font-black uppercase tracking-widest text-white rounded-[1.75rem] border-b-[8px] active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-4 shadow-lg relative overflow-hidden",
                                    (isLoading || !languageLoaded)
                                        ? "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed"
                                        : "bg-gradient-to-b from-[#58CC02] to-[#46a302] border-[#378200] cursor-pointer shadow-[0_8px_32px_rgba(88,204,2,0.4)]"
                                )}
                            >
                                {/* Gloss overlay */}
                                {!(isLoading || !languageLoaded) && (
                                    <div className="pointer-events-none absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-[1.75rem]" />
                                )}
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-7 w-7 animate-spin" />
                                        A PREPARAR...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-7 w-7 stroke-[3] fill-white/20" />
                                        COMEÇAR AVALIAÇÃO
                                        <ChevronRight className="h-7 w-7 stroke-[3]" />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    )}



                    {/* ====================== GRAMMAR ====================== */}
                    {phase === "grammar" && activeQuestion && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={questionsAnswered}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-emerald-100">
                                        <GraduationCap className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="border-2 border-slate-200 rounded-full px-3 py-1 font-semibold text-xs text-slate-600 tracking-wide uppercase">Fase 1: Gramática / Vocabulário</h2>
                                        <p className="text-xs text-slate-400">
                                            Questão {questionsAnswered + 1} de {GRAMMAR_QUESTION_COUNT}
                                        </p>
                                    </div>
                                </div>
                                <div className={cn("px-4 py-2 rounded-xl text-sm font-black border-2 border-b-4 shadow-sm", `bg-gradient-to-r ${LEVEL_COLORS[currentLevel]} border-blue-500 text-white`)}>
                                    {currentLevel}
                                </div>
                            </div>

                            {/* Question dots */}
                            <div className="flex gap-1.5 mb-6 justify-center flex-wrap">
                                {Array.from({ length: GRAMMAR_QUESTION_COUNT }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full transition-all",
                                            i < grammarAnswers.length
                                                ? grammarAnswers[i].correct ? "bg-green-500" : "bg-red-400"
                                                : i === questionsAnswered ? "bg-sky-500 animate-pulse scale-125" : "bg-slate-200"
                                        )}
                                    />
                                ))}
                            </div>

                            <div className="bg-white rounded-3xl border-2 border-b-8 border-slate-200 p-8 shadow-sm mb-6">
                                <div className="text-xl font-bold text-slate-800 text-center leading-relaxed">
                                    <InteractiveText text={activeQuestion.question} language={targetLanguage} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {activeQuestion.options.map((option, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrectOption = option.is_correct;
                                    
                                    let optionStyle = "border-slate-200 border-b-[8px] bg-white hover:border-slate-300 active:translate-y-[6px] active:border-b-[2px] hover:bg-slate-50 text-slate-600";

                                    if (isSelected) {
                                        optionStyle = "border-[#1899D6] border-b-[#1899D6] bg-[#DDF4FF] text-[#1CB0F6] active:translate-y-[6px] active:border-b-[2px] ring-2 ring-[#1CB0F6]/20";
                                    }

                                    if (showFeedback) {
                                        if (isCorrectOption) optionStyle = "border-[#58CC02] border-b-[#46A302] bg-[#D7FFB8] text-[#58CC02] scale-[1.02] shadow-xl z-10 border-b-[8px]";
                                        else if (isSelected && !isCorrectOption) optionStyle = "border-[#EA2B2B] border-b-[#EA2B2B] bg-[#FFDFE0] text-[#EA2B2B] opacity-60 border-b-[8px]";
                                        else optionStyle = "border-slate-200 bg-white opacity-40 scale-[0.96] border-b-[8px]";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleGrammarSelect(idx)}
                                            disabled={showFeedback}
                                            className={cn("relative w-full p-5 sm:p-7 rounded-[2rem] border-2 text-left font-bold transition-all flex items-center gap-6 group outline-none", optionStyle)}
                                        >
                                            <span className={cn(
                                                "shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-black border-2 border-b-[4px] transition-all group-active:border-b-[0px] group-active:translate-y-[4px]",
                                                isSelected && !showFeedback ? "bg-[#1CB0F6] border-[#0092d6] text-white" : 
                                                (showFeedback && isCorrectOption) ? "bg-green-500 border-green-600 text-white" :
                                                (showFeedback && isSelected && !isCorrectOption) ? "bg-red-500 border-red-600 text-white" :
                                                "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-500"
                                            )}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="text-lg flex-1 leading-snug">{option.text}</span>
                                            {showFeedback && isCorrectOption && <CheckCircle2 className="h-7 w-7 shrink-0 text-green-500 absolute right-4 drop-shadow-md" />}
                                            {showFeedback && isSelected && !isCorrectOption && <XCircle className="h-7 w-7 shrink-0 text-red-500 absolute right-4 drop-shadow-md" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ====================== READING ====================== */}
                    {phase === "reading" && currentReadingEx && currentReadingQ && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={`r-${readingExIdx}-${readingQIdx}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-sky-100">
                                        <BookOpen className="h-5 w-5 text-sky-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-700">Fase 2: Leitura</h2>
                                        <p className="text-xs text-slate-400">
                                            Texto {readingExIdx + 1} de {readingExercises.length} · Q{readingQIdx + 1}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-600">
                                    {estimatedLevel}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-sm mb-6 max-h-[250px] overflow-y-auto">
                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                                    <InteractiveText text={currentReadingEx.text} language={targetLanguage} />
                                </div>
                            </div>

                            <div className="text-lg font-bold text-slate-800 mb-4">
                                <InteractiveText text={currentReadingQ.question} language={targetLanguage} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {currentReadingQ.options.map((option, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrectOption = option.is_correct;
                                    
                                    let optionStyle = "border-slate-200 border-b-[8px] bg-white hover:border-slate-300 active:translate-y-[6px] active:border-b-[2px] hover:bg-slate-50 text-slate-600";

                                    if (isSelected) {
                                        optionStyle = "border-[#1899D6] border-b-[#1899D6] bg-[#DDF4FF] text-[#1CB0F6] active:translate-y-[6px] active:border-b-[2px] ring-2 ring-[#1CB0F6]/20";
                                    }

                                    if (readingShowFeedback) {
                                        if (isCorrectOption) optionStyle = "border-[#58CC02] border-b-[#46A302] bg-[#D7FFB8] text-[#58CC02] scale-[1.02] shadow-xl z-10 border-b-[8px]";
                                        else if (isSelected && !isCorrectOption) optionStyle = "border-[#EA2B2B] border-b-[#EA2B2B] bg-[#FFDFE0] text-[#EA2B2B] opacity-60 border-b-[8px]";
                                        else optionStyle = "border-slate-200 bg-white opacity-40 scale-[0.96] border-b-[8px]";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleReadingSelect(idx)}
                                            disabled={readingShowFeedback}
                                            className={cn("relative w-full p-5 sm:p-7 rounded-[2rem] border-2 text-left font-bold transition-all flex items-center gap-6 group outline-none", optionStyle)}
                                        >
                                            <span className={cn(
                                                "shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-black border-2 border-b-[4px] transition-all group-active:border-b-[0px] group-active:translate-y-[4px]",
                                                isSelected && !readingShowFeedback ? "bg-[#1CB0F6] border-[#0092d6] text-white" : 
                                                (readingShowFeedback && isCorrectOption) ? "bg-green-500 border-green-600 text-white" :
                                                (readingShowFeedback && isSelected && !isCorrectOption) ? "bg-red-500 border-red-600 text-white" :
                                                "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-500"
                                            )}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="text-lg flex-1 leading-snug">{option.text}</span>
                                            {readingShowFeedback && isCorrectOption && <CheckCircle2 className="h-7 w-7 shrink-0 text-green-500 absolute right-4 drop-shadow-md" />}
                                            {readingShowFeedback && isSelected && !isCorrectOption && <XCircle className="h-7 w-7 shrink-0 text-red-500 absolute right-4 drop-shadow-md" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ====================== LISTENING ====================== */}
                    {phase === "listening" && currentListeningEx && currentListeningQ && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={`l-${listeningExIdx}-${listeningQIdx}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-indigo-100">
                                        <Headphones className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-700">Fase 3: Audição</h2>
                                        <p className="text-xs text-slate-400">
                                            Áudio {listeningExIdx + 1} de {listeningExercises.length} · Q{listeningQIdx + 1}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-600">
                                    {estimatedLevel}
                                </div>
                            </div>

                            {/* Audio Player */}
                            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-6 mb-6 text-white shadow-lg shadow-indigo-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium">Passagem de Áudio {listeningExIdx + 1}</p>
                                        <p className="text-xs text-indigo-200 mt-1">Toca para ouvir. Podes repetir.</p>
                                    </div>
                                    <button
                                        onClick={handlePlayTTS}
                                        className={cn(
                                            "p-4 rounded-full transition-all",
                                            isSpeaking ? "bg-white/30 hover:bg-white/40 scale-110" : "bg-white/20 hover:bg-white/30 hover:scale-105"
                                        )}
                                    >
                                        {isSpeaking ? <VolumeX className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
                                    </button>
                                </div>
                                {isSpeaking && (
                                    <div className="flex gap-1 mt-4 justify-center">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="w-1 bg-white/60 rounded-full animate-pulse" style={{ height: `${Math.random() * 24 + 8}px`, animationDelay: `${i * 0.1}s` }} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="text-lg font-bold text-slate-800 mb-4">
                                <InteractiveText text={currentListeningQ.question} language={targetLanguage} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {currentListeningQ.options.map((option, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrectOption = option.is_correct;
                                    
                                    let optionStyle = "border-slate-200 border-b-[8px] bg-white hover:border-slate-300 active:translate-y-[6px] active:border-b-[2px] hover:bg-slate-50 text-slate-600";

                                    if (isSelected) {
                                        optionStyle = "border-[#1899D6] border-b-[#1899D6] bg-[#DDF4FF] text-[#1CB0F6] active:translate-y-[6px] active:border-b-[2px] ring-2 ring-[#1CB0F6]/20";
                                    }

                                    if (listeningShowFeedback) {
                                        if (isCorrectOption) optionStyle = "border-[#58CC02] border-b-[#46A302] bg-[#D7FFB8] text-[#58CC02] scale-[1.02] shadow-xl z-10 border-b-[8px]";
                                        else if (isSelected && !isCorrectOption) optionStyle = "border-[#EA2B2B] border-b-[#EA2B2B] bg-[#FFDFE0] text-[#EA2B2B] opacity-60 border-b-[8px]";
                                        else optionStyle = "border-slate-200 bg-white opacity-40 scale-[0.96] border-b-[8px]";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleListeningSelect(idx)}
                                            disabled={listeningShowFeedback}
                                            className={cn("relative w-full p-5 sm:p-7 rounded-[2rem] border-2 text-left font-bold transition-all flex items-center gap-6 group outline-none", optionStyle)}
                                        >
                                            <span className={cn(
                                                "shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-base sm:text-lg font-black border-2 border-b-[4px] transition-all group-active:border-b-[0px] group-active:translate-y-[4px]",
                                                isSelected && !listeningShowFeedback ? "bg-[#1CB0F6] border-[#0092d6] text-white" : 
                                                (listeningShowFeedback && isCorrectOption) ? "bg-green-500 border-green-600 text-white" :
                                                (listeningShowFeedback && isSelected && !isCorrectOption) ? "bg-red-500 border-red-600 text-white" :
                                                "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-500"
                                            )}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="text-lg flex-1 leading-snug">{option.text}</span>
                                            {listeningShowFeedback && isCorrectOption && <CheckCircle2 className="h-7 w-7 shrink-0 text-green-500 absolute right-4 drop-shadow-md" />}
                                            {listeningShowFeedback && isSelected && !isCorrectOption && <XCircle className="h-7 w-7 shrink-0 text-red-500 absolute right-4 drop-shadow-md" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ====================== WRITING ====================== */}
                    {phase === "writing" && writingTopic && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 rounded-lg bg-amber-100">
                                    <PenTool className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-700">Fase 4: Escrita</h2>
                                    <p className="text-xs text-slate-400">Escreve aproximadamente 50 palavras em {targetLanguage}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-sm mb-6">
                                <div className="flex items-center gap-2 mb-3 text-amber-500">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Tema</span>
                                </div>
                                <div className="text-xl font-bold text-slate-800 mb-2">
                                    <InteractiveText text={writingTopic.topic} language={targetLanguage} />
                                </div>
                                <div className="text-slate-500">
                                    <InteractiveText text={writingTopic.instruction} language={targetLanguage} />
                                </div>
                            </div>

                            <div className="mb-4">
                                <textarea
                                    value={writingText}
                                    onChange={(e) => setWritingText(e.target.value)}
                                    placeholder={`Escreve a tua resposta aqui em ${targetLanguage}...`}
                                    className="w-full min-h-[200px] p-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                    disabled={isLoading}
                                />
                                <div className="flex justify-between mt-2">
                                    <p className="text-xs text-slate-400">{writingText.trim().split(/\s+/).filter(Boolean).length} palavras</p>
                                    <p className="text-xs text-slate-400">Objetivo: ~50 palavras</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitWriting}
                                disabled={!writingText.trim() || isLoading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-amber-200 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-amber-600 active:border-b-2"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> A avaliar...</span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">Submeter e Obter Resultados <ArrowRight className="h-5 w-5" /></span>
                                )}
                            </button>
                        </div>
                    )}

                    {/* ====================== RESULTS (Bento Success Portal) ====================== */}
                    {phase === "results" && (
                        <div className="animate-in fade-in zoom-in-95 duration-1000">
                            {showConfetti && (
                                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                                    {[...Array(60)].map((_, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: "120vh", opacity: [0, 1, 1, 0], rotate: 360 }}
                                            transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity }}
                                            className="absolute" 
                                            style={{ left: `${Math.random() * 100}%`, fontSize: `${16 + Math.random() * 20}px` }}
                                        >
                                            {["🎉", "✨", "🎊", "⭐", "🏆", "💪", "🔥", "🌈"][Math.floor(Math.random() * 8)]}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
                                {/* Left Column: The Big Win */}
                                <div className="lg:col-span-5 flex flex-col gap-6">
                                    <motion.div 
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="relative bg-white rounded-[3rem] border-2 border-b-[12px] border-slate-200 p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden"
                                    >
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
                                        
                                        <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 mb-6">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                                                <motion.circle 
                                                    cx="50%" cy="50%" r="45%" fill="transparent" 
                                                    stroke={finalLevel.startsWith("A") ? "#58CC02" : finalLevel.startsWith("B") ? "#1CB0F6" : "#8b5cf6"} 
                                                    strokeWidth="12" 
                                                    strokeDasharray="100 100"
                                                    initial={{ strokeDashoffset: 100 }}
                                                    animate={{ strokeDashoffset: 0 }}
                                                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-6xl sm:text-7xl font-black text-slate-800 tracking-tighter">{finalLevel}</span>
                                                <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{LEVEL_LABELS[finalLevel] || "Level"}</span>
                                            </div>
                                            <motion.div 
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute -top-2 -right-2 bg-amber-400 w-12 h-12 rounded-2xl border-b-4 border-amber-600 flex items-center justify-center shadow-lg"
                                            >
                                                <Star className="h-7 w-7 text-white fill-white" />
                                            </motion.div>
                                        </div>

                                        <h1 className="text-4xl font-black text-slate-800 mb-2">Parabéns!</h1>
                                        <p className="text-slate-500 font-medium leading-relaxed">
                                            Concluíste a avaliação oficial. O teu domínio de {targetLanguage} é classificado como <span className="text-slate-800 font-black">{finalLevel}</span>.
                                        </p>
                                    </motion.div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Link href="/learn" className="flex flex-col items-center justify-center gap-3 py-6 bg-white border-2 border-slate-200 border-b-8 rounded-[2rem] font-black text-slate-500 hover:bg-slate-50 transition-all active:translate-y-1 active:border-b-4 group">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform"><Home className="h-6 w-6" /></div>
                                            Início
                                        </Link>
                                        <Link href="/practice" className="flex flex-col items-center justify-center gap-3 py-6 bg-[#58CC02] border-2 border-[#46a302] border-b-8 rounded-[2rem] font-black text-white hover:brightness-110 transition-all active:translate-y-1 active:border-b-4 group shadow-lg shadow-green-100">
                                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowRight className="h-6 w-6" /></div>
                                            Praticar
                                        </Link>
                                    </div>
                                </div>

                                {/* Right Column: Detailed Stats */}
                                <div className="lg:col-span-7 flex flex-col gap-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {[
                                            { icon: GraduationCap, label: "Gramática", detail: `${grammarAnswers.filter((a) => a.correct).length}/${GRAMMAR_QUESTION_COUNT} questões`, score: phaseResults.grammar.score, color: "text-emerald-500", bg: "bg-emerald-50" },
                                            { icon: BookOpen, label: "Leitura", detail: `${phaseResults.reading.correctCount}/${phaseResults.reading.totalCount} questões`, score: phaseResults.reading.score, color: "text-sky-500", bg: "bg-sky-50" },
                                            { icon: Headphones, label: "Audição", detail: `${phaseResults.listening.correctCount}/${phaseResults.listening.totalCount} questões`, score: phaseResults.listening.score, color: "text-indigo-500", bg: "bg-indigo-50" },
                                            { icon: PenTool, label: "Escrita", detail: "Avaliação por IA", score: phaseResults.writing.score || 100, color: "text-amber-500", bg: "bg-amber-50" },
                                        ].map(({ icon: Icon, label, detail, score, color, bg }, i) => (
                                            <motion.div 
                                                key={label}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.4 + i * 0.1 }}
                                                className="bg-white rounded-[2.5rem] border-2 border-b-[8px] border-slate-200 p-6 shadow-sm hover:translate-y-[-4px] transition-all"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bg)}>
                                                        <Icon className={cn("w-6 h-6", color)} />
                                                    </div>
                                                    <div className={cn("text-xl font-black", color)}>{score}%</div>
                                                </div>
                                                <h4 className="font-black text-slate-800 text-lg">{label}</h4>
                                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{detail}</p>
                                                
                                                <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${score}%` }}
                                                        transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
                                                        className={cn("h-full rounded-full", color.replace("text", "bg"))}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* AI Insight Box */}
                                    {gradeResult?.feedback && (
                                        <motion.div 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.8 }}
                                            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl"
                                        >
                                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                                <Sparkles className="w-32 h-32 text-[#58CC02]" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-[#58CC02] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20">
                                                        <Sparkles className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h3 className="text-xl font-black">Feedback da IA</h3>
                                                </div>
                                                <p className="text-slate-300 leading-relaxed font-medium italic">
                                                    "{gradeResult.feedback}"
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                    </div>

                    {/* ====================== VERIFY BUTTON ====================== */}
            {!feedbackActive && (phase === "grammar" || phase === "reading" || phase === "listening") && (
                <div className="fixed bottom-0 left-0 right-0 p-5 sm:p-8 pt-6 bg-white border-t-2 border-slate-200 z-40 shadow-[0_-20px_30px_rgba(0,0,0,0.03)]">
                    <div className="max-w-2xl mx-auto flex justify-center">
                        <button
                            onClick={() => {
                                if (phase === "grammar") handleGrammarVerify();
                                else if (phase === "reading") handleReadingVerify();
                                else if (phase === "listening") handleListeningVerify();
                            }}
                            disabled={selectedOption === null}
                            className={cn(
                                "w-full py-5 rounded-[1.5rem] font-black text-white text-xl tracking-wider uppercase transition-all duration-150",
                                selectedOption !== null 
                                    ? "bg-[#58CC02] hover:bg-[#46a302] border-b-[8px] border-[#46a302] active:translate-y-[8px] active:border-b-0 shadow-sm" 
                                    : "bg-[#E5E5E5] text-[#AFAFAF] border-b-[8px] border-[#d4d4d4] pointer-events-none"
                            )}
                        >
                            Verificar
                        </button>
                    </div>
                </div>
            )}

            {/* ====================== FEEDBACK BAR ====================== */}
            {feedbackActive && (() => {
                let evalQuestion = "";
                let evalUserAnswer = "";
                let evalCorrectAnswer = "";

                if (phase === "grammar" && activeQuestion) {
                    evalQuestion = activeQuestion.question;
                    evalUserAnswer = activeQuestion.options[selectedOption ?? 0]?.text || "";
                    evalCorrectAnswer = activeQuestion.options.find((o: any) => o.is_correct)?.text || "";
                } else if (phase === "reading" && currentReadingQ) {
                    evalQuestion = currentReadingQ.question;
                    evalUserAnswer = currentReadingQ.options[selectedOption ?? 0]?.text || "";
                    evalCorrectAnswer = currentReadingQ.options.find((o: any) => o.is_correct)?.text || "";
                } else if (phase === "listening" && currentListeningQ) {
                    evalQuestion = currentListeningQ.question;
                    evalUserAnswer = currentListeningQ.options[selectedOption ?? 0]?.text || "";
                    evalCorrectAnswer = currentListeningQ.options.find((o: any) => o.is_correct)?.text || "";
                }

                return (
                    <div className={cn("fixed bottom-0 left-0 right-0 z-above-modal animate-in slide-in-from-bottom duration-300", feedbackIsCorrect ? "bg-green-100 border-t-2 border-green-300" : "bg-red-100 border-t-2 border-red-300")}>
                        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-5 flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn("shrink-0 w-10 h-10 rounded-full flex items-center justify-center", feedbackIsCorrect ? "bg-green-500" : "bg-red-500")}>
                                        {feedbackIsCorrect ? <CheckCircle2 className="h-6 w-6 text-white" /> : <XCircle className="h-6 w-6 text-white" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={cn("font-extrabold text-lg", feedbackIsCorrect ? "text-green-700" : "text-red-700")}>
                                            {feedbackIsCorrect ? "Correto! 🎉" : "Incorreto 😔"}
                                        </p>
                                        <p className={cn("text-sm truncate", feedbackIsCorrect ? "text-green-600" : "text-red-600")}>
                                            {feedbackIsCorrect ? "Bom trabalho! Continua!" : "Não te preocupes, continua!"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleContinue}
                                    className={cn("w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl font-black text-xl text-white outline-none active:translate-y-[6px] active:border-b-0 uppercase tracking-widest transition-all shrink-0", feedbackIsCorrect ? "bg-[#58CC02] border-b-[6px] border-[#46a302]" : "bg-[#EA2B2B] border-b-[6px] border-[#cb2222]")}
                                >
                                    Continuar <span className="hidden sm:inline text-xs ml-1 opacity-70">↵</span>
                                </button>
                            </div>

                            {!feedbackIsCorrect && evalQuestion && (
                                <AITutorFeedback 
                                    question={evalQuestion}
                                    userAnswer={evalUserAnswer}
                                    correctAnswer={evalCorrectAnswer}
                                    targetLanguage={targetLanguage}
                                />
                            )}
                        </div>
                    </div>
                );
            })()}
            {/* ── INFORMATION MODAL (HD PLAY) ── */}
            <AnimatePresence>
                {isInfoModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsInfoModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] border-2 border-b-[12px] border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-8 border-b-2 border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#1CB0F6] rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sobre a Avaliação</h2>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Metodologia e Algoritmo</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsInfoModalOpen(false)}
                                    className="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="flex flex-col gap-8">
                                    {/* Introduction */}
                                    <section>
                                        <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-amber-500" /> Como funciona?
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed font-medium">
                                            A nossa avaliação utiliza um **sistema adaptativo inteligente** para medir a tua proficiência em tempo real. O teste está dividido em 4 pilares fundamentais que cobrem todas as competências do quadro CEFR.
                                        </p>
                                    </section>

                                    {/* The 4 Phases Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { icon: GraduationCap, title: "Gramática", desc: "15 questões adaptativas que ajustam a dificuldade com base nas tuas respostas.", color: "bg-[#58CC02]" },
                                            { icon: BookOpen, title: "Leitura", desc: "Análise de compreensão de texto e vocabulário contextual.", color: "bg-[#1CB0F6]" },
                                            { icon: Headphones, title: "Audição", desc: "Exercícios de escuta ativa e transcrição para avaliar o teu 'listening'.", color: "bg-[#CE82FF]" },
                                            { icon: PenTool, title: "Escrita", desc: "Redação livre avaliada instantaneamente pela nossa IA avançada.", color: "bg-[#FF9600]" },
                                        ].map((item, i) => (
                                            <div key={i} className="p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md", item.color)}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-black text-slate-800">{item.title}</h4>
                                                <p className="text-xs font-bold text-slate-500 leading-relaxed">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* AI Section */}
                                    <section className="p-6 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-20">
                                            <Sparkles className="w-24 h-24 text-[#58CC02]" />
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                                                <Star className="w-5 h-5 text-[#58CC02] fill-[#58CC02]" /> Avaliação por IA
                                            </h3>
                                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                O nosso algoritmo não conta apenas erros. Ele analisa a **complexidade das tuas frases**, a **variedade do vocabulário** e a **naturalidade da escrita**. Ao fim do teste, cruzamos os dados de todas as fases para te atribuir um nível CEFR (A1 a C2) extremamente preciso.
                                            </p>
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 bg-slate-50 border-t-2 border-slate-100">
                                <button
                                    onClick={() => setIsInfoModalOpen(false)}
                                    className="w-full py-4 bg-[#58CC02] border-b-[6px] border-[#46a302] rounded-2xl text-white font-black text-lg hover:brightness-110 active:translate-y-1 active:border-b-0 transition-all"
                                >
                                    Entendido!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
