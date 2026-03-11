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

import { PracticeSetup } from "@/components/practice-setup";

export default function ListeningPracticePage() {
    const [scriptData, setScriptData] = useState<{ script: string; topic: string; questions?: string[] } | null>(null);
    // Setup State
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [config, setConfig] = useState<{ language: string; level: string; mode: "random" | "focus" } | null>(null);

    const [userNotes, setUserNotes] = useState("");
    const [inputMode, setInputMode] = useState<"text" | "voice">("text");
    const [isRecording, setIsRecording] = useState(false);

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
    // getLocaleForLanguage converts 'Spanish' → 'es-ES', etc.
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
            setUserNotes("");
            setShowScript(false);
            setHasAudioFinished(false);

            const data = await generateListeningScript(cfg.level, cfg.language, cfg.mode === "focus");
            setScriptData(data);
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
            if (finalTranscript) {
                setUserNotes(prev => prev + (prev ? " " : "") + finalTranscript);
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    };

    const handleSubmit = () => {
        if (!userNotes.trim() || !scriptData || !config) return;

        stopAudio();
        startAnalysisTransition(async () => {
            const result = await analyzeListening(userNotes, scriptData.topic, scriptData.script, config.level, config.language);
            setFeedback(result);
            setShowScript(true);

            try {
                await savePracticeSession({
                    type: "listening",
                    language: config.language,
                    cefrLevel: config.level,
                    prompt: scriptData.topic,
                    promptData: scriptData,
                    userInput: userNotes,
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
                        <span>•</span>
                        <span className="font-bold text-slate-700">{config.level}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700 uppercase">{config.mode}</span>
                    </div>
                </div>
            )}


            {/* Audio Control Card */}
            <div className="mb-8 rounded-xl border-2 border-slate-200 bg-white p-8 shadow-sm text-center">
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
                        <p className="text-slate-500 animate-pulse">Generating audio script...</p>
                    </div>
                ) : scriptData ? (
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
                                "text-left bg-indigo-50 p-4 rounded-lg border border-indigo-100 mx-auto max-w-lg transition-all duration-500",
                                !hasAudioFinished && "opacity-50 blur-[2px] select-none grayscale"
                            )}>
                                <p className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {hasAudioFinished ? "Focus Points:" : "Hidden Hints"}
                                </p>
                                <ul className="list-disc list-inside text-indigo-700 space-y-1">
                                    {scriptData.questions.map((q, i) => (
                                        <li key={i}>{hasAudioFinished ? q : "..................................."}</li>
                                    ))}
                                </ul>
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

                    {inputMode === 'voice' ? (
                        <div className="min-h-[300px] bg-slate-50 border-2 rounded-xl border-dashed border-slate-300 flex flex-col items-center justify-center p-6 space-y-4">
                            {!isRecording ? (
                                <Button
                                    size="lg"
                                    onClick={toggleRecording}
                                    className="h-20 w-20 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl hover:scale-105 transition-all"
                                >
                                    <Mic className="h-8 w-8" />
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    onClick={toggleRecording}
                                    variant="danger"
                                    className="h-20 w-20 rounded-full animate-pulse shadow-xl hover:scale-105 transition-all"
                                >
                                    <Square className="h-8 w-8" />
                                </Button>
                            )}
                            <p className="text-slate-500 font-medium">
                                {isRecording ? "Listening... (Speak clearly)" : "Click mic to start recording"}
                            </p>

                            {userNotes && (
                                <div className="w-full mt-4 p-4 bg-white rounded-lg border border-slate-200 text-left max-h-[150px] overflow-y-auto">
                                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{userNotes}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Textarea
                            placeholder="Write your summary here in English..."
                            className="min-h-[300px] resize-none rounded-xl border-2 p-4 text-lg focus-visible:ring-indigo-500 bg-white"
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                            disabled={isGenerating || isAnalyzing}
                        />
                    )}

                    <div className="flex justify-end gap-3">
                        {inputMode === 'voice' && isRecording && (
                            <Button variant="ghost" onClick={toggleRecording} size="sm">
                                Stop Recording First
                            </Button>
                        )}

                        <Button
                            size="lg"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white w-full"
                            onClick={handleSubmit}
                            disabled={!userNotes.trim() || isAnalyzing || isGenerating || isRecording}
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
                            <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                                {scriptData.script}
                            </p>
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
