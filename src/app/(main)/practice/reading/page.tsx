"use client";

import { useEffect, useState, useTransition } from "react";
import { generateReadingText, analyzeReading } from "@/actions/gemini";
import { savePracticeSession } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Send, BookOpen, CheckCircle2, Shuffle, Target, AlertCircle, FileText, HelpCircle, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

// Types for the new C2 Exam Structure
interface Question {
    question: string;
    options: { text: string; correct: boolean }[];
    explanation: string;
}

interface ExamData {
    article_title: string;
    article_body: string;
    questions: Question[];
    essay_prompt: string;
    languageCode?: string;
}

import { PracticeSetup } from "@/components/practice-setup";

// ... Types ...

export default function ReadingPracticePage() {
    const [examData, setExamData] = useState<ExamData | null>(null);
    // Setup State
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [config, setConfig] = useState<{ language: string; level: string; mode: "random" | "focus" } | null>(null);

    // Exam State
    const [currentStep, setCurrentStep] = useState<"mcq" | "review" | "essay" | "analysis">("mcq");
    const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);
    const [showMcqResults, setShowMcqResults] = useState(false);
    const [userEssay, setUserEssay] = useState("");

    const [essayFeedback, setEssayFeedback] = useState<{
        feedback: string;
        score: number;
        strengths: string[];
        improvements: string[];
    } | null>(null);

    const [isGenerating, startGenerationTransition] = useTransition();
    const [isAnalyzing, startAnalysisTransition] = useTransition();

    const handleStartSession = (newConfig: { language: string; level: string; mode: "random" | "focus" }) => {
        setConfig(newConfig);
        setIsSetupComplete(true);
        handleGenerateExam(newConfig);
    };

    const handleGenerateExam = (cfg = config) => {
        if (!cfg) return;
        startGenerationTransition(async () => {
            // Reset State
            setExamData(null);
            setCurrentStep("mcq");
            setMcqAnswers([]);
            setShowMcqResults(false);
            setUserEssay("");
            setEssayFeedback(null);

            const data = await generateReadingText(cfg.level, cfg.language, cfg.mode === "focus");
            setExamData(data as any);
            if (data && data.questions) {
                setMcqAnswers(new Array(data.questions.length).fill(-1));
            }
        });
    };

    const handleMcqSelect = (questionIndex: number, optionIndex: number) => {
        if (showMcqResults) return;
        const newAnswers = [...mcqAnswers];
        newAnswers[questionIndex] = optionIndex;
        setMcqAnswers(newAnswers);
    };

    const handleSubmitMcq = () => {
        if (mcqAnswers.includes(-1)) {
            alert("Please answer all questions before submitting.");
            return;
        }
        setShowMcqResults(true);
        setCurrentStep("review");
    };

    const handleProceedToEssay = () => {
        setCurrentStep("essay");
    };

    const handleSubmitEssay = () => {
        if (!userEssay.trim() || !examData || !config) return;

        startAnalysisTransition(async () => {
            const result = await analyzeReading(userEssay, examData.essay_prompt, config.level, config.language);
            setEssayFeedback(result);
            setCurrentStep("analysis");

            try {
                await savePracticeSession({
                    type: "reading",
                    prompt: examData.article_title,
                    promptData: examData,
                    userInput: JSON.stringify({ mcqAnswers, userEssay }),
                    feedback: result,
                    score: result.score,
                });
            } catch (err) {
                console.error("Failed to save session:", err);
            }
        });
    };

    if (!isSetupComplete) {
        return <PracticeSetup type="reading" onStart={handleStartSession} />;
    }

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{config?.language || "Language"} Reading</h1>
                        <p className="text-xs text-slate-500 font-medium">Level {config?.level} • {config?.mode === 'focus' ? 'Course Focus' : 'Random Topic'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => handleGenerateExam()} disabled={isGenerating} size="sm" variant="sidebarOutline">
                        <RefreshCw className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />
                        New Exam
                    </Button>
                </div>
            </div>

            {/* Main Content - Two Column Split */}
            <div className="flex-1 flex overflow-hidden">
                {isGenerating ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">Generating C2 Exam Material...</h3>
                        <p className="text-slate-500">Creating complex text and inference questions.</p>
                    </div>
                ) : !examData ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        Failed to load exam. Try again.
                    </div>
                ) : (
                    <>
                        {/* LEFT COLUMN: The Text (Always Visible) */}
                        <div className="w-1/2 p-8 overflow-y-auto border-r border-slate-200 bg-white scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            <article className="prose prose-slate lg:prose-lg max-w-none">
                                <h1 className="text-3xl font-extrabold text-slate-800 mb-6 leading-tight">
                                    {examData.article_title}
                                </h1>
                                <div className="text-justify font-serif text-slate-700 leading-8">
                                    <ReactMarkdown>{examData.article_body}</ReactMarkdown>
                                </div>
                            </article>
                        </div>

                        {/* RIGHT COLUMN: The Exam (Steps) */}
                        <div className="w-1/2 flex flex-col bg-slate-50/50">
                            {/* Steps Indicator */}
                            <div className="flex items-center border-b border-slate-200 bg-white px-6 py-3">
                                {[
                                    { id: "mcq", label: "Comprehension", icon: HelpCircle },
                                    { id: "essay", label: "Critical Essay", icon: PenTool },
                                    { id: "analysis", label: "Results", icon: FileText },
                                ].map((step, idx) => {
                                    const isActive = currentStep === step.id || (step.id === "mcq" && currentStep === "review");
                                    const isCompleted = (step.id === "mcq" && (currentStep === "essay" || currentStep === "analysis")) || (step.id === "essay" && currentStep === "analysis");

                                    return (
                                        <div key={step.id} className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                                            isActive ? "bg-emerald-100 text-emerald-800" : isCompleted ? "text-emerald-600" : "text-slate-400"
                                        )}>
                                            <step.icon className="h-4 w-4" />
                                            {step.label}
                                            {idx < 2 && <div className="ml-4 h-4 w-[1px] bg-slate-200" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Scrollable Question Area */}
                            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-200">

                                {/* PHASE 1: MCQs */}
                                {(currentStep === "mcq" || currentStep === "review") && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                                            <p className="text-blue-800 text-sm font-medium flex gap-2">
                                                <AlertCircle className="h-5 w-5 shrink-0" />
                                                Task 1: Read the text carefully and answer the 5 inference questions. Watch out for traps!
                                            </p>
                                        </div>

                                        {examData.questions?.map((q, qIdx) => (
                                            <div key={qIdx} className="space-y-3">
                                                <h3 className="font-bold text-slate-800 text-lg">
                                                    <span className="text-emerald-600 mr-2">{qIdx + 1}.</span>
                                                    {q.question}
                                                </h3>
                                                <div className="space-y-2 pl-4">
                                                    {q.options.map((opt, oIdx) => {
                                                        const isSelected = mcqAnswers[qIdx] === oIdx;
                                                        const isCorrect = opt.correct;

                                                        let style = "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"; // Default

                                                        if (showMcqResults) {
                                                            if (isCorrect) style = "border-emerald-500 bg-emerald-100 text-emerald-900 font-bold";
                                                            else if (isSelected && !isCorrect) style = "border-red-500 bg-red-100 text-red-900";
                                                            else style = "border-slate-200 bg-white opacity-60";
                                                        } else if (isSelected) {
                                                            style = "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500";
                                                        }

                                                        return (
                                                            <div
                                                                key={oIdx}
                                                                onClick={() => handleMcqSelect(qIdx, oIdx)}
                                                                className={cn(
                                                                    "p-3 rounded-lg border-2 cursor-pointer transition-all text-base",
                                                                    style
                                                                )}
                                                            >
                                                                {opt.text}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                {showMcqResults && (
                                                    <div className="ml-4 mt-2 p-3 bg-slate-100 rounded-md border border-slate-200 text-sm text-slate-600 italic">
                                                        <span className="font-bold text-slate-700">Explanation:</span> {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <div className="pt-6 border-t border-slate-200">
                                            {!showMcqResults ? (
                                                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmitMcq}>
                                                    Check Answers
                                                </Button>
                                            ) : (
                                                <Button size="lg" className="w-full" onClick={handleProceedToEssay}>
                                                    Proceed to Critical Essay <Send className="ml-2 h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* PHASE 2: ESSAY */}
                                {(currentStep === "essay" || currentStep === "analysis") && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-6">
                                            <p className="text-indigo-800 text-sm font-medium flex gap-2">
                                                <PenTool className="h-5 w-5 shrink-0" />
                                                Task 2: Critical Essay. Argue your point based on the text.
                                            </p>
                                        </div>

                                        <div className="p-5 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-800 text-lg mb-2">Prompt:</h3>
                                            <p className="text-lg text-slate-700 italic border-l-4 border-emerald-500 pl-4 py-1">
                                                "{examData.essay_prompt}"
                                            </p>
                                        </div>

                                        {currentStep === "essay" ? (
                                            <>
                                                <Textarea
                                                    placeholder="Write your essay here (min. 150 words recommended)..."
                                                    value={userEssay}
                                                    onChange={(e) => setUserEssay(e.target.value)}
                                                    className="min-h-[300px] text-lg p-4 resize-none shadow-inner bg-white"
                                                />
                                                <Button
                                                    size="lg"
                                                    disabled={isAnalyzing || !userEssay.trim()}
                                                    onClick={handleSubmitEssay}
                                                    className="w-full"
                                                >
                                                    {isAnalyzing ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Proficiency...
                                                        </>
                                                    ) : (
                                                        <>Submit Essay for Grading <FileText className="ml-2 h-4 w-4" /></>
                                                    )}
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 text-slate-600 text-sm max-h-40 overflow-y-auto italic">
                                                    Your Essay:<br />{userEssay}
                                                </div>

                                                {essayFeedback && (
                                                    <div className={cn(
                                                        "rounded-xl border-2 p-6 space-y-4",
                                                        essayFeedback.score >= 80 ? "border-emerald-200 bg-emerald-50" :
                                                            essayFeedback.score >= 60 ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"
                                                    )}>
                                                        <div className="flex items-center justify-between">
                                                            <h2 className="text-xl font-bold text-slate-800">C2 Assessment</h2>
                                                            <span className="text-2xl font-black">{essayFeedback.score}/100</span>
                                                        </div>

                                                        <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                                                            {essayFeedback.feedback}
                                                        </p>

                                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                                            <div className="bg-white/60 p-3 rounded-lg">
                                                                <p className="font-bold text-emerald-700 mb-1 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Strengths</p>
                                                                <ul className="text-sm list-disc list-inside text-emerald-900">
                                                                    {essayFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                                                </ul>
                                                            </div>
                                                            <div className="bg-white/60 p-3 rounded-lg">
                                                                <p className="font-bold text-amber-700 mb-1 flex items-center gap-1"><Target className="h-4 w-4" /> Improvements</p>
                                                                <ul className="text-sm list-disc list-inside text-amber-900">
                                                                    {essayFeedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                                                                </ul>
                                                            </div>
                                                        </div>

                                                        <Button onClick={() => handleGenerateExam()} className="w-full mt-4" variant="sidebarOutline">
                                                            Start New Exam
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
