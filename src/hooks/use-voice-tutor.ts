"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { generateTutorResponse } from "@/app/practice/conversation/actions";

export function getLangCode(language: string) {
    const map: Record<string, string> = {
        "Spanish": "es-ES",
        "French": "fr-FR",
        "Italian": "it-IT",
        "Japanese": "ja-JP",
        "German": "de-DE",
        "Portuguese": "pt-PT",
        "English": "en-US",
    };
    return map[language] || "en-US";
}

export function useVoiceTutor(activeLanguage: string) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [userTranscript, setUserTranscript] = useState("");
    const [aiResponse, setAiResponse] = useState("Olá! Pronta para começar? Toca no microfone em baixo!");
    const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking" | "error">("idle");
    
    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef("");
    
    // Precisamos de uma ref para o estado de gravação para usar no evento `onend`
    const isRecordingRef = useRef(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true; // Mantém a escuta contínua
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = getLangCode(activeLanguage);

                recognitionRef.current.onresult = (event: any) => {
                    let currentTranscript = "";
                    for (let i = 0; i < event.results.length; ++i) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setUserTranscript(currentTranscript);
                    finalTranscriptRef.current = currentTranscript;
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    if (event.error !== "no-speech") {
                        setStatus("error");
                        setIsRecording(false);
                        isRecordingRef.current = false;
                    }
                };

                recognitionRef.current.onend = () => {
                    // Se a API nativa parar de ouvir devido a uma pausa muito longa, mas o utilizador não carregou em "Parar"
                    // Reiniciamos o motor para forçar o "Continuous Listening".
                    if (isRecordingRef.current) {
                        try {
                            recognitionRef.current.start();
                        } catch (err) {
                            console.error("Erro ao reiniciar mic", err);
                        }
                    }
                };
            }
        }
    }, [activeLanguage]);

    const speak = useCallback((text: string, langCode: string) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        setStatus("speaking");

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode;
        
        const voices = window.speechSynthesis.getVoices();
        const targetVoices = voices.filter(v => v.lang.startsWith(langCode.split('-')[0]));
        if (targetVoices.length > 0) {
            utterance.voice = targetVoices[0];
        }
        
        utterance.onend = () => {
            setIsSpeaking(false);
            setStatus("idle");
        };
        
        utterance.onerror = () => {
            setIsSpeaking(false);
            setStatus("idle");
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const processAudio = useCallback(async (text: string) => {
        if (!text.trim()) {
            setStatus("idle");
            return;
        }
        setStatus("thinking");
        try {
            const result = await generateTutorResponse(text);
            if (result.text) {
                setAiResponse(result.text);
                speak(result.text, getLangCode(result.language || activeLanguage));
            } else {
                setStatus("idle");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    }, [activeLanguage, speak]);

    const toggleRecording = useCallback(() => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            // TAP TO STOP
            isRecordingRef.current = false;
            setIsRecording(false);
            recognitionRef.current.stop();
            
            // Processa tudo o que foi acumulado
            if (finalTranscriptRef.current.trim()) {
                processAudio(finalTranscriptRef.current);
                finalTranscriptRef.current = "";
            } else {
                setStatus("idle");
            }
        } else {
            // TAP TO START
            try {
                window.speechSynthesis.getVoices();
                window.speechSynthesis.cancel(); // Pára a IA se estiver a falar
                
                setUserTranscript("");
                finalTranscriptRef.current = "";
                
                isRecordingRef.current = true;
                setIsRecording(true);
                setStatus("listening");
                recognitionRef.current.start();
            } catch (e) {
                console.error("Mic start error:", e);
            }
        }
    }, [isRecording, processAudio]);

    return {
        isRecording,
        isSpeaking,
        userTranscript,
        aiResponse,
        status,
        toggleRecording
    };
}
