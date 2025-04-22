/**
 * translationApi.js
 * 
 * This file provides translation services for the application,
 * with support for English, Sinhala, and Tamil using Gemini API
 */

// Import Gemini translation service
import GeminiTranslationService from './GeminiTranslationService';

// Export the language constants
export const LANGUAGES = {
    ENGLISH: 'en',
    SINHALA: 'si',
    TAMIL: 'ta'
};

/**
 * Translates Sinhala text to English
 * @param {string} text - The Sinhala text to translate
 * @returns {Promise<string>} - The translated English text
 */
export const translateSinhalaToEnglish = async (text) => {
    return GeminiTranslationService.translateSinhalaToEnglish(text);
};

/**
 * Translates English text to Sinhala
 * @param {string} text - The English text to translate
 * @returns {Promise<string>} - The translated Sinhala text
 */
export const translateEnglishToSinhala = async (text) => {
    return GeminiTranslationService.translateEnglishToSinhala(text);
};

/**
 * Translates Tamil text to English
 * @param {string} text - The Tamil text to translate
 * @returns {Promise<string>} - The translated English text
 */
export const translateTamilToEnglish = async (text) => {
    return GeminiTranslationService.translateTamilToEnglish(text);
};

/**
 * Translates English text to Tamil
 * @param {string} text - The English text to translate
 * @returns {Promise<string>} - The translated Tamil text
 */
export const translateEnglishToTamil = async (text) => {
    return GeminiTranslationService.translateEnglishToTamil(text);
};

/**
 * General translation function that handles multiple language pairs
 * @param {string} text - The text to translate
 * @param {string} sourceLanguage - Source language code ('en', 'si', 'ta')
 * @param {string} targetLanguage - Target language code ('en', 'si', 'ta')
 * @returns {Promise<string>} - The translated text
 */
export const translateText = async (text, sourceLanguage, targetLanguage) => {
    return GeminiTranslationService.translateText(text, sourceLanguage, targetLanguage);
};

/**
 * Offline fallback for Sinhala-to-English translation
 * Uses a dictionary of common words for quick translations when API is unavailable
 * @param {string} text - Sinhala text (written in English transliteration)
 * @returns {string} - Translated English text
 */
export const offlineSinhalaToEnglishTranslation = (text) => {
    if (!text || !text.trim()) return '';

    // A dictionary of common Sinhala words (written in English) to English translation
    const sinhalaToEnglishDict = {
        // Greetings & Common Phrases
        "ayubowan": "hello",
        "istuti": "thank you",
        "kohomada": "how are you",
        "oba": "you",
        "mama": "i",
        "oyaa": "you",
        "subha udesanak": "good morning",
        "subha rathreeyak": "good night",

        // Actions
        "kanna": "eat",
        "bonna": "drink",
        "balanna": "look",
        "enna": "come",
        "yanna": "go",
        "indaganna": "sit",
        "natanna": "dance",

        // Family
        "amma": "mother",
        "ammaa": "mother",
        "thaththa": "father",
        "aiya": "brother",
        "akka": "sister",
        "malli": "younger brother",
        "nangi": "younger sister",
        "seeya": "grandfather",
        "aachchi": "grandmother",

        // Numbers
        "eka": "one",
        "deka": "two",
        "thuna": "three",
        "hatara": "four",
        "paha": "five",

        // Colors
        "rathu": "red",
        "nil": "blue",
        "kaha": "yellow",
        "sudu": "white",
        "kalu": "black",

        // Question Words
        "mokakda": "what",
        "kawda": "who",
        "koheda": "where",
        "aei": "why",
        "kohomada": "how"
    };

    // Simple word-by-word translation
    const words = text.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => {
        // Remove any punctuation
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

        // Look up in dictionary, return original if not found
        return sinhalaToEnglishDict[cleanWord] || cleanWord;
    });

    return translatedWords.join(' ');
};

export default {
    translateSinhalaToEnglish,
    translateEnglishToSinhala,
    translateTamilToEnglish,
    translateEnglishToTamil,
    translateText,
    offlineSinhalaToEnglishTranslation,
    LANGUAGES
};