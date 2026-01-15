"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { generatePracticePrompt, analyzeSpeaking } from "@/actions/gemini";
import { savePracticeSession } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Mic, Square, Sparkles, Volume2, Info, Pause, Download } from "lucide-react";
import { cn } from "@/lib/utils";

// Add support for Web Speech API types
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

type SpeakingStatus = 'idle' | 'recording' | 'paused';

export default function SpeakingPracticePage() {
    const [promptData, setPromptData] = useState<{ text: string; translation: string; hints?: string[] } | null>(null);
    const [transcript, setTranscript] = useState("");
    const [status, setStatus] = useState<SpeakingStatus>('idle');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const [feedback, setFeedback] = useState<{
        feedback: string;
        betterWayToSay: string;
        pronunciationTips: string;
        score: number;
    } | null>(null);

    const [isGeneratingPrompt, startPromptTransition] = useTransition();
    const [isAnalyzing, startAnalysisTransition] = useTransition();

    const recognitionRef = useRef<any>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const isPausedRef = useRef(false);

    const handleGeneratePrompt = () => {
        startPromptTransition(async () => {
            setFeedback(null);
            setTranscript("");
            setAudioUrl(null);
            handleStop();
            const data = await generatePracticePrompt("speaking");
            setPromptData(data);
        });
    };

    const handleStart = async () => {
        setTranscript("");
        setAudioUrl(null);

        // Start Media Recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);

                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
        } catch (err) {
            console.error("Error accessing microphone for recording:", err);
            // We continue anyway so SpeechRecognition might still work if it's separate permissions
        }

        startRecognition();
    };

    const handleResume = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
        }
        startRecognition();
    };

    const handlePause = () => {
        if (recognitionRef.current) {
            isPausedRef.current = true;
            recognitionRef.current.stop();
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
        }

        setStatus('paused');
    };

    const handleStop = () => {
        if (recognitionRef.current) {
            isPausedRef.current = false;
            recognitionRef.current.stop();
        }

        if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
            mediaRecorderRef.current.stop();
        }

        setStatus('idle');
    };

    const startRecognition = () => {
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

        if (!SpeechRecognitionConstructor) {
            alert("O seu navegador não suporta reconhecimento de voz. Tente usar o Chrome.");
            return;
        }

        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            let finalH = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalH += event.results[i][0].transcript;
                }
            }
            if (finalH) {
                setTranscript((prev) => (prev ? prev + " " : "") + finalH);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            if (event.error !== 'no-speech') {
                // Don't change status to idle immediately on error to avoid UI flickering, unless fatal
            }
        };

        recognition.onend = () => {
            if (!isPausedRef.current && status === 'recording') {
                // If we didn't pause manually, it might have timed out. 
                // In a real app we might auto-restart or set to idle.
                // For now, if we are 'recording' but it ended, it's likely a silence timeout.
                // If the MediaRecorder is still going, we can restart SpeechRecognition?
                // Or just let it be. simpler to set to idle.
                setStatus('idle');

                // Also stop media recorder if it's still going
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }
        };

        recognitionRef.current = recognition;
        isPausedRef.current = false;
        recognition.start();
        setStatus('recording');
    };

    const handleSubmit = () => {
        if (!transcript.trim() || !promptData) return;

        startAnalysisTransition(async () => {
            handleStop(); // Ensure recording stops
            const result = await analyzeSpeaking(transcript, promptData.text);
            setFeedback(result);

            // Save history
            try {
                await savePracticeSession({
                    type: "speaking",
                    prompt: promptData.text,
                    promptData: promptData,
                    userInput: transcript,
                    feedback: result,
                    score: result.score || 0,
                });
            } catch (err) {
                console.error("Failed to save history:", err);
            }
        });
    };

    // ... useEffect cleanup same as before
    useEffect(() => {
        handleGeneratePrompt();
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (mediaRecorderRef.current) {
                // stop stream tracks
                // ...
            }
        };
    }, []);

    // Helper to determine main button icon
    const getMainButtonIcon = () => {
        if (status === 'recording') return <Pause className="h-6 w-6 fill-current" />;
        if (status === 'paused') return <Mic className="h-6 w-6" />;
        return <Mic className="h-6 w-6" />;
    };

    const getStatusText = () => {
        if (status === 'recording') return "Ouvindo...";
        if (status === 'paused') return "Pausado";
        return "Transcrição";
    };

    return (
        <div className="mx-auto max-w-[900px] px-6 py-8 pb-20">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-700">Prática de Fala</h1>
                <Button variant="sidebar" size="sm" onClick={handleGeneratePrompt} disabled={isGeneratingPrompt}>
                    {isGeneratingPrompt ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Novo Tópico
                </Button>
            </div>

            {/* Prompt Card */}
            <div className="mb-8 rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-rose-500">
                    <Volume2 className="h-5 w-5" />
                    <h2 className="font-bold uppercase tracking-wide">Tópico de Conversa</h2>
                </div>
                {isGeneratingPrompt ? (
                    <div className="flex h-20 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>
                ) : (
                    <div>
                        <p className="text-xl font-medium text-slate-800">{promptData?.text}</p>
                        <p className="mt-1 text-sm text-slate-500">{promptData?.translation}</p>
                        {promptData?.hints && promptData.hints.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold uppercase text-slate-400 mb-2">Sugestões:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {promptData.hints.map((hint, i) => <li key={i} className="text-sm text-slate-600">{hint}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Recording Area */}
            <div className="mb-8 flex flex-col items-center gap-6 rounded-xl border-2 border-slate-200 bg-slate-50 p-8 shadow-inner">
                <div className={cn(
                    "flex h-32 w-32 items-center justify-center rounded-full border-4 transition-all duration-300 relative",
                    status === 'recording' ? "border-rose-500 bg-rose-100 scale-110 shadow-lg shadow-rose-200" :
                        status === 'paused' ? "border-amber-500 bg-amber-50" :
                            "border-slate-300 bg-white"
                )}>
                    {status === 'recording' && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                        </span>
                    )}
                    <Mic className={cn("h-12 w-12 transition-colors", status === 'recording' ? "text-rose-600" : status === 'paused' ? "text-amber-600" : "text-slate-400")} />
                </div>

                <div className="w-full text-center">
                    <p className={cn("mb-2 text-sm font-bold uppercase tracking-widest", status === 'recording' ? "text-rose-500 animate-pulse" : status === 'paused' ? "text-amber-500" : "text-slate-400")}>
                        {getStatusText()}
                    </p>
                    <div className="min-h-[60px] w-full rounded-lg bg-white p-4 text-lg font-medium text-slate-700 border border-slate-200">
                        {transcript || <span className="text-slate-300 italic">Clique no microfone e comece a falar...</span>}
                    </div>
                </div>

                <div className="flex w-full items-center justify-center gap-6">
                    <Button
                        variant={status === 'recording' ? "secondary" : "danger"}
                        size="lg"
                        className={cn("h-20 w-20 rounded-full p-0 shadow-xl transition-all border-4", status === 'recording' ? "hover:bg-slate-100 border-rose-100" : "hover:scale-105 border-rose-200")}
                        onClick={() => {
                            if (status === 'idle') handleStart();
                            else if (status === 'recording') handlePause();
                            else if (status === 'paused') handleResume();
                        }}
                        disabled={isGeneratingPrompt || isAnalyzing}
                    >
                        {getMainButtonIcon()}
                    </Button>

                    {(status === 'recording' || status === 'paused') && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-slate-100 text-slate-500 hover:text-red-500" onClick={handleStop} title="Parar">
                                <Square className="h-6 w-6 fill-current" />
                            </Button>
                        </div>
                    )}
                </div>

                {transcript && status !== 'recording' && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 w-full">
                        {/* Audio Player and Download */}
                        {audioUrl && (
                            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 w-full max-w-md">
                                <audio src={audioUrl} controls className="w-full h-8" />
                                <a href={audioUrl} download={`pronunciation-practice-${Date.now()}.webm`}>
                                    <Button size="icon" variant="ghost" title="Baixar Áudio">
                                        <Download className="h-5 w-5 text-slate-600" />
                                    </Button>
                                </a>
                            </div>
                        )}

                        <Button size="lg" className="px-8 rounded-full shadow-lg hover:scale-105 transition-all text-lg font-bold" onClick={handleSubmit} disabled={isGeneratingPrompt || isAnalyzing}>
                            {isAnalyzing ? <Loader2 className="animate-spin" /> : "Avaliar"}
                        </Button>
                    </div>
                )}
            </div>

            {feedback && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-rose-800">
                                <Sparkles className="h-6 w-6" />
                                Feedback
                            </h2>
                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-rose-200">
                                <span className="text-sm font-bold text-rose-600">Score:</span>
                                <span className="text-xl font-extrabold text-rose-600">{feedback.score}</span>
                            </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{feedback.feedback}</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-6">
                            <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-sky-700">
                                <Info className="h-5 w-5" />
                                Sugestão Nativa
                            </h3>
                            <p className="text-slate-700 italic">"{feedback.betterWayToSay}"</p>
                        </div>
                        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6">
                            <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-indigo-700">
                                <Volume2 className="h-5 w-5" />
                                Dicas de Pronúncia
                            </h3>
                            <p className="text-slate-700">{feedback.pronunciationTips}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
