"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { generateListeningScript, analyzeListening } from "@/actions/gemini";
import { savePracticeSession } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Send, Headphones, Play, Pause, Square, Eye, EyeOff, CheckCircle2, AlertCircle, Mic, Keyboard, Shuffle, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTTS } from "@/hooks/use-tts";
import { getLocaleForLanguage } from "@/lib/constants";

import { PracticeSetup } from "@/components/shared/practice-setup";
import { AILoadingScreen } from "@/components/ui/ai-loading-screen";
import { InteractiveText } from "@/components/ui/interactive-text";

export default function ListeningPracticePage() {
    const [scriptData, setScriptData] = useState<{ script: string; topic: string; questions?: string[] } | null>(null);
    // Setup State
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [config, setConfig] = useState<{ language: string; level: string; mode: "random" | "focus" } | null>(null);

    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [inputMode, setInputMode] = useState<"text" | "voice">("text");
    const [isRecording, setIsRecording] = useState(false);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);

    // Audio State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [hasAudioFinished, setHasAudioFinished] = useState(false);
    const [showScript, setShowScript] = useState(false);
    const [feedback, setFeedback] = useState<{
        feedback: string;
        score: number;
        missedPoints?: string[];
    } | null>(null);

    const [isGenerating, startGenerationTransition] = useTransition();
    const [isAnalyzing, startAnalysisTransition] = useTransition();

    // Speech Refs
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const recognitionRef = useRef<any>(null);

    const handleStartSession = (newConfig: { language: string; level: string; mode: "random" | "focus" }) => {
        setConfig(newConfig);
        setIsSetupComplete(true);
        handleGenerateScript(newConfig);
    };

    // Correctly initialize useTTS with the selected target language (BCP-47 locale)
    // getLocaleForLanguage converts 'Spanish' â†’ 'es-ES', etc.
    const targetLocale = config ? getLocaleForLanguage(config.language) : "en-US";
    const { playAudio: playTTS } = useTTS(targetLocale);

    const stopAudio = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    };

    const pauseAudio = () => {
        window.speechSynthesis.pause();
        setIsPlaying(false);
        setIsPaused(true);
    };

    const playAudio = () => {
        if (!scriptData) return;
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }
        setIsPlaying(true);
        setIsPaused(false);
        setHasAudioFinished(false);
        // Play script text in the target language locale
        playTTS(scriptData.script, 0.85, targetLocale);
        // Simulate end detection (Web Speech API onend not accessible via hook directly)
        const estimatedDuration = Math.max(3000, scriptData.script.length * 60);
        setTimeout(() => {
            setIsPlaying(false);
            setIsPaused(false);
            setHasAudioFinished(true);
        }, estimatedDuration);
    };

    const handleGenerateScript = (cfg = config) => {
        if (!cfg) return;
        stopAudio();
        startGenerationTransition(async () => {
            setFeedback(null);
            setUserAnswers([]);
            setShowScript(false);
            setHasAudioFinished(false);

            const data = await generateListeningScript(cfg.level, cfg.language, cfg.mode === "focus");
            setScriptData(data);
            if (data?.questions) {
                setUserAnswers(new Array(data.questions.length).fill(""));
            }
        });
    };

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("O teu browser não suporta reconhecimento de voz.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US"; // Ideally match config.language code
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript && activeQuestionIndex !== null) {
                setUserAnswers(prev => {
                    const newAnswers = [...prev];
                    const current = newAnswers[activeQuestionIndex];
                    newAnswers[activeQuestionIndex] = current + (current ? " " : "") + finalTranscript;
                    return newAnswers;
                });
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            setActiveQuestionIndex(null);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    };

    const handleTextChange = (index: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
    };

    const handleSubmit = () => {
        if (!scriptData || !config || userAnswers.every(a => !a.trim())) return;

        stopAudio();
        startAnalysisTransition(async () => {
            const formattedAnswers = scriptData.questions?.map((q, i) => ({
                question: q,
                answer: userAnswers[i] || "No answer provided.",
            })) || [];

            const result = await analyzeListening(JSON.stringify(formattedAnswers), scriptData.topic, scriptData.script, config.level, config.language);
            setFeedback(result);
            setShowScript(true);

            try {
                await savePracticeSession({
                    type: "listening",
                    language: config.language,
                    cefrLevel: config.level,
                    prompt: scriptData.topic,
                    promptData: scriptData,
                    userInput: JSON.stringify(formattedAnswers),
                    feedback: result,
                    score: result.score,
                });
            } catch (err) {
                console.error("Failed to save session:", err);
            }
        });
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    if (!isSetupComplete) {
        return <PracticeSetup type="listening" onStart={handleStartSession} />;
    }

    if (isGenerating) {
        return <AILoadingScreen message="A Gerar Módulo Auditivo..." submessage="A IA está a preparar um áudio nativo" />;
    }

    return (
        <div className="mx-auto max-w-[900px] px-6 py-8 pb-20">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                    <Headphones className="h-8 w-8 text-indigo-600" />
                    Listening Practice
                </h1>
                <Button variant="sidebar" size="sm" onClick={() => handleGenerateScript()} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    New Audio
                </Button>
            </div>
            {config && (
                <div className="mb-6 flex justify-center">
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        <span className="font-bold text-slate-700">{config.language}</span>
                        <span>â€¢</span>
                        <span className="font-bold text-slate-700">{config.level}</span>
                        <span>â€¢</span>
                        <span className="font-bold text-slate-700 uppercase">{config.mode}</span>
                    </div>
                </div>
            )}


            {/* Audio Control Card */}
            <div className="mb-8 rounded-xl border-2 border-slate-200 bg-white p-8 shadow-sm text-center">
                {scriptData ? (
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wide text-indigo-400 mb-2">Topic</p>
                            <h2 className="text-2xl font-bold text-slate-800">
                                {hasAudioFinished ? scriptData.topic : <span className="blur-sm select-none">Hidden Topic (Listen First)</span>}
                            </h2>
                        </div>

                        <div className="flex justify-center gap-4">
                            {isPlaying ? (
                                <Button
                                    size="lg"
                                    onClick={pauseAudio}
                                    className="w-40 h-14 text-lg rounded-full bg-amber-500 hover:bg-amber-600 shadow-lg hover:scale-105 transition-transform"
                                >
                                    <Pause className="mr-2 h-6 w-6 fill-current" /> Pause
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    onClick={playAudio}
                                    className={cn(
                                        "w-40 h-14 text-lg rounded-full shadow-lg hover:scale-105 transition-transform",
                                        isPaused ? "bg-emerald-500 hover:bg-emerald-600" : "bg-indigo-500 hover:bg-indigo-600"
                                    )}
                                >
                                    <Play className="mr-2 h-6 w-6 fill-current" /> {isPaused ? "Resume" : "Listen"}
                                </Button>
                            )}

                            {(isPlaying || isPaused) && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={stopAudio}
                                    className="h-14 w-14 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    title="Stop and Reset"
                                >
                                    <Square className="h-6 w-6 fill-current" />
                                </Button>
                            )}
                        </div>

                        {scriptData.questions && (
                            <div className={cn(
                                "text-center mb-4 transition-all duration-500",
                                !hasAudioFinished && "opacity-50 blur-[2px] select-none grayscale"
                            )}>
                                <p className="font-bold text-slate-500 uppercase tracking-wide flex items-center justify-center gap-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-indigo-400" />
                                    {hasAudioFinished ? "Play the audio to discover the answers!" : "Questions are locked while audio plays..."}
                                </p>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* User Input Area */}
            <div className="mb-8 grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-700">Your Analysis</h3>
                            <p className="text-sm text-slate-400">Write or speak about what you heard.</p>
                        </div>

                        {/* Input Mode Toggle */}
                        <div className="flex p-1 bg-slate-100 rounded-lg">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setInputMode('text')}
                                className={cn("px-3 py-1 h-8 rounded-md", inputMode === 'text' && "bg-white shadow-sm text-indigo-600 font-bold")}
                            >
                                <Keyboard className="h-4 w-4 mr-1" /> Text
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setInputMode('voice')}
                                className={cn("px-3 py-1 h-8 rounded-md", inputMode === 'voice' && "bg-white shadow-sm text-indigo-600 font-bold")}
                            >
                                <Mic className="h-4 w-4 mr-1" /> Voice
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {scriptData?.questions?.map((q, idx) => (
                            <div key={idx} className={cn("bg-white p-4 rounded-xl border-2 transition-all", hasAudioFinished ? "border-slate-200" : "border-slate-100 opacity-50 select-none")}>
                                <h4 className="font-bold text-slate-700 mb-3 flex items-start gap-2">
                                    <span className="text-indigo-500 bg-indigo-50 px-2 rounded">{idx+1}.</span>
                                    {hasAudioFinished ? q : "???"}
                                </h4>
                                
                                {inputMode === 'voice' ? (
                                    <div className="flex gap-3 items-center">
                                        <Button
                                            size="icon"
                                            onClick={() => {
                                                if (isRecording && activeQuestionIndex === idx) {
                                                    recognitionRef.current?.stop();
                                                } else {
                                                    setActiveQuestionIndex(idx);
                                                    toggleRecording();
                                                }
                                            }}
                                            className={cn("h-12 w-12 rounded-full shadow-md transition-all", isRecording && activeQuestionIndex === idx ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-indigo-500 hover:bg-indigo-600")}
                                            disabled={!hasAudioFinished || (isRecording && activeQuestionIndex !== idx)}
                                        >
                                            {isRecording && activeQuestionIndex === idx ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                        </Button>
                                        <div className="flex-1 min-h-[48px] p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                                            {userAnswers[idx] || (isRecording && activeQuestionIndex === idx ? <span className="italic text-slate-400">Listening...</span> : <span className="italic text-slate-400">Record your answer</span>)}
                                        </div>
                                    </div>
                                ) : (
                                    <Textarea
                                        placeholder="Write your answer here..."
                                        className="min-h-[100px] resize-none border-slate-200 bg-slate-50 focus-visible:ring-indigo-500"
                                        value={userAnswers[idx] || ""}
                                        onChange={(e) => handleTextChange(idx, e.target.value)}
                                        disabled={!hasAudioFinished || isGenerating || isAnalyzing}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        {inputMode === 'voice' && isRecording && (
                            <Button variant="ghost" onClick={() => recognitionRef.current?.stop()} size="sm">
                                Stop Recording First
                            </Button>
                        )}

                        <Button
                            size="lg"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white w-full shadow-lg"
                            onClick={handleSubmit}
                            disabled={userAnswers.every(a => !a.trim()) || isAnalyzing || isGenerating || isRecording}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    Submit Analysis
                                    <Send className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Script Revealer (Right Column) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-700">Transcript</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowScript(!showScript)}
                            disabled={!scriptData}
                        >
                            {showScript ? (
                                <>
                                    <EyeOff className="mr-2 h-4 w-4" /> Hide
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-4 w-4" /> Show Text
                                </>
                            )}
                        </Button>
                    </div>

                    <div className={cn(
                        "h-[300px] rounded-xl border-2 p-6 overflow-y-auto transition-all duration-500",
                        showScript
                            ? "bg-white border-slate-200"
                            : "bg-slate-100 border-slate-200 flex items-center justify-center"
                    )}>
                        {showScript && scriptData ? (
                            <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                                <InteractiveText text={scriptData.script} language={config?.language} />
                            </div>
                        ) : (
                            <div className="text-center text-slate-400">
                                <EyeOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Transcript hidden to improve listening skills.</p>
                                {!feedback && <p className="text-xs mt-2 text-indigo-400">Revealed after submitting.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Feedback Section */}
            {feedback && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={cn(
                        "rounded-xl border-2 p-6 mb-6",
                        feedback.score >= 80 ? "border-indigo-200 bg-indigo-50" :
                            feedback.score >= 50 ? "border-amber-200 bg-amber-50" :
                                "border-red-200 bg-red-50"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <CheckCircle2 className={cn(
                                    "h-6 w-6",
                                    feedback.score >= 80 ? "text-indigo-600" :
                                        feedback.score >= 50 ? "text-amber-600" :
                                            "text-red-600"
                                )} />
                                Feedback
                            </h2>
                            <div className={cn(
                                "px-4 py-1 rounded-full font-bold text-lg",
                                feedback.score >= 80 ? "bg-indigo-200 text-indigo-700" :
                                    feedback.score >= 50 ? "bg-amber-200 text-amber-700" :
                                        "bg-red-200 text-red-700"
                            )}>
                                Score: {feedback.score}
                            </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">{feedback.feedback}</p>

                        {/* Missed Points */}
                        {feedback.missedPoints && feedback.missedPoints.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-indigo-200/50">
                                <div className="flex items-center gap-2 mb-4 text-indigo-800">
                                    <AlertCircle className="h-5 w-5" />
                                    <h3 className="font-bold">Missed Points:</h3>
                                </div>
                                <ul className="list-disc list-inside space-y-2">
                                    {feedback.missedPoints.map((point, idx) => (
                                        <li key={idx} className="text-indigo-900 font-medium">
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

