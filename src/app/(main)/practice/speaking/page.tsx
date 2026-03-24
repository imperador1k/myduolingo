"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { generatePracticePrompt, analyzeSpeaking } from "@/actions/gemini";
import { savePracticeSession } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Mic, Square, Sparkles, Volume2, Info, Pause, Download, Shuffle, Target, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTTS } from "@/hooks/use-tts";
import { getLocaleForLanguage } from "@/lib/constants";

import { PracticeSetup } from "@/components/shared/practice-setup";
import { AILoadingScreen } from "@/components/ui/ai-loading-screen";
import { InteractiveText } from "@/components/ui/interactive-text";

// Add support for Web Speech API types
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

type SpeakingStatus = 'idle' | 'recording' | 'paused';

export default function SpeakingPracticePage() {
    const [promptData, setPromptData] = useState<{ scenario: string; translation: string; rules: string[]; hints?: string[]; languageCode?: string } | null>(null);
    const [transcript, setTranscript] = useState("");
    const [status, setStatus] = useState<SpeakingStatus>('idle');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // Setup State
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [config, setConfig] = useState<{ language: string; level: string; mode: "random" | "focus" } | null>(null);

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

    const handleStartSession = (newConfig: { language: string; level: string; mode: "random" | "focus" }) => {
        setConfig(newConfig);
        setIsSetupComplete(true);
        handleGeneratePrompt(newConfig);
    };

    // Dynamically set TTS language from config (e.g., 'Spanish' â†’ 'es-ES')
    const targetLocale = config ? getLocaleForLanguage(config.language) : "en-US";
    const { playAudio: playPromptTTS } = useTTS(targetLocale);

    const handleGeneratePrompt = (cfg = config) => {
        if (!cfg) return;
        startPromptTransition(async () => {
            setFeedback(null);
            setTranscript("");
            setAudioUrl(null);
            handleStop();
            const data = await generatePracticePrompt("speaking", cfg.level, cfg.language, cfg.mode === "focus");
            setPromptData(data);
        });
    };

    // ... (keep handleStart, handleResume, handlePause, handleStop, startRecognition as is)
    // BUT I need to include them in the replacement if I want to keep the file valid or stick to the range.
    // The range 1-209 includes almost everything. I should be careful to keeping internal functions.
    // Actually, I can just replace the top part and the cleanup useEffect.

    // To make this cleaner, I will just replace the top part and then use a separate call for the bottom/render if needed.
    // However, I need to update handleSubmit to use config too.

    // Let's do a larger replacement to be safe.
    // ... handleStart TO startRecognition ... (omitted in thought, but must be in code)

    const handleStart = async () => {
        setTranscript("");
        setAudioUrl(null);

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
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
        } catch (err) {
            console.error("Error accessing microphone:", err);
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
            alert("Navegador não suportado. Tente Chrome.");
            return;
        }

        const recognition = new SpeechRecognitionConstructor();
        // Use the target language locale for recognition, not a hardcoded 'en-US'
        recognition.lang = targetLocale;
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
            // ignore
        };

        recognition.onend = () => {
            if (!isPausedRef.current && status === 'recording') {
                setStatus('idle');
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
        if (!transcript.trim() || !promptData || !config) return;

        startAnalysisTransition(async () => {
            handleStop();
            const result = await analyzeSpeaking(transcript, promptData.scenario, config.level, config.language);
            setFeedback(result);

            try {
                await savePracticeSession({
                    type: "speaking",
                    language: config.language,
                    cefrLevel: config.level,
                    prompt: promptData.scenario,
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

    // Cleanup
    useEffect(() => {
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
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

    if (!isSetupComplete) {
        return <PracticeSetup type="speaking" onStart={handleStartSession} />;
    }

    if (isGeneratingPrompt) {
        return <AILoadingScreen message="A preparar Cenário Falado..." submessage="A IA está a calibrar o teu parceiro de conversa" />;
    }return (
        <div className="flex flex-col min-h-screen bg-stone-50 w-full overflow-x-hidden pb-10">
            {/* ── Top Progress Header ── */}
            <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-stone-200 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors" onClick={() => setIsSetupComplete(false)}>
                        <X className="w-7 h-7" strokeWidth={3} />
                    </Button>
                    <div className="hidden sm:block h-4 w-48 md:w-64 bg-stone-100 rounded-full overflow-hidden border-2 border-stone-200">
                        {/* Fake progress for Dojo feel */}
                        <div className="h-full bg-rose-500 w-[45%] rounded-full opacity-50 relative overflow-hidden">
                           <div className="absolute inset-0 bg-white/20 w-full rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-black text-stone-400 uppercase tracking-widest text-xs md:text-sm bg-stone-100 px-4 py-2 rounded-2xl border-2 border-stone-200">
                    <span className="text-indigo-500">{config?.language}</span> 
                    <span className="text-stone-300">•</span> 
                    <span className="text-fuchsia-500">{config?.level}</span>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                
                {/* ── Left Column: Challenge & Editor (Spans 8 cols) ── */}
                <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
                    
                    {/* The Challenge Area */}
                    <section className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col sm:flex-row items-start gap-4 md:gap-6 relative overflow-visible z-10 transition-all hover:-translate-y-1 hover:border-b-[10px] hover:mb-[-2px]">
                        <div className="w-14 h-14 md:w-20 md:h-20 shrink-0 bg-rose-100 rounded-[1.5rem] border-b-4 border-rose-200 flex items-center justify-center shadow-inner cursor-pointer hover:bg-rose-200 transition-colors" onClick={() => {
                                if (!promptData?.scenario) return;
                                playPromptTTS(promptData.scenario, 0.9, targetLocale);
                            }}>
                            <Volume2 className="w-7 h-7 md:w-10 md:h-10 text-rose-500" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-3 relative z-10 w-full">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl md:text-3xl font-black text-stone-700 tracking-tight leading-tight">
                                    <InteractiveText text={promptData?.scenario} language={config?.language} />
                                </h2>
                            </div>
                            <p className="text-stone-500 font-medium text-sm md:text-lg leading-relaxed max-w-2xl">
                                {promptData?.translation}
                            </p>
                            
                            {/* Rules / Constraints */}
                            {promptData?.rules && promptData.rules.length > 0 && (
                                <div className="mt-2 pt-4 border-t-2 border-stone-100 w-full flex flex-col gap-3">
                                    <span className="text-xs font-black tracking-widest uppercase text-amber-500 flex items-center gap-2">
                                        <Target className="w-4 h-4 md:w-5 md:h-5" /> Regras de Conversa
                                    </span>
                                    <ul className="flex flex-wrap gap-2 md:gap-3">
                                        {promptData.rules.map((rule, i) => (
                                            <li key={i} className="inline-flex items-center gap-2 bg-amber-50 border-2 border-amber-100 text-amber-700 font-bold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-xl shadow-sm">
                                                <CheckCircle2 className="w-4 h-4 fill-amber-400 text-white shrink-0" />
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                    
                    {/* The Draft Pad (Recording Area) */}
                    <section className="relative group z-0">
                        {/* Label */}
                        <div className="absolute -top-4 left-6 bg-rose-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-xl shadow border-2 border-rose-600 z-10 flex items-center gap-2">
                            <Mic className="w-3.5 h-3.5" /> A TUA VOZ
                        </div>
                        
                        <div className={cn(
                            "w-full min-h-[350px] md:min-h-[450px] bg-white border-2 border-b-8 rounded-[2rem] p-6 md:p-8 pt-10 flex flex-col items-center justify-center transition-all shadow-sm",
                            status === 'recording' ? "border-rose-300 bg-rose-50/30" : 
                            feedback ? "border-stone-200 text-stone-400 bg-stone-50" : "border-stone-200"
                        )}>
                            <div className={cn(
                                "flex h-32 w-32 md:h-40 md:w-40 items-center justify-center rounded-full border-4 transition-all duration-300 relative mb-8",
                                status === 'recording' ? "border-rose-500 bg-rose-100 scale-110 shadow-lg shadow-rose-200" :
                                    status === 'paused' ? "border-amber-500 bg-amber-50" :
                                        "border-stone-200 bg-stone-50"
                            )}>
                                {status === 'recording' && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-6 md:w-6">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-full w-full bg-rose-500 border-2 border-white"></span>
                                    </span>
                                )}
                                <Mic className={cn("h-12 w-12 md:h-16 md:w-16 transition-colors", status === 'recording' ? "text-rose-600" : status === 'paused' ? "text-amber-600" : "text-stone-400")} />
                            </div>

                            <p className={cn("mb-4 text-sm md:text-base font-black uppercase tracking-[0.2em]", status === 'recording' ? "text-rose-500 animate-pulse" : status === 'paused' ? "text-amber-500" : "text-stone-400")}>
                                {getStatusText()}
                            </p>
                            
                            <div className="w-full max-w-xl rounded-2xl bg-white p-4 md:p-6 text-lg md:text-xl font-medium text-stone-700 border-2 border-stone-100 min-h-[120px] text-center shadow-inner flex items-center justify-center">
                                {transcript || <span className="text-stone-300 italic flex items-center gap-2"><Mic className="w-5 h-5"/> Pressiona GRAVAR para iniciares...</span>}
                            </div>
                        </div>

                        {/* Dynamic Word Count */}
                        {(!feedback && !isAnalyzing && transcript.trim().length > 0) && (
                            <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-[1rem] border-2 border-stone-200 font-black text-stone-500 text-xs tracking-widest uppercase shadow-sm">
                                <span className="text-lg text-rose-500">
                                    {transcript.trim() ? transcript.trim().split(/\s+/).length : 0}
                                </span> 
                                PALAVRAS LÍDAS
                            </div>
                        )}
                    </section>
                    
                    {/* Feedback Area */}
                    {feedback && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 mt-4 space-y-6">
                            <div className={cn(
                                "rounded-[2rem] border-2 border-b-8 p-6 md:p-10",
                                feedback.score >= 80 ? "border-green-300 bg-green-50" :
                                    feedback.score >= 50 ? "border-amber-300 bg-amber-50" :
                                        "border-red-300 bg-red-50"
                            )}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                    <h2 className={cn(
                                        "text-2xl md:text-3xl font-black flex items-center gap-3",
                                        feedback.score >= 80 ? "text-green-700" :
                                            feedback.score >= 50 ? "text-amber-700" :
                                                "text-red-700"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center border-b-4",
                                            feedback.score >= 80 ? "bg-green-200 border-green-300" :
                                                feedback.score >= 50 ? "bg-amber-200 border-amber-300" :
                                                    "bg-red-200 border-red-300"
                                        )}>
                                            <CheckCircle2 className="h-7 w-7" strokeWidth={3} />
                                        </div>
                                        Análise da AI
                                    </h2>
                                    <div className={cn(
                                        "px-6 py-2 md:py-3 rounded-[1.5rem] font-black text-xl md:text-2xl border-2 border-b-4",
                                        feedback.score >= 80 ? "bg-green-100/50 border-green-300 text-green-700" :
                                            feedback.score >= 50 ? "bg-amber-100/50 border-amber-300 text-amber-700" :
                                                "bg-red-100/50 border-red-300 text-red-700"
                                    )}>
                                        SCORE: {feedback.score}%
                                    </div>
                                </div>
                                
                                <p className="text-stone-700 font-medium text-lg leading-relaxed mb-8 bg-white/50 p-6 rounded-2xl border border-stone-200/50">
                                    {feedback.feedback}
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-[2rem] border-2 border-b-8 border-sky-200 border-b-sky-300 bg-sky-50 p-6 md:p-8">
                                    <h3 className="flex items-center gap-2 mb-4 text-sm font-black uppercase tracking-widest text-sky-600">
                                        <Info className="h-5 w-5 shrink-0" />
                                        Sugestão Nativa
                                    </h3>
                                    <p className="text-sky-900 font-medium text-lg italic leading-relaxed">"{feedback.betterWayToSay}"</p>
                                </div>
                                <div className="rounded-[2rem] border-2 border-b-8 border-indigo-200 border-b-indigo-300 bg-indigo-50 p-6 md:p-8">
                                    <h3 className="flex items-center gap-2 mb-4 text-sm font-black uppercase tracking-widest text-indigo-600">
                                        <Volume2 className="h-5 w-5 shrink-0" />
                                        Dicas de Pronúncia
                                    </h3>
                                    <p className="text-indigo-900 font-medium text-lg leading-relaxed">{feedback.pronunciationTips}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Column: Toolbelt & Submit (Spans 4 cols) ── */}
                <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
                    
                    {/* Vocabulary Card */}
                    {promptData?.hints && promptData.hints.length > 0 && (
                        <div className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col gap-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl"><Info className="w-5 h-5" /></div>
                                Ideias
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {promptData.hints.map((hint, i) => (
                                    <span key={i} className="px-3 md:px-4 py-2 bg-stone-50 border-2 border-stone-200 rounded-xl font-bold text-stone-600 text-sm md:text-base hover:bg-stone-100 hover:-translate-y-0.5 transition-all cursor-default">
                                        {hint}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Download Audio Card */}
                    {audioUrl && !feedback && (
                        <div className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 flex flex-col items-center gap-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-stone-400">TUA GRAVAÇÃO</h3>
                            <audio src={audioUrl} controls className="w-full h-10" />
                            <a href={audioUrl} download={`speaking-practice-${Date.now()}.webm`} className="w-full">
                                <button className="w-full py-3 bg-stone-100 font-bold text-stone-500 rounded-xl border-2 border-stone-200 hover:bg-stone-200 flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" /> TRANSFERIR ÁUDIO
                                </button>
                            </a>
                        </div>
                    )}
                    
                    {/* Submit Area */}
                    <div className="mt-8 lg:mt-0 flex flex-col gap-4 w-full">
                        {!feedback ? (
                            <>
                                {status === 'idle' && !transcript ? (
                                    <button
                                        onClick={handleStart}
                                        disabled={isGeneratingPrompt || isAnalyzing}
                                        className="w-full h-20 md:h-24 bg-rose-500 text-white text-xl md:text-2xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-rose-600 hover:bg-rose-400 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
                                    >
                                        GRAVAR <Mic className="w-6 h-6" strokeWidth={3} />
                                    </button>
                                ) : status === 'recording' ? (
                                    <button
                                        onClick={handlePause}
                                        className="w-full h-16 md:h-20 bg-amber-500 text-white text-lg md:text-xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-amber-600 hover:bg-amber-400 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm"
                                    >
                                        PAUSAR <Pause className="w-6 h-6" strokeWidth={3} />
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleResume}
                                            className="w-full py-4 bg-rose-50 text-rose-500 text-sm md:text-base font-black rounded-[1.5rem] border-2 border-transparent border-b-4 border-b-rose-200 hover:bg-rose-100 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            CONTINUAR A FALAR
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isAnalyzing || !transcript.trim()}
                                            className="w-full h-20 md:h-24 bg-[#58cc02] text-white text-xl md:text-2xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
                                        >
                                            {isAnalyzing ? (
                                                <span className="animate-pulse">A AVALIAR...</span>
                                            ) : (
                                                "AVALIAR"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                             <button
                                onClick={() => handleGeneratePrompt()}
                                className="w-full h-20 md:h-24 bg-sky-400 text-white text-xl md:text-2xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-sky-500 hover:bg-sky-500 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm"
                            >
                                NOVO DESAFIO
                                <RefreshCw className="w-7 h-7" strokeWidth={3} />
                            </button>
                        )}
                        
                        <p className="text-center font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-400 flex items-center justify-center gap-2 mt-2">
                            A AI ouve a tua pronúncia
                        </p>
                    </div>
                </aside>

            </main>
        </div>
    );
}
