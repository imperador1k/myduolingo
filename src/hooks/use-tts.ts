import { useState, useCallback, useEffect } from "react";

// BCP-47 locale map based on supported language codes
const BCP47_MAP: Record<string, string> = {
    "en": "en-US",
    "es": "es-ES",
    "fr": "fr-FR",
    "pt": "pt-PT", // Defaults to pt-PT now instead of pt-BR
    "pt-pt": "pt-PT",
    "de": "de-DE",
    "it": "it-IT",
    "ja": "ja-JP",
    "ko": "ko-KR",
    "zh": "zh-CN",
    "ru": "ru-RU",
    "ar": "ar-SA",
    "nl": "nl-NL",
};

export const useTTS = (languageCode: string = "en") => {
    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = useCallback((text: string, speed: number = 0.9, overrideLanguageCode?: string) => {
        if (!text || typeof window === "undefined" || !window.speechSynthesis) return;

        window.speechSynthesis.cancel(); // Cancel any ongoing speech

        const langToUse = overrideLanguageCode || languageCode;
        const bcp47Code = BCP47_MAP[langToUse.toLowerCase()] || "en-US";
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.lang = bcp47Code;
        utterance.rate = speed;

        const voices = window.speechSynthesis.getVoices();
        let bestVoice: SpeechSynthesisVoice | undefined;

        if (bcp47Code === "pt-PT") {
            // Strict enforcement for European Portuguese
            bestVoice = voices.find((v) => v.lang === "pt-PT" || v.lang === "pt_PT") ||
                        voices.find((v) => v.name.includes("Joana") || 
                                           v.name.includes("Catarina") || 
                                           v.name.includes("Helia") || 
                                           v.name.includes("Microsoft Tomas")) ||
                        voices.find((v) => v.lang.startsWith("pt")); // Fallback to any PT
        } else {
            // Standard matching for other languages
            bestVoice = voices.find((v) => v.lang === bcp47Code) || 
                        voices.find((v) => v.lang.startsWith(bcp47Code.split("-")[0]));
        }
            
        if (bestVoice) {
            utterance.voice = bestVoice;
        }

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
    }, [languageCode]);

    useEffect(() => {
        return () => {
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return { playAudio, isPlaying };
};
