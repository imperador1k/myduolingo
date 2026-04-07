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
        <div className="min-h-screen bg-[#f7f7f8] flex flex-col font-sans overflow-x-hidden">
            {/* SUPER ADVANCED GAMIFIED HEADER */}
              {phase !== "results" && (
                  <div className="sticky top-[0px] z-50 bg-[#f7f7f8]/90 backdrop-blur-xl border-b-[3px] border-slate-200/60 pt-4 sm:pt-6 pb-4 px-4 md:px-8 w-full shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)]">
                      <div className="max-w-4xl mx-auto w-full flex items-center gap-4 sm:gap-6">
                          
                          {/* Close / Back Button */}
                          <Link
                              href="/learn"
                              className="shrink-0 p-3 sm:p-4 bg-white rounded-[1.25rem] border-2 border-slate-200 border-b-4 text-slate-400 hover:text-slate-500 hover:bg-slate-50 active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center shadow-sm group"
                          >
                              <XCircle className="h-6 w-6 sm:h-7 sm:w-7 stroke-[3] group-hover:text-red-400 transition-colors" />
                          </Link>

                          {/* Massive 3D Progress Bar System */}
                          {phase !== "welcome" && (
                              <div className="flex-1 relative flex items-center gap-3 sm:gap-5">
                                  
                                  {/* Floating Phase Icon */}
                                  <div className="hidden sm:flex shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] items-center justify-center shadow-sm z-10 relative">
                                      {phase === "grammar" && <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 text-[#58CC02] stroke-[2.5]" />}
                                      {phase === "reading" && <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-[#1CB0F6] stroke-[2.5]" />}
                                      {phase === "listening" && <Headphones className="h-6 w-6 sm:h-7 sm:w-7 text-[#CE82FF] stroke-[2.5]" />}
                                      {phase === "writing" && <PenTool className="h-6 w-6 sm:h-7 sm:w-7 text-[#FF9600] stroke-[2.5]" />}
                                  </div>

                                  {/* Main Bar Wrapper */}
                                  <div className="flex-1 h-6 sm:h-[24px] bg-slate-200/90 rounded-full relative overflow-hidden border-2 border-slate-200/50 shadow-inner">
                                      {/* Color track */}
                                      <div
                                          className={cn(
                                              "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out border-r-[3px] border-white/20",
                                              phase === "grammar" && "bg-[#58CC02]",
                                              phase === "reading" && "bg-[#1CB0F6]",
                                              phase === "listening" && "bg-[#CE82FF]",
                                              phase === "writing" && "bg-[#FF9600]"
                                          )}
                                          style={{ width: `${progress}%` }}
                                      >
                                          {/* Shiny Top Reflection */}
                                          <div className="absolute top-1 left-3 right-3 h-[6px] sm:h-[8px] bg-white/30 rounded-full" />
                                          {/* Animated Gradient Stripes overlay */}
                                          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[pushScroll_2s_linear_infinite]" />
                                      </div>
                                  </div>

                                  {/* Percentage Pill */}
                                  <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white rounded-xl border-2 border-slate-200 border-b-4 font-black text-slate-500 text-sm sm:text-base shadow-sm shrink-0 tabular-nums min-w-[3.5rem] sm:min-w-[4.5rem] text-center">
                                      {Math.round(progress)}%
                                  </div>
                              </div>
                          )}
                          
                          {phase === "welcome" && (
                              <div className="flex-1" />
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
            <div className="flex-1 flex flex-col p-4 sm:p-8 pt-6 sm:pt-10 w-full max-w-5xl mx-auto">
                <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 pb-24 sm:pb-36 pt-2">

                    {/* ====================== WELCOME ====================== */}
                    {phase === "welcome" && (
                        <div className="animate-in fade-in zoom-in-95 duration-500 w-full max-w-xl mx-auto flex flex-col gap-6">
                            
                            {/* Central Bento Box for Intro */}
                            <div className="bg-white rounded-[2rem] border-2 border-b-[8px] border-slate-200 p-8 pt-10 text-center relative shadow-sm mt-8">
                                {/* Floating Lottie Mascot */}
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 drop-shadow-xl select-none pointer-events-none">
                                    <LottieAnimation className="w-full h-full" />
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mt-10 mb-4 leading-tight">
                                    Avaliação <span className="text-[#1CB0F6] block mt-1">CEFR Master</span>
                                </h1>
                                <p className="text-slate-500 text-lg md:text-xl font-medium max-w-sm mx-auto leading-relaxed">
                                    Descobre a tua fluência em 4 fases interativas. Um teste inteligente em tempo real.
                                </p>
                            </div>

                            {/* Gamified Bento Grid for Skills */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: GraduationCap, label: "Gramática", desc: "15 questões", bg: "bg-[#58CC02]", border: "border-[#46A302]", iconCol: "text-white", ring: "ring-[#58CC02]/30" },
                                    { icon: BookOpen, label: "Leitura", desc: "3 textos", bg: "bg-[#1CB0F6]", border: "border-[#0092D6]", iconCol: "text-white", ring: "ring-[#1CB0F6]/30" },
                                    { icon: Headphones, label: "Audição", desc: "3 áudios", bg: "bg-[#CE82FF]", border: "border-[#A547D9]", iconCol: "text-white", ring: "ring-[#CE82FF]/30" },
                                    { icon: PenTool, label: "Escrita", desc: "1 redação", bg: "bg-[#FF9600]", border: "border-[#D67B00]", iconCol: "text-white", ring: "ring-[#FF9600]/30" },
                                ].map(({ icon: Icon, label, desc, bg, border, iconCol, ring }) => (
                                    <div key={label} className={cn("bg-white rounded-2xl border-2 border-slate-200 p-4 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-md flex items-center gap-4 cursor-default group active:translate-y-1 relative overflow-hidden")}>
                                        <div className={cn("w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border-b-[4px] shadow-sm transition-transform group-active:translate-y-[2px] group-hover:scale-105 group-active:border-b-2", bg, border)}>
                                            <Icon className={cn("h-6 w-6 stroke-[2.5]", iconCol)} />
                                        </div>
                                        <div className="flex flex-col items-start pr-2">
                                            <span className="text-[15px] font-black text-slate-700 leading-tight">{label}</span>
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 opacity-80">{desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Language Selector Bento */}
                            <div className="bg-white rounded-3xl border-2 border-b-[6px] border-slate-200 p-3 pl-5 flex items-center justify-between gap-4 transition-all focus-within:border-sky-300 focus-within:border-b-sky-400 focus-within:ring-4 ring-sky-300/30 shadow-sm relative group hover:border-sky-200">
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
                                                <option key={lang.value} value={lang.value}>
                                                    {lang.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 h-14 rounded-[1.25rem] bg-slate-100 border-2 border-slate-200 animate-pulse" />
                                )}
                            </div>

                            {/* 3D Gamified CTA Button */}
                            <button
                                onClick={handleStartTest}
                                disabled={isLoading || !languageLoaded}
                                className={cn(
                                    "w-full mt-2 py-5 text-xl font-black uppercase tracking-wider text-white rounded-2xl border-b-[6px] active:border-b-0 active:translate-y-[6px] transition-all flex items-center justify-center gap-3 shadow-sm",
                                    (isLoading || !languageLoaded) 
                                        ? "bg-[#e5e5e5] border-[#d4d4d4] text-[#a3a3a3] cursor-not-allowed" 
                                        : "bg-[#58CC02] hover:bg-[#46a302] border-[#46a302] cursor-pointer"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-7 w-7 animate-spin" /> A PREPARAR...
                                    </>
                                ) : (
                                    <>
                                        COMEÇAR TESTE <Rocket className="h-6 w-6 stroke-[3]" />
                                    </>
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
                                            {/* Massive Spacer to Guarantee Scroll clearance */}
                            <div className="h-48 sm:h-64 w-full shrink-0 pointer-events-none" />
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
                    <div className={cn("fixed bottom-0 left-0 right-0 z-[90] animate-in slide-in-from-bottom duration-300", feedbackIsCorrect ? "bg-green-100 border-t-2 border-green-300" : "bg-red-100 border-t-2 border-red-300")}>
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
        </div>
    );
}
