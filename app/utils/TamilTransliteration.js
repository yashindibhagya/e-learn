/**
 * TamilTransliteration.js
 * 
 * Utility for transliterating Tamil text typed with English letters to Tamil Unicode script
 * Similar to the Sinhala transliteration service, but adapted for Tamil language
 */

// Tamil vowels
const tamilVowels = {
    "a": "அ",
    "aa": "ஆ",
    "i": "இ",
    "ee": "ஈ",
    "u": "உ",
    "oo": "ஊ",
    "e": "எ",
    "ae": "ஏ",
    "ai": "ஐ",
    "o": "ஒ",
    "oa": "ஓ",
    "au": "ஔ"
};

// Tamil consonants
const tamilConsonants = {
    "k": "க்",
    "g": "க்",
    "ng": "ங்",
    "c": "ச்",
    "s": "ச்",
    "j": "ஜ்",
    "ny": "ஞ்",
    "t": "ட்",
    "d": "ட்",
    "n": "ந்",
    "th": "த்",
    "dh": "த்",
    "nh": "ன்",
    "p": "ப்",
    "b": "ப்",
    "m": "ம்",
    "y": "ய்",
    "r": "ர்",
    "l": "ல்",
    "v": "வ்",
    "z": "ழ்",
    "L": "ள்",
    "R": "ற்",
    "N": "ண்",
    "sh": "ஷ்",
    "S": "ஸ்",
    "h": "ஹ்"
};

// Tamil vowel signs (used with consonants)
const tamilVowelSigns = {
    "a": "",      // No vowel sign for 'a' (inherent vowel)
    "aa": "ா",
    "i": "ி",
    "ee": "ீ",
    "u": "ு",
    "oo": "ூ",
    "e": "ெ",
    "ae": "ே",
    "ai": "ை",
    "o": "ொ",
    "oa": "ோ",
    "au": "ௌ"
};

// Special characters
const tamilSpecialChars = {
    ".": ".",
    ",": ",",
    "?": "?",
    "!": "!",
    ";": ";",
    ":": ":",
    "\"": "\"",
    "'": "'",
    "-": "-",
    "(": "(",
    ")": ")",
    "[": "[",
    "]": "]",
    "{": "{",
    "}": "}",
    "/": "/",
    "\\": "\\",
    "@": "@",
    "#": "#",
    "$": "$",
    "%": "%",
    "^": "^",
    "&": "&",
    "*": "*",
    "+": "+",
    "=": "=",
    "_": "_",
    "|": "|",
    "<": "<",
    ">": ">",
    "~": "~",
    "`": "`",
    "0": "௦",  // Tamil numerals
    "1": "௧",
    "2": "௨",
    "3": "௩",
    "4": "௪",
    "5": "௫",
    "6": "௬",
    "7": "௭",
    "8": "௮",
    "9": "௯"
};

/**
 * Transliterate Tamil text typed with English letters to Tamil Unicode
 * 
 * @param {string} text - Tamil text typed with English letters
 * @returns {string} - Transliterated Tamil Unicode text
 */
export const transliterateToTamilScript = (text) => {
    if (!text) return '';

    let result = '';
    let i = 0;

    while (i < text.length) {
        // Try to match longer sequences first
        let matched = false;

        // Check for spaces
        if (text[i] === ' ') {
            result += ' ';
            i++;
            continue;
        }

        // Check for special characters
        if (tamilSpecialChars[text[i]]) {
            result += tamilSpecialChars[text[i]];
            i++;
            continue;
        }

        // Check for vowels (longer ones first)
        for (const vowel of ["ee", "aa", "ae", "ai", "oa", "au", "oo", "a", "i", "u", "e", "o"]) {
            if (text.substring(i, i + vowel.length).toLowerCase() === vowel) {
                result += tamilVowels[vowel];
                i += vowel.length;
                matched = true;
                break;
            }
        }

        if (matched) continue;

        // Check for consonants followed by vowels
        for (const consonant of ["ng", "ny", "th", "dh", "nh", "sh", "k", "g", "c", "s", "j", "t", "d", "n", "p", "b", "m", "y", "r", "l", "v", "z", "L", "R", "N", "S", "h"]) {
            if (text.substring(i, i + consonant.length).toLowerCase() === consonant ||
                (consonant.length === 1 && text[i].toLowerCase() === consonant)) {

                const consonantChar = consonant.length === 1 ? text[i].toLowerCase() : text.substring(i, i + consonant.length).toLowerCase();
                const baseConsonant = tamilConsonants[consonantChar];

                // Check if followed by a vowel
                let vowelFound = false;
                for (const vowel of ["ee", "aa", "ae", "ai", "oa", "au", "oo", "a", "i", "u", "e", "o"]) {
                    if (text.substring(i + consonant.length, i + consonant.length + vowel.length).toLowerCase() === vowel) {
                        // For 'a' vowel, just add the consonant without vowel mark
                        if (vowel === "a") {
                            result += baseConsonant.substring(0, baseConsonant.length - 1); // Remove the virama (்)
                        } else {
                            // For other vowels, add consonant without virama + vowel mark
                            result += baseConsonant.substring(0, baseConsonant.length - 1) + tamilVowelSigns[vowel];
                        }
                        i += consonant.length + vowel.length;
                        vowelFound = true;
                        break;
                    }
                }

                // If no vowel, add the consonant with virama
                if (!vowelFound) {
                    result += baseConsonant;
                    i += consonant.length;
                }

                matched = true;
                break;
            }
        }

        // If no match, just add the character as is
        if (!matched) {
            result += text[i];
            i++;
        }
    }

    return result;
};

/**
 * Checks if the given text appears to be Tamil transliteration
 * @param {string} text - The text to check
 * @returns {boolean} - True if text is likely Tamil transliteration
 */
export const isTamilTransliteration = (text) => {
    if (!text || !text.trim()) return false;

    // Common Tamil word patterns
    const tamilPatterns = [
        /naan/i,    // I
        /nee/i,     // You
        /avan/i,    // He
        /aval/i,    // She
        /avar/i,    // They/He/She (respectful)
        /enna/i,    // What
        /eppo/i,    // When
        /enge/i,    // Where
        /ethu/i,    // Which
        /epdii/i    // How
    ];

    // Check if any pattern matches
    return tamilPatterns.some(pattern => pattern.test(text));
};

export default {
    transliterateToTamilScript,
    isTamilTransliteration
};