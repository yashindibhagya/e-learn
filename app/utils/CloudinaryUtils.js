/**
 * CloudinaryUtils.js
 * Utility functions for generating Cloudinary URLs for sign language videos
 */

// Base URL for Cloudinary resources
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dxjb5lepy';

// Default version to use if specific version is not found
const DEFAULT_VERSION = 'v1742644992';

// Map of known version numbers for specific sign videos
// This can be updated as new videos are added or versions change
const VERSION_MAP = {
    'hello': 'v1742374651',
    'thank_you': 'v1742377081',
    'you': 'v1742377081',
    'world': 'v1742377081',
    'please': 'v1742374651',
    'sorry': 'v1742374651',
    'yes': 'v1742374651',
    'no': 'v1742374651',
    'how_are_you': 'v1742374651',
    'good': 'v1742374651',
    'bad': 'v1742374651',
    'my_name_is': 'v1742374651',
    'nice_to_meet_you': 'v1742374651',
    // Single letters
    'a': 'v1742644992',
    'b': 'v1742644992',
    'c': 'v1742644993',
    'd': 'v1742644993',
    'e': 'v1742644993',
    'f': 'v1742644993',
    'g': 'v1742644993',
    'h': 'v1742644993',
    'i': 'v1742644993',
    'j': 'v1742644993',
    'k': 'v1742644993',
    'l': 'v1742644993',
    'm': 'v1742644993',
    'n': 'v1742644993',
    'o': 'v1742644993',
    'p': 'v1742644993',
    'q': 'v1742644993',
    'r': 'v1742644993',
    's': 'v1742644993',
    't': 'v1742644993',
    'u': 'v1742644993',
    'v': 'v1742644993',
    'w': 'v1742644993',
    'x': 'v1742644993',
    'y': 'v1742644993',
    'z': 'v1742644993',
};

// Map of known public IDs (filename without extension) for videos
// This is to handle cases where the filename doesn't exactly match the word
const PUBLIC_ID_MAP = {
    'hello': 'hello_g34znt',
    'thank_you': 'thank_you_qhsz8s',
    'you': 'you_t1accf',
    'world': 'world_a59e9t',
    'please': 'please',
    'sorry': 'sorry',
    'yes': 'yes',
    'no': 'no',
    'how_are_you': 'howareyou',
    'good': 'good',
    'bad': 'bad',
    'my_name_is': 'mynameis',
    'nice_to_meet_you': 'nicetomeetyou',
    // Single letters have simple public IDs
    'a': 'a',
    'b': 'b_pyl3ny',
    'c': 'c_mssxrd',
    'd': 'd',
    'e': 'e',
    'f': 'f',
    'g': 'g',
    'h': 'h',
    'i': 'i',
    'j': 'j',
    'k': 'k',
    'l': 'l',
    'm': 'm',
    'n': 'n',
    'o': 'o',
    'p': 'p',
    'q': 'q',
    'r': 'r',
    's': 's',
    't': 't',
    'u': 'u',
    'v': 'v',
    'w': 'w',
    'x': 'x',
    'y': 'y',
    'z': 'z',
};

/**
 * Convert a word or phrase to a standardized key format
 * @param {string} word - The word or phrase to convert
 * @returns {string} - The standardized key
 */
const wordToKey = (word) => {
    if (!word) return '';
    return word.toLowerCase().trim().replace(/\s+/g, '_');
};

/**
 * Generate a Cloudinary URL for a given word or phrase
 * @param {string} word - The word or phrase to get the video for
 * @returns {string} - The complete Cloudinary URL
 */
const getSignVideoUrl = (word) => {
    const key = wordToKey(word);

    // Check if we have a specific public ID for this word/phrase
    let publicId = PUBLIC_ID_MAP[key];

    // If no specific public ID is mapped, generate one from the word
    if (!publicId) {
        // For single letters, use the letter itself
        if (key.length === 1 && key.match(/[a-z]/)) {
            publicId = key;
        } else {
            // For words and phrases, transform spaces to underscores and remove special characters
            publicId = key.replace(/[^a-z0-9_]/g, '');
        }
    }

    // Get the version, defaulting if not found
    const version = VERSION_MAP[key] || DEFAULT_VERSION;

    // Construct and return the URL
    return `${CLOUDINARY_BASE_URL}/video/upload/${version}/${publicId}.mp4`;
};

/**
 * Generate a thumbnail URL for a given word or phrase
 * @param {string} word - The word or phrase to get the thumbnail for
 * @returns {string} - The complete Cloudinary thumbnail URL
 */
