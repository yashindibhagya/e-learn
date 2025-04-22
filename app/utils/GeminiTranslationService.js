// You'll need to install this: npm install @google/generative-ai
import { GoogleGenerativeAI } from '@google/generative-ai';

// Constants
const GEMINI_API_KEY = 'AIzaSyB10s_aMTExVfgbr2-WYIMJntDB9mAcrcw'; // Replace with your actual API key

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

// Language codes
export const LANGUAGES = {
    ENGLISH: 'en',
    SINHALA: 'si',
    TAMIL: 'ta'
};

/**
 * Translate text from one language to another using Gemini API
 * 
 * @param {string} text - The text to translate
 * @param {string} sourceLanguage - Source language code (e.g., 'en', 'si', 'ta')
 * @param {string} targetLanguage - Target language code (e.g., 'en', 'si', 'ta')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, sourceLanguage, targetLanguage) => {
    if (!text || !text.trim()) {
        return '';
    }

    try {
        // Construct the language names for clearer prompting
        const sourceLanguageName = getLanguageName(sourceLanguage);
        const targetLanguageName = getLanguageName(targetLanguage);

        // Create the prompt for translation
        const prompt = `Translate the following ${sourceLanguageName} text to ${targetLanguageName}. 
    Provide only the translation without any explanations or additional text:
    
    ${text}`;

        // Generate content with Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text().trim();

        // Clean up any potential explanatory text that might be included
        return cleanTranslation(translatedText);

    } catch (error) {
        console.error('Translation error:', error);
        throw new Error(`Failed to translate text: ${error.message}`);
    }
};

/**
 * Get the full language name from a language code
 * @param {string} languageCode - The ISO language code
 * @returns {string} - The full language name
 */
const getLanguageName = (languageCode) => {
    switch (languageCode) {
        case LANGUAGES.ENGLISH:
            return 'English';
        case LANGUAGES.SINHALA:
            return 'Sinhala';
        case LANGUAGES.TAMIL:
            return 'Tamil';
        default:
            return 'Unknown';
    }
};

/**
 * Clean up the translation response to remove any explanatory text
 * @param {string} text - The raw translation response
 * @returns {string} - Cleaned translation
 */
const cleanTranslation = (text) => {
    // Remove any common prefixes that might appear in the response
    const cleanedText = text
        .replace(/^Translation: /i, '')
        .replace(/^Translated text: /i, '')
        .replace(/^In [a-zA-Z]+: /i, '')
        .trim();

    return cleanedText;
};

// Convenience functions for specific language pairs
export const translateSinhalaToEnglish = (text) => {
    return translateText(text, LANGUAGES.SINHALA, LANGUAGES.ENGLISH);
};

export const translateEnglishToSinhala = (text) => {
    return translateText(text, LANGUAGES.ENGLISH, LANGUAGES.SINHALA);
};

export const translateTamilToEnglish = (text) => {
    return translateText(text, LANGUAGES.TAMIL, LANGUAGES.ENGLISH);
};

export const translateEnglishToTamil = (text) => {
    return translateText(text, LANGUAGES.ENGLISH, LANGUAGES.TAMIL);
};

export const translateSinhalaToTamil = (text) => {
    return translateText(text, LANGUAGES.SINHALA, LANGUAGES.TAMIL);
};

export const translateTamilToSinhala = (text) => {
    return translateText(text, LANGUAGES.TAMIL, LANGUAGES.SINHALA);
};

export default {
    translateText,
    translateSinhalaToEnglish,
    translateEnglishToSinhala,
    translateTamilToEnglish,
    translateEnglishToTamil,
    translateSinhalaToTamil,
    translateTamilToSinhala,
    LANGUAGES
};