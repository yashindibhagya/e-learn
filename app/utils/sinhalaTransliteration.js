/**
 * sinhalaTransliteration.js
 * This file handles transliteration from English letters to Sinhala script
 */

/**
 * Transliterates English letters to Sinhala Unicode characters
 * @param {string} text - Text written in English letters representing Sinhala words
 * @returns {string} - The text converted to Sinhala Unicode script
 */
export const transliterateToSinhalaScript = (text) => {
    if (!text || !text.trim()) return '';

    // Replace patterns with corresponding Sinhala Unicode characters
    // This is a simplified mapping - a complete implementation would need more complex rules

    // First, handle multi-character patterns
    let result = text.toLowerCase()
        // Vowels
        .replace(/aa/g, 'ආ')
        .replace(/ae/g, 'ඇ')
        .replace(/aee/g, 'ඈ')
        .replace(/ii/g, 'ඊ')
        .replace(/ee/g, 'ඊ')
        .replace(/oo/g, 'ඌ')
        .replace(/au/g, 'ඖ')

        // Consonants with following vowels
        .replace(/kha/g, 'ඛ')
        .replace(/gha/g, 'ඝ')
        .replace(/nga/g, 'ඞ')
        .replace(/cha/g, 'ඡ')
        .replace(/jha/g, 'ඣ')
        .replace(/nya/g, 'ඤ')
        .replace(/tta/g, 'ට්ට')
        .replace(/dda/g, 'ඩ්ඩ')
        .replace(/nna/g, 'ණ')
        .replace(/tha/g, 'ථ')
        .replace(/dha/g, 'ධ')
        .replace(/pha/g, 'ඵ')
        .replace(/bha/g, 'භ')
        .replace(/sha/g, 'ශ')

        // Special consonant combinations
        .replace(/th/g, 'ත්')
        .replace(/d/g, 'ද්')
        .replace(/ch/g, 'ච්')
        .replace(/sh/g, 'ෂ්')

        // Then handle single character mappings

        // Vowels
        .replace(/a/g, 'අ')
        .replace(/i/g, 'ඉ')
        .replace(/u/g, 'උ')
        .replace(/e/g, 'එ')
        .replace(/o/g, 'ඔ')

        // Consonants
        .replace(/k/g, 'ක්')
        .replace(/g/g, 'ග්')
        .replace(/c/g, 'ච්')
        .replace(/j/g, 'ජ්')
        .replace(/t/g, 'ට්')
        .replace(/d/g, 'ඩ්')
        .replace(/n/g, 'න්')
        .replace(/p/g, 'ප්')
        .replace(/b/g, 'බ්')
        .replace(/m/g, 'ම්')
        .replace(/y/g, 'ය්')
        .replace(/r/g, 'ර්')
        .replace(/l/g, 'ල්')
        .replace(/v/g, 'ව්')
        .replace(/w/g, 'ව්')
        .replace(/s/g, 'ස්')
        .replace(/h/g, 'හ්');

    // Handle vowel modifiers (hal kirima)
    // This is a simplified version and would need more complex processing for accuracy
    result = result
        .replace(/්අ/g, '')  // Remove hal+a as it's redundant
        .replace(/්ආ/g, 'ා')
        .replace(/්ඇ/g, 'ැ')
        .replace(/්ඈ/g, 'ෑ')
        .replace(/්ඉ/g, 'ි')
        .replace(/්ඊ/g, 'ී')
        .replace(/්උ/g, 'ු')
        .replace(/්ඌ/g, 'ූ')
        .replace(/්එ/g, 'ෙ')
        .replace(/්ඒ/g, 'ේ')
        .replace(/්ඔ/g, 'ො')
        .replace(/්ඕ/g, 'ෝ');

    return result;
};

/**
 * Checks if the given text appears to be Sinhala transliteration
 * @param {string} text - The text to check
 * @returns {boolean} - True if text is likely Sinhala transliteration
 */
export const isSinhalaTransliteration = (text) => {
    if (!text || !text.trim()) return false;

    // Common Sinhala word patterns
    const sinhalaPatterns = [
        /aya$/i, // Common word endings
        /awa$/i,
        /ena$/i,
        /ina$/i,
        /oya/i,  // Common pronouns
        /mama/i,
        /api/i,
        /kohomada/i, // Common question words
        /mokada/i,
        /kawda/i
    ];

    // Check if any pattern matches
    return sinhalaPatterns.some(pattern => pattern.test(text));
};

export default {
    transliterateToSinhalaScript,
    isSinhalaTransliteration
};