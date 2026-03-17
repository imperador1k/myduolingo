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

/**
 * Lightweight heuristic to determine if text is a Portuguese instruction
 * (e.g. "Como se diz...", "Traduza para...") or if it should be read in
 * the target language being learned.
 *
 * @param text The string of text to analyze
 * @param targetLanguageCode The course's active language code (e.g., 'es', 'en')
 * @returns The language code to use ('pt-PT' or targetLanguageCode)
 */
export const getAudioLanguage = (text: string, targetLanguageCode: string): string => {
    if (!text) return targetLanguageCode;

    const lowerText = text.toLowerCase();
    
    // Expanded dictionary of Portuguese instructional words and common conversational connectors
    const ptWords = "traduza|como se diz|qual|selecione|complete|preencha|escolha|não|um|uma|é|você|ele|ela|o que significa|a frase|a palavra|sabias que|que|para|com|por|quem|onde|quando|porque|pessoa|tribunal|decisões|são|está|este|esta|esse|essa|isso|muito|mais|nosso|nossa|seja|fazer|sobre|mesmo|ainda|como";
    
    // Safely match word boundaries accounting for Unicode/accents and punctuation
    const ptRegex = new RegExp(`(?:^|[\\s,.\\-!?()'"«»])(${ptWords})(?=[\\s,.\\-!?()'"«»]|$)`, 'i');

    // Also flag obvious Portuguese-specific accented suffixes which rarely appear in English
    const hasPtAccents = /(ões|ães|çao|ções)\b/i.test(lowerText);

    if (ptRegex.test(text) || hasPtAccents) {
        return 'pt-PT';
    }

    // Otherwise use the target language code
    return targetLanguageCode;
};
