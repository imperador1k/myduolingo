"use client";

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES, getLocaleForLanguage } from "@/lib/constants";
import Link from "next/link";
import { InteractiveText } from "@/components/ui/interactive-text";

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

    const handleGrammarAnswer = (optionIndex: number) => {
        if (showFeedback || !activeQuestion) return;

        const correct = activeQuestion.options[optionIndex]?.is_correct || false;
        setLockedQuestion(activeQuestion);
        setSelectedOption(optionIndex);
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

    const handleReadingAnswer = (optionIndex: number) => {
        if (readingShowFeedback || !currentReadingQ) return;

        const correct = currentReadingQ.options[optionIndex]?.is_correct || false;
        const newAnswers = [...readingAnswers, correct];
        setReadingAnswers(newAnswers);
        setReadingIsCorrect(correct);
        setReadingShowFeedback(true);

        pendingContinue.current = () => {
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

    const handleListeningAnswer = (optionIndex: number) => {
        if (listeningShowFeedback || !currentListeningQ) return;

        const correct = currentListeningQ.options[optionIndex]?.is_correct || false;
        const newAnswers = [...listeningAnswers, correct];
        setListeningAnswers(newAnswers);
        setListeningIsCorrect(correct);
        setListeningShowFeedback(true);

        pendingContinue.current = () => {
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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Bar */}
            {phase !== "results" && (
                <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
                    <div className="max-w-2xl mx-auto flex items-center gap-4">
                        <Link href="/learn" className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ChevronLeft className="h-8 w-8 sm:h-6 sm:w-6" />
                        </Link>
                        {phase !== "welcome" && (
                            <>
                                <div className="flex-1">
                                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-500 min-w-[60px] text-right">
                                    {Math.round(progress)}%
                                </span>
                            </>
                        )}
                        {phase === "welcome" && (
                            <div className="flex-1 flex justify-center sm:justify-start">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest sm:hidden opacity-0">Voltar</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
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

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-2xl">

                    {/* ====================== WELCOME ====================== */}
                    {phase === "welcome" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 mb-6 shadow-lg shadow-sky-200">
                                    <GraduationCap className="h-12 w-12 text-white" />
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3">
                                    Teste de Nível CEFR
                                </h1>
                                <p className="text-slate-500 text-lg max-w-md mx-auto">
                                    Descobre o teu nível de idioma em 4 fases. O teste adapta-se às tuas capacidades em tempo real.
                                </p>
                            </div>

                            {/* Language Selector */}
                            <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 mb-6">
                                <div className="flex items-center gap-2 mb-3 text-sky-500">
                                    <Globe className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Idioma Alvo</span>
                                </div>
                                {languageLoaded ? (
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all cursor-pointer"
                                    >
                                        {SUPPORTED_LANGUAGES.map((lang) => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="w-full h-12 rounded-xl bg-slate-100 animate-pulse" />
                                )}
                                <p className="text-xs text-slate-400 mt-2">
                                    Detetado automaticamente do teu curso ativo. Podes alterá-lo.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                {[
                                    { icon: GraduationCap, label: "Gramática", desc: "15 questões", color: "bg-emerald-100 text-emerald-600" },
                                    { icon: BookOpen, label: "Leitura", desc: "3 textos", color: "bg-sky-100 text-sky-600" },
                                    { icon: Headphones, label: "Audição", desc: "3 áudios", color: "bg-indigo-100 text-indigo-600" },
                                    { icon: PenTool, label: "Escrita", desc: "1 redação", color: "bg-amber-100 text-amber-600" },
                                ].map(({ icon: Icon, label, desc, color }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-100 bg-white"
                                    >
                                        <div className={cn("p-2 rounded-lg", color)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">{label}</span>
                                        <span className="text-[10px] text-slate-400">{desc}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleStartTest}
                                disabled={isLoading || !languageLoaded}
                                className="w-full py-4 px-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-green-600 active:border-b-2"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" /> A gerar o teste...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Começar Teste <ArrowRight className="h-5 w-5" />
                                    </span>
                                )}
                            </button>
                        </div>
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
                                        <h2 className="font-bold text-slate-700">Fase 1: Gramática e Vocabulário</h2>
                                        <p className="text-xs text-slate-400">
                                            Questão {questionsAnswered + 1} de {GRAMMAR_QUESTION_COUNT}
                                        </p>
                                    </div>
                                </div>
                                <div className={cn("px-3 py-1 rounded-full text-xs font-bold", `bg-gradient-to-r ${LEVEL_COLORS[currentLevel]} text-white`)}>
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

                            <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-sm mb-6">
                                <div className="text-xl font-bold text-slate-800 text-center leading-relaxed">
                                    <InteractiveText text={activeQuestion.question} language={targetLanguage} />
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {activeQuestion.options.map((option, idx) => {
                                    const isSelected = selectedOption === idx;
                                    const isCorrectOption = option.is_correct;
                                    let optionStyle = "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50 active:scale-[0.98]";

                                    if (showFeedback) {
                                        if (isCorrectOption) optionStyle = "border-green-400 bg-green-50 ring-2 ring-green-200";
                                        else if (isSelected && !isCorrectOption) optionStyle = "border-red-400 bg-red-50 ring-2 ring-red-200";
                                        else optionStyle = "border-slate-100 bg-slate-50 opacity-50";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleGrammarAnswer(idx)}
                                            disabled={showFeedback}
                                            className={cn("w-full p-4 rounded-xl border-2 border-b-4 text-left font-medium text-slate-700 transition-all", optionStyle)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span>{option.text}</span>
                                                {showFeedback && isCorrectOption && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto shrink-0" />}
                                                {showFeedback && isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-red-500 ml-auto shrink-0" />}
                                            </div>
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

                            <div className="grid gap-3">
                                {currentReadingQ.options.map((option, idx) => {
                                    const isSelected = readingShowFeedback && readingAnswers.length > 0;
                                    const lastAnswer = readingAnswers[readingAnswers.length - 1];
                                    const isCorrectOption = option.is_correct;
                                    let optionStyle = "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50 active:scale-[0.98]";

                                    if (readingShowFeedback) {
                                        if (isCorrectOption) optionStyle = "border-green-400 bg-green-50 ring-2 ring-green-200";
                                        else optionStyle = "border-slate-100 bg-slate-50 opacity-50";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleReadingAnswer(idx)}
                                            disabled={readingShowFeedback}
                                            className={cn("w-full p-4 rounded-xl border-2 border-b-4 text-left font-medium text-slate-700 transition-all", optionStyle)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span>{option.text}</span>
                                                {readingShowFeedback && isCorrectOption && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto shrink-0" />}
                                            </div>
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

                            <div className="grid gap-3">
                                {currentListeningQ.options.map((option, idx) => {
                                    const isCorrectOption = option.is_correct;
                                    let optionStyle = "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 active:scale-[0.98]";

                                    if (listeningShowFeedback) {
                                        if (isCorrectOption) optionStyle = "border-green-400 bg-green-50 ring-2 ring-green-200";
                                        else optionStyle = "border-slate-100 bg-slate-50 opacity-50";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleListeningAnswer(idx)}
                                            disabled={listeningShowFeedback}
                                            className={cn("w-full p-4 rounded-xl border-2 border-b-4 text-left font-medium text-slate-700 transition-all", optionStyle)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span>{option.text}</span>
                                                {listeningShowFeedback && isCorrectOption && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto shrink-0" />}
                                            </div>
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

                    {/* ====================== RESULTS ====================== */}
                    {phase === "results" && (
                        <div className="animate-in fade-in zoom-in-95 duration-700">
                            {showConfetti && (
                                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                                    {[...Array(50)].map((_, i) => (
                                        <div key={i} className="absolute animate-bounce" style={{ left: `${Math.random() * 100}%`, top: `-${Math.random() * 20}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 3}s`, fontSize: `${12 + Math.random() * 16}px` }}>
                                            {["🎉", "✨", "🎊", "⭐", "🏆", "💪", "🔥"][Math.floor(Math.random() * 7)]}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <div
                                    className="inline-flex items-center justify-center w-32 h-32 rounded-full shadow-2xl mb-4 relative"
                                    style={{ background: `linear-gradient(135deg, ${finalLevel.startsWith("A") ? "#34d399" : finalLevel.startsWith("B") ? "#38bdf8" : "#8b5cf6"}, ${finalLevel.startsWith("A") ? "#10b981" : finalLevel.startsWith("B") ? "#6366f1" : "#7c3aed"})` }}
                                >
                                    <div className="text-center text-white">
                                        <div className="text-4xl font-extrabold">{finalLevel}</div>
                                        <div className="text-xs font-medium opacity-80">{LEVEL_LABELS[finalLevel] || "Level"}</div>
                                    </div>
                                    <div className="absolute -top-2 -right-2">
                                        <Star className="h-8 w-8 text-amber-400 fill-amber-400 drop-shadow-md" />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-extrabold text-slate-800 mb-2">🎉 Parabéns!</h1>
                                <p className="text-slate-500 text-lg">
                                    O teu nível de {targetLanguage} é <span className="font-extrabold text-slate-800">{finalLevel}</span>
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-sm mb-6">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-amber-500" /> Análise de Desempenho
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: GraduationCap, label: "Gramática e Vocabulário", detail: `${grammarAnswers.filter((a) => a.correct).length}/${GRAMMAR_QUESTION_COUNT} corretas`, score: `${phaseResults.grammar.score}%`, color: "bg-emerald-100 text-emerald-600" },
                                        { icon: BookOpen, label: "Leitura", detail: `${phaseResults.reading.correctCount}/${phaseResults.reading.totalCount} corretas`, score: `${phaseResults.reading.score}%`, color: "bg-sky-100 text-sky-600" },
                                        { icon: Headphones, label: "Audição", detail: `${phaseResults.listening.correctCount}/${phaseResults.listening.totalCount} corretas`, score: `${phaseResults.listening.score}%`, color: "bg-indigo-100 text-indigo-600" },
                                        { icon: PenTool, label: "Escrita", detail: "Avaliado pela IA", score: "✓", color: "bg-amber-100 text-amber-600" },
                                    ].map(({ icon: Icon, label, detail, score, color }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", color)}><Icon className="h-4 w-4" /></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-700">{label}</p>
                                                <p className="text-xs text-slate-400">{detail}</p>
                                            </div>
                                            <span className={cn("text-sm font-bold", color.split(" ")[1])}>{score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {gradeResult?.feedback && (
                                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border-2 border-violet-100 p-6 mb-6">
                                    <h3 className="font-bold text-violet-700 mb-2 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" /> Feedback da IA
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">{gradeResult.feedback}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/learn" className="flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-slate-200 border-b-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all active:border-b-2">
                                    <Home className="h-5 w-5" /> Início
                                </Link>
                                <Link href="/practice" className="flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-2xl border-b-4 border-green-600 hover:shadow-lg transition-all active:border-b-2">
                                    Praticar <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ====================== FEEDBACK BAR ====================== */}
            {feedbackActive && (
                <div className={cn("fixed bottom-0 left-0 right-0 z-[90] animate-in slide-in-from-bottom duration-300", feedbackIsCorrect ? "bg-green-100 border-t-2 border-green-300" : "bg-red-100 border-t-2 border-red-300")}>
                    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between gap-4">
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
                            className={cn("shrink-0 px-6 py-3 rounded-2xl font-extrabold text-white shadow-md border-b-4 transition-all hover:scale-[1.03] active:scale-[0.97] active:border-b-2", feedbackIsCorrect ? "bg-green-500 border-green-700 hover:bg-green-600" : "bg-red-500 border-red-700 hover:bg-red-600")}
                        >
                            Continuar <span className="hidden sm:inline text-xs ml-1 opacity-70">↵</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
