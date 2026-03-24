"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { generateListeningScript, analyzeListening } from "@/actions/gemini";
import { savePracticeSession } from "@/actions/practice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Send, Headphones, Play, Pause, Square, Eye, EyeOff, CheckCircle2, AlertCircle, Mic, Keyboard, Shuffle, Target, Sparkles, X } from "lucide-react";
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
        <div className="flex flex-col min-h-screen bg-stone-50 w-full overflow-x-hidden pb-10">
            {/* ── Top Progress Header ── */}
            <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-stone-200 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors" onClick={() => setIsSetupComplete(false)}>
                        <X className="w-7 h-7" strokeWidth={3} />
                    </Button>
                    <div className="hidden sm:block h-4 w-48 md:w-64 bg-stone-100 rounded-full overflow-hidden border-2 border-stone-200">
                        {/* Fake progress for Dojo feel */}
                        <div className="h-full bg-indigo-500 w-[60%] rounded-full opacity-50 relative overflow-hidden">
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
                {/* ── Left Column: Audio & Questions (Spans 8 cols) ── */}
                <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
                    
                    {/* Audio Player Card */}
                    {scriptData && (
                        <section className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col items-center justify-center gap-6 relative z-10 transition-all hover:-translate-y-1 hover:border-b-[10px] hover:mb-[-2px]">
                            <div className="absolute -top-4 left-6 bg-indigo-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-xl shadow border-2 border-indigo-600 z-10 flex items-center gap-2">
                                <Headphones className="w-3.5 h-3.5" /> ÁUDIO NATIVO
                            </div>
                            
                            <h2 className="text-xl md:text-3xl font-black text-stone-700 tracking-tight leading-tight text-center mt-2">
                                {hasAudioFinished ? scriptData.topic : <span className="blur-sm select-none text-stone-400">Tópico Oculto (Ouve Primeiro)</span>}
                            </h2>

                            <div className="flex justify-center gap-4 w-full mt-4">
                                {isPlaying ? (
                                    <button
                                        onClick={pauseAudio}
                                        className="w-full md:w-auto px-12 h-16 md:h-20 bg-amber-500 text-white text-lg md:text-xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-amber-600 hover:bg-amber-400 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm"
                                    >
                                        <Pause className="w-6 h-6 fill-current" /> PAUSAR
                                    </button>
                                ) : (
                                    <button
                                        onClick={playAudio}
                                        className={cn(
                                            "w-full md:w-auto px-12 h-16 md:h-20 text-white text-lg md:text-xl font-black rounded-3xl border-2 border-transparent border-b-8 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm",
                                            isPaused ? "bg-emerald-500 border-b-emerald-600 hover:bg-emerald-400" : "bg-indigo-500 border-b-indigo-600 hover:bg-indigo-400"
                                        )}
                                    >
                                        <Play className="w-6 h-6 fill-current" /> {isPaused ? "RETOMAR" : "OUVIR"}
                                    </button>
                                )}

                                {(isPlaying || isPaused) && (
                                    <button
                                        onClick={stopAudio}
                                        className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-stone-100 border-2 border-stone-200 border-b-8 border-b-stone-300 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all active:border-b-0 active:mt-2 active:mb-[-8px] flex items-center justify-center shrink-0"
                                        title="Parar Áudio"
                                    >
                                        <Square className="h-6 w-6 fill-current" />
                                    </button>
                                )}
                            </div>

                            {scriptData.questions && (
                                <div className={cn(
                                    "text-center transition-all duration-500 w-full mt-2",
                                    !hasAudioFinished && "opacity-50 blur-[2px] select-none grayscale"
                                )}>
                                    <p className="font-bold text-stone-400 text-xs md:text-sm uppercase tracking-wide flex items-center justify-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-indigo-400" />
                                        {hasAudioFinished ? "Responde às questões baseadas no áudio!" : "As questões estão bloqueadas enquanto o áudio toca..."}
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Questions & Inputs Form */}
                    <section className="bg-stone-100/50 rounded-[2rem] border-2 border-stone-200 p-6 md:p-8 flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-black text-stone-700 uppercase tracking-widest flex items-center gap-2">
                                <Target className="w-6 h-6 text-indigo-500"/>
                                A TUA ANÁLISE
                            </h3>

                            {/* Input Mode Toggle */}
                            <div className="flex p-1 bg-stone-200/50 rounded-2xl border-2 border-stone-200">
                                <button
                                    onClick={() => setInputMode('text')}
                                    className={cn("px-4 py-2 h-10 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2", 
                                        inputMode === 'text' ? "bg-white shadow-sm text-indigo-500 border-2 border-stone-200" : "text-stone-400 hover:text-stone-600 border-2 border-transparent"
                                    )}
                                >
                                    <Keyboard className="h-4 w-4" /> TEXTO
                                </button>
                                <button
                                    onClick={() => setInputMode('voice')}
                                    className={cn("px-4 py-2 h-10 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2", 
                                        inputMode === 'voice' ? "bg-white shadow-sm text-indigo-500 border-2 border-stone-200" : "text-stone-400 hover:text-stone-600 border-2 border-transparent"
                                    )}
                                >
                                    <Mic className="h-4 w-4" /> VOZ
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 w-full">
                            {scriptData?.questions?.map((q, idx) => (
                                <div key={idx} className={cn(
                                    "bg-white p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-4", 
                                    hasAudioFinished ? "border-stone-200 shadow-sm border-b-[6px]" : "border-stone-100 opacity-50 select-none grayscale"
                                )}>
                                    <h4 className="font-bold text-stone-700 text-lg flex items-start gap-3">
                                        <span className="flex items-center justify-center min-w-8 min-h-8 rounded-full bg-indigo-100 text-indigo-600 font-black shrink-0 border-2 border-indigo-200">{idx + 1}</span>
                                        {hasAudioFinished ? q : "A questão será revelada após o áudio."}
                                    </h4>

                                    {inputMode === 'voice' ? (
                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full mt-2">
                                            <button
                                                onClick={() => {
                                                    if (isRecording && activeQuestionIndex === idx) {
                                                        recognitionRef.current?.stop();
                                                    } else {
                                                        setActiveQuestionIndex(idx);
                                                        toggleRecording();
                                                    }
                                                }}
                                                className={cn("h-16 w-16 rounded-2xl shrink-0 border-2 border-transparent transition-all flex items-center justify-center text-white", 
                                                    isRecording && activeQuestionIndex === idx ? "bg-rose-500 hover:bg-rose-600 shadow-inner border-b-0 translate-y-1 animate-pulse" : "bg-indigo-500 hover:bg-indigo-600 border-b-4 border-b-indigo-700 active:border-b-0 active:translate-y-1"
                                                )}
                                                disabled={!hasAudioFinished || (isRecording && activeQuestionIndex !== idx)}
                                            >
                                                {isRecording && activeQuestionIndex === idx ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-7 w-7" />}
                                            </button>
                                            <div className="flex-1 w-full min-h-[64px] p-4 bg-stone-50 rounded-2xl border-2 border-stone-200 text-base md:text-lg font-medium text-stone-700 shadow-inner flex items-center">
                                                {userAnswers[idx] || (isRecording && activeQuestionIndex === idx ? <span className="italic text-stone-400 flex items-center gap-2"><Mic className="w-5 h-5 animate-pulse text-rose-500"/> A ouvir...</span> : <span className="italic text-stone-300">Grava a tua resposta</span>)}
                                            </div>
                                        </div>
                                    ) : (
                                        <Textarea
                                            placeholder="Escreve a tua resposta aqui..."
                                            className="min-h-[120px] resize-none border-2 border-stone-200 bg-stone-50 rounded-2xl p-4 text-base md:text-lg font-medium text-stone-700 focus-visible:ring-indigo-500 shadow-inner placeholder:text-stone-300 placeholder:italic transition-shadow mt-2"
                                            value={userAnswers[idx] || ""}
                                            onChange={(e) => handleTextChange(idx, e.target.value)}
                                            disabled={!hasAudioFinished || isGenerating || isAnalyzing}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
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

                                {feedback.missedPoints && feedback.missedPoints.length > 0 && (
                                    <div className="mt-6 pt-6 border-t-2 border-indigo-200 flex flex-col gap-4">
                                        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-indigo-500">
                                            <AlertCircle className="h-5 w-5 shrink-0" /> Pontos Falhados
                                        </h3>
                                        <ul className="flex flex-col gap-3">
                                            {feedback.missedPoints.map((point, idx) => (
                                                <li key={idx} className="flex items-start gap-3 bg-indigo-50 border-2 border-indigo-100 text-indigo-800 font-bold text-sm md:text-base px-5 py-3 rounded-xl shadow-sm">
                                                    <span className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
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

                {/* ── Right Column: Toolbelt & Submit (Spans 4 cols) ── */}
                <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
                    
                    {/* Script Revealer */}
                    <div className="bg-white rounded-[2rem] border-2 border-stone-200 border-b-8 p-6 md:p-8 flex flex-col gap-4 transition-all hover:border-b-[10px] hover:mb-[-2px]">
                        <div className="flex items-center justify-between w-full">
                            <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl"><Eye className="w-5 h-5" /></div>
                                Transcrição
                            </h3>
                            <button
                                onClick={() => setShowScript(!showScript)}
                                disabled={!scriptData}
                                className="px-3 py-1.5 bg-stone-100 text-stone-500 font-bold text-xs rounded-lg border-2 border-stone-200 hover:bg-stone-200 active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                            >
                                {showScript ? <><EyeOff className="w-4 h-4" /> ESCONDER</> : "MOSTRAR"}
                            </button>
                        </div>
                        
                        <div className={cn(
                            "w-full rounded-2xl border-2 p-5 overflow-y-auto max-h-[300px] transition-all duration-300",
                            showScript ? "bg-stone-50 border-stone-200 shadow-inner" : "bg-stone-100 border-stone-200 flex flex-col items-center justify-center min-h-[150px]"
                        )}>
                            {showScript && scriptData ? (
                                <div className="text-sm md:text-base font-medium leading-relaxed text-stone-700 whitespace-pre-wrap">
                                    <InteractiveText text={scriptData.script} language={config?.language} />
                                </div>
                            ) : (
                                <div className="text-center text-stone-400 flex flex-col items-center gap-2">
                                    <EyeOff className="h-8 w-8 opacity-50" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Oculta para treinares o ouvido.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Area */}
                    <div className="mt-8 lg:mt-0 flex flex-col gap-4 w-full">
                        {!feedback ? (
                            <button
                                onClick={handleSubmit}
                                disabled={userAnswers.every(a => !a?.trim()) || isAnalyzing || isGenerating || isRecording || !hasAudioFinished}
                                className="w-full h-20 md:h-24 bg-[#58cc02] text-white text-xl md:text-2xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-[#46a302] hover:bg-[#61da02] active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:grayscale"
                            >
                                {isAnalyzing ? (
                                    <span className="animate-pulse">A AVALIAR...</span>
                                ) : (
                                    "AVALIAR"
                                )}
                            </button>
                        ) : (
                             <button
                                onClick={() => handleGenerateScript()}
                                className="w-full h-20 md:h-24 bg-sky-400 text-white text-xl md:text-2xl font-black rounded-3xl border-2 border-transparent border-b-8 border-b-sky-500 hover:bg-sky-500 active:border-b-0 active:mt-2 active:mb-[-8px] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm"
                            >
                                NOVO ÁUDIO
                                <RefreshCw className="w-7 h-7" strokeWidth={3} />
                            </button>
                        )}
                        
                        <p className="text-center font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] text-stone-400 flex items-center justify-center gap-2 mt-2">
                            A AI interpreta as tuas respostas
                        </p>
                    </div>
                </aside>

            </main>
        </div>
    );
}

