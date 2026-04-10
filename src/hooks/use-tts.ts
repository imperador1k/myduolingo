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

/**
 * Resolve a language code (short or full BCP-47) to a proper BCP-47 code.
 */
function resolveBcp47(langCode: string): string {
    if (langCode.includes("-")) return langCode;
    return BCP47_MAP[langCode.toLowerCase()] || "en-US";
}

/**
 * Find the best matching voice for a given BCP-47 language code.
 */
function findVoice(bcp47Code: string): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();
    if (bcp47Code === "pt-PT") {
        return (
            voices.find((v) => v.lang === "pt-PT" || v.lang === "pt_PT") ||
            voices.find((v) =>
                v.name.includes("Joana") ||
                v.name.includes("Catarina") ||
                v.name.includes("Helia") ||
                v.name.includes("Microsoft Tomas")
            ) ||
            voices.find((v) => v.lang.startsWith("pt"))
        );
    }
    return (
        voices.find((v) => v.lang === bcp47Code) ||
        voices.find((v) => v.lang.startsWith(bcp47Code.split("-")[0]))
    );
}

export const useTTS = (languageCode: string = "en") => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingText, setPlayingText] = useState<string | null>(null);
    const [voicesLoaded, setVoicesLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            const updateVoices = () => setVoicesLoaded(window.speechSynthesis.getVoices().length > 0);
            updateVoices();
            window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
            return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
        }
    }, []);

    const stopAudio = useCallback(() => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setPlayingText(null);
        }
    }, []);

    const playAudio = useCallback(
        (text: string, speed: number = 0.9, overrideLanguageCode?: string) => {
            if (!text || typeof window === "undefined" || !window.speechSynthesis) return;

            // Toggle functionality: if already playing the same text, stop it.
            if (isPlaying && playingText === text) {
                stopAudio();
                return;
            }

            window.speechSynthesis.cancel();

            const bcp47Code = resolveBcp47(overrideLanguageCode || languageCode);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = bcp47Code;
            utterance.rate = speed;

            const bestVoice = findVoice(bcp47Code);
            if (bestVoice) {
                utterance.voice = bestVoice;
            } else {
                console.warn(`[TTS] No perfect voice found for ${bcp47Code}. Using system default.`);
            }

            utterance.onstart = () => {
                setIsPlaying(true);
                setPlayingText(text);
            };
            utterance.onend = () => {
                setIsPlaying(false);
                setPlayingText(null);
            };
            utterance.onerror = () => {
                setIsPlaying(false);
                setPlayingText(null);
            };

            window.speechSynthesis.speak(utterance);
        },
        [languageCode, isPlaying, playingText, stopAudio]
    );

    /**
     * Play mixed-language text where quoted words use the target language voice
     * and unquoted text uses the base language voice.
     *
     * Example: 'O conceito de "la autenticidad" é chave.'
     *  -> "O conceito de "  spoken in baseLang (pt-PT)
     *  -> "la autenticidad" spoken in targetLang (es-ES)
     *  -> " é chave."      spoken in baseLang (pt-PT)
     */
    const playMixedSpeech = useCallback(
        (text: string, baseLang: string, targetLang: string, speed: number = 0.9) => {
            if (!text || typeof window === "undefined" || !window.speechSynthesis) return;

            // Toggle functionality
            if (isPlaying && playingText === text) {
                stopAudio();
                return;
            }

            window.speechSynthesis.cancel();

            // Split by quoted segments (single or double quotes), keeping delimiters
            const chunks = text.split(/(["'«»""''].*?["'«»""''])/g).filter(Boolean);

            const baseBcp47 = resolveBcp47(baseLang);
            const targetBcp47 = resolveBcp47(targetLang);

            chunks.forEach((chunk, i) => {
                const isQuoted = /^["'«»""'']/.test(chunk);
                // Strip quotes from the quoted text
                const cleanText = isQuoted
                    ? chunk.replace(/^["'«»""'']+|["'«»""'']+$/g, "").trim()
                    : chunk.trim();

                if (!cleanText) return;

                const bcp47 = isQuoted ? targetBcp47 : baseBcp47;
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = bcp47;
                utterance.rate = speed;

                const voice = findVoice(bcp47);
                if (voice) utterance.voice = voice;

                // Only track isPlaying on first/last chunk
                if (i === 0) {
                    utterance.onstart = () => {
                        setIsPlaying(true);
                        setPlayingText(text);
                    };
                }
                if (i === chunks.length - 1) {
                    utterance.onend = () => {
                        setIsPlaying(false);
                        setPlayingText(null);
                    };
                    utterance.onerror = () => {
                        setIsPlaying(false);
                        setPlayingText(null);
                    };
                }

                window.speechSynthesis.speak(utterance);
            });
        },
        [isPlaying, playingText, stopAudio]
    );

    useEffect(() => {
        return () => {
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return { playAudio, playMixedSpeech, stopAudio, isPlaying, playingText };
};