const getSignThumbnailUrl = (word) => {
    const key = wordToKey(word);

    // Get the public ID, defaulting to the key if not found
    let publicId = PUBLIC_ID_MAP[key] || key;

    // If it has a random string, remove it for the thumbnail
    publicId = publicId.replace(/_[a-z0-9]+$/, '');

    // Construct and return the thumbnail URL
    return `${CLOUDINARY_BASE_URL}/image/upload/v1742374651/thumbnails/${publicId}.jpg`;
};

/**
 * Add or update a mapping for a specific word or phrase
 * @param {string} word - The word or phrase
 * @param {string} publicId - The Cloudinary public ID
 * @param {string} version - The Cloudinary version
 */
const updateSignMapping = (word, publicId, version) => {
    const key = wordToKey(word);
    if (publicId) PUBLIC_ID_MAP[key] = publicId;
    if (version) VERSION_MAP[key] = version;
};

/**
 * Extract the public ID from a full Cloudinary URL
 * @param {string} url - The full Cloudinary URL
 * @returns {string} - The extracted public ID
 */
const extractPublicIdFromUrl = (url) => {
    if (!url) return '';

    // Extract the filename from the URL path
    const match = url.match(/\/upload\/[^/]+\/([^/.]+)/);
    return match ? match[1] : '';
};

/**
 * Extract the version from a full Cloudinary URL
 * @param {string} url - The full Cloudinary URL
 * @returns {string} - The extracted version
 */
const extractVersionFromUrl = (url) => {
    if (!url) return '';

    // Extract the version from the URL path
    const match = url.match(/\/upload\/(v[0-9]+)\//);
    return match ? match[1] : DEFAULT_VERSION;
};

/**
 * Create default sign data structure with Cloudinary URLs
 * @param {string} word - The word or phrase
 * @param {string} sinhalaWord - The Sinhala translation
 * @param {string} sinhalaTranslit - The transliteration
 * @param {string} category - The category (e.g., "conversation")
 * @returns {Object} - A sign data object with Cloudinary URLs
 */
const createSignData = (word, sinhalaWord, sinhalaTranslit, category = "conversation") => {
    const key = wordToKey(word);

    return {
        signId: `${key}-001`,
        word: word,
        sinhalaWord: sinhalaWord,
        sinhalaTranslit: sinhalaTranslit,
        category: category,
        videoUrl: getSignVideoUrl(word),
        thumbnailUrl: getSignThumbnailUrl(word),
        relatedSigns: []
    };
};

/**
 * Create a sign data object that includes Tamil language information
 * @param {string} word - The English word
 * @param {string} sinhalaWord - The Sinhala translation
 * @param {string} sinhalaTranslit - The Sinhala transliteration
 * @param {string} tamilWord - The Tamil translation
 * @param {string} tamilTranslit - The Tamil transliteration
 * @param {string} category - The category
 * @returns {Object} - A complete sign data object
 */
const createMultiLanguageSignData = (word, sinhalaWord, sinhalaTranslit, tamilWord, tamilTranslit, category = "conversation") => {
    const key = wordToKey(word);

    return {
        signId: `${key}-001`,
        word: word,
        sinhalaWord: sinhalaWord,
        sinhalaTranslit: sinhalaTranslit,
        tamilWord: tamilWord,
        tamilTranslit: tamilTranslit,
        category: category,
        videoUrl: getSignVideoUrl(word),
        thumbnailUrl: getSignThumbnailUrl(word),
        relatedSigns: []
    };
};

/**
 * Adds new signs to the existing mapping
 * @param {Array} newSigns - Array of sign objects to add
 */
const addSignsToMapping = (newSigns) => {
    if (!Array.isArray(newSigns)) return;

    newSigns.forEach(sign => {
        const key = wordToKey(sign.word);

        // Add to PUBLIC_ID_MAP if it has a videoUrl
        if (sign.videoUrl) {
            const publicId = extractPublicIdFromUrl(sign.videoUrl);
            if (publicId) PUBLIC_ID_MAP[key] = publicId;

            // Add to VERSION_MAP if it has a videoUrl
            const version = extractVersionFromUrl(sign.videoUrl);
            if (version) VERSION_MAP[key] = version;
        }
    });
};

export default {
    getSignVideoUrl,
    getSignThumbnailUrl,
    updateSignMapping,
    extractPublicIdFromUrl,
    extractVersionFromUrl,
    createSignData,
    createMultiLanguageSignData,
    addSignsToMapping,
    wordToKey
};