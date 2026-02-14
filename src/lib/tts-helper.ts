import { franc } from 'franc-min';

// Map ISO 639-3 codes (franc) to BCP-47 codes (SpeechSynthesis)
const LANGUAGE_MAP: Record<string, string> = {
    // Portuguese
    'por': 'pt-BR', // Defaulting to Brazilian Portuguese as user seems to prefer it based on context, 
    // or I can check if 'pt-PT' is preferred. User mentioned "Língua" broadly. 
    // Let's stick to a standard and maybe refine later or allow a way to bias.
    // Actually, franc detects 'por'.

    // English
    'eng': 'en-US',

    // Spanish
    'spa': 'es-ES',

    // French
    'fra': 'fr-FR',

    // German
    'deu': 'de-DE',

    // Italian
    'ita': 'it-IT',

    // Japanese
    'jpn': 'ja-JP',

    // Chinese (Simplified)
    'cmn': 'zh-CN',

    // Russian
    'rus': 'ru-RU'
};

/**
 * Detects the language of the given text and returns a BCP-47 language code supported by SpeechSynthesis.
 * if detection fails or is uncertain, returns 'en-US' (or the provided fallback).
 * 
 * @param text The text to analyze
 * @param fallbackLang The fallback language code (default: 'en-US')
 * @returns BCP-47 language code (e.g., 'pt-BR', 'en-US')
 */
export const detectLanguage = (text: string, fallbackLang: string = 'en-US'): string => {
    if (!text || text.length < 3) {
        return fallbackLang;
    }

    // Franc returns ISO 639-3 code (e.g., 'por', 'eng')
    const detected = franc(text);

    if (detected === 'und') {
        return fallbackLang;
    }

    return LANGUAGE_MAP[detected] || fallbackLang;
};
