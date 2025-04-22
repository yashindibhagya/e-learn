import React, { useState, useContext, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Keyboard,
    Alert,
    Animated
} from 'react-native';
import { Video } from 'expo-av';
import { Audio } from 'expo-av'; // Import Audio for voice recording
import { VideoContext } from '../../context/VideoContext';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';

// Import the speech recognition service
import { recognizeSpeech, recognizeSpeechOffline } from '../../services/speechService';

// Import the translation API services
import {
    translateSinhalaToEnglish,
    translateTamilToEnglish,
    translateText,
    LANGUAGES
} from '../utils/translationApi';

// Import the transliteration services
import { transliterateToSinhalaScript } from '../utils/sinhalaTransliteration';
import { transliterateToTamilScript } from '../utils/TamilTransliteration';
import Common from '../../Components/Container/Common';
import Button from '../../Components/Shared/Button';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

// Firebase imports
import { doc, setDoc, collection, getDocs, deleteDoc, query, where, orderBy, limit, writeBatch } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';

//refresh function
import { RefreshControl } from 'react-native';

// Define common words that typically don't have sign language videos
const commonWordsWithoutSigns = [
    'a', 'an', 'the', 'is', 'are', 'am', 'was', 'were', 'be', 'been',
    'and', 'or', 'but', 'if', 'of', 'at', 'by', 'for', 'with', 'about',
    'to', 'from', 'up', 'down', 'in', 'on', 'off', 'over', 'under',
    'this', 'that', 'these', 'those',
];

// Video cache to store already loaded videos
const videoCache = {};

// Punctuation to ignore
const punctuationToIgnore = /[.,!?;:()[\]{}'"]/g;

// Helper function to detect proper names
const isProperName = (word) => {
    // Check if word starts with a capital letter and isn't a common word that might be capitalized
    const commonCapitalizedWords = ['i', 'my', 'me', 'mine', 'you', 'your', 'yours', 'we', 'us', 'our', 'ours'];

    // More robust check for proper names - either starts with capital or has capital in the middle
    const startsWithCapital = word.length > 0 && word[0] === word[0].toUpperCase();
    const hasInternalCapital = word.slice(1).split('').some(char => char === char.toUpperCase() && char.match(/[A-Z]/));

    return (startsWithCapital || hasInternalCapital) &&
        !commonCapitalizedWords.includes(word.toLowerCase());
};

// Helper function to check if a token is a single letter
const isSingleLetter = (token) => {
    return token.length === 1 && token.match(/[A-Za-z]/);
};

// Helper function to identify if input has spaced letters pattern
const hasSpacedLetters = (tokens) => {
    if (tokens.length < 2) return false;

    const singleLetterCount = tokens.filter(token =>
        token.length === 1 && token.match(/[a-zA-Z]/)
    ).length;

    return singleLetterCount >= 2 && (singleLetterCount / tokens.length) > 0.5;
};

// Helper function to remove common words from text
const removeCommonWords = (text) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    const filtered = words.filter(word => {
        // Keep words that are not in the common words list
        const cleanWord = word.toLowerCase().replace(/[.,!?;:()[\]{}'"]/g, "");
        return !commonWordsWithoutSigns.includes(cleanWord);
    });
    return filtered.join(' ');
};

// Helper function to combine spaced letters into words
const combineSpacedLetters = (tokens) => {
    if (tokens.length <= 1) return tokens;

    const result = [];
    let currentWord = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.length === 1 && token.match(/[a-zA-Z]/)) {
            // This is a single letter, add to current word
            currentWord.push(token);
        } else {
            // This is a longer token (word)
            // If we had collected letters, add them as a combined word
            if (currentWord.length > 0) {
                result.push(currentWord.join(''));
                currentWord = [];
            }
            // Add the current token (word) to the result
            result.push(token);
        }
    }

    // Add any remaining letters as a word
    if (currentWord.length > 0) {
        result.push(currentWord.join(''));
    }

    return result;
};

// Pre-fetch and cache a video
const prefetchVideo = async (url, cacheKey) => {
    if (!url || videoCache[cacheKey]) return; // Skip if URL is invalid or already cached

    try {
        // Start loading the video but don't wait for it to complete
        videoCache[cacheKey] = { url, isLoading: true };

        // We're just initiating the fetch here, not awaiting it
        // This allows multiple videos to load in parallel
        fetch(url, { method: 'HEAD' })
            .then(() => {
                videoCache[cacheKey] = { url, isLoading: false, isLoaded: true };
            })
            .catch(error => {
                console.error(`Error prefetching video ${url}:`, error);
                delete videoCache[cacheKey]; // Remove from cache on error
            });
    } catch (error) {
        console.error(`Error setting up prefetch for ${url}:`, error);
    }
};

// Optimized recording options for speech recognition
const getRecordingOptions = () => {
    return {
        android: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 1, // Mono is better for speech recognition
            bitRate: 128000,
        },
        ios: {
            extension: '.m4a',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 1, // Mono is better for speech recognition
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
    };
};

export default function TextToSign() {
    const inputRef = useRef(null);
    const scrollViewRef = useRef(null);
    const [inputText, setInputText] = useState('');
    const [sinhalaScript, setSinhalaScript] = useState(''); // Sinhala Unicode text
    const [tamilScript, setTamilScript] = useState(''); // Tamil Unicode text
    const [translatedText, setTranslatedText] = useState(''); // English translation of text
    const [translatedSigns, setTranslatedSigns] = useState([]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isTransliterating, setIsTransliterating] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [playlistReady, setPlaylistReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.5); // Default playback rate (1.5x speed)
    const [recentTranslations, setRecentTranslations] = useState([]);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [languageMode, setLanguageMode] = useState('sinhala'); // 'sinhala', 'tamil', or 'english'
    // State to track if current conversation has been saved
    const [isSaved, setIsSaved] = useState(false);
    // State to store current conversation data
    const [currentConversation, setCurrentConversation] = useState(null);
    // State for bottom padding to handle navigation bar
    const [bottomPadding, setBottomPadding] = useState(80);
    // States for the deleted conversation undo feature
    const [deletedConversation, setDeletedConversation] = useState(null);
    const [showUndoToast, setShowUndoToast] = useState(false);
    const undoTimerRef = useRef(null);
    // Video error tracking
    const [videoError, setVideoError] = useState(false);
    // Track missing words
    const [notFoundWords, setNotFoundWords] = useState([]);
    // Retry counter for video loading attempts
    const retryCounter = useRef(0);
    // Track if a video is currently being loaded to prevent duplicate operations
    const isLoadingVideo = useRef(false);
    // Track skipped words (words without sign videos)
    const [skippedWords, setSkippedWords] = useState([]);
    // Store original input tokens (to preserve spacing)
    const [originalInputTokens, setOriginalInputTokens] = useState([]);
    // Track if we have spaced letter input
    const [hasSpacedLetterInput, setHasSpacedLetterInput] = useState(false);
    // Loading progress
    const [loadingProgress, setLoadingProgress] = useState(0);
    // Track video preloading status
    const [videosPreloaded, setVideosPreloaded] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [hasRecordingPermission, setHasRecordingPermission] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [recordingDuration, setRecordingDuration] = useState(0);
    const durationTimerRef = useRef(null);

    // Animation value for recording indicator pulse
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const router = useRouter();
    const { getSignVideoByWord, isLoading, signsData, recordFailedVideoUrl, findSignForPhrase } = useContext(VideoContext);
    const videoRef = useRef(null);

    // Request microphone permissions on component mount
    useEffect(() => {
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            setHasRecordingPermission(status === 'granted');
        })();

        // Set up audio recording session
        Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
        }).catch(err => console.log('Failed to set audio mode', err));

        // Make sure to clean up recording resources when component unmounts
        return () => {
            if (recording) {
                stopRecording();
            }
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
            }

            // Reset audio mode when unmounting
            Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: false,
            }).catch(err => console.log('Failed to reset audio mode', err));
        };
    }, []);

    // Animation for the recording indicator pulse
    useEffect(() => {
        let pulseAnimation;
        if (isRecording) {
            // Create a repeating pulse animation
            pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.5,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            );

            // Start the animation
            pulseAnimation.start();
        } else {
            // Reset the animation when not recording
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        // Clean up animation when component unmounts or recording state changes
        return () => {
            if (pulseAnimation) {
                pulseAnimation.stop();
            }
        };
    }, [isRecording, pulseAnim]);


    // Start recording audio
    const startRecording = async () => {
        try {
            // Check permissions
            if (!hasRecordingPermission) {
                const { status } = await Audio.requestPermissionsAsync();
                setHasRecordingPermission(status === 'granted');
                if (status !== 'granted') {
                    Alert.alert('Permission Required', 'Microphone permission is needed to record audio.');
                    return;
                }
            }

            // First provide feedback to the user
            if (Platform.OS === 'ios') {
                // On iOS, haptic feedback
                try {
                    const Haptics = await import('expo-haptics');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch (err) {
                    console.log('Haptics not available:', err);
                }
            }

            // Make sure audio mode is set for recording
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                playThroughEarpieceAndroid: false, // Use speaker
            });

            // Get optimized recording options for speech recognition
            const recordingOptions = getRecordingOptions();

            // Initialize recording
            const newRecording = new Audio.Recording();

            try {
                // Show that we're getting ready to record
                setRecordingStatus('preparing');
                console.log('Preparing to record with options:', recordingOptions);

                // Prepare and start the recording
                await newRecording.prepareToRecordAsync(recordingOptions);
                await newRecording.startAsync();
                console.log('Recording started successfully');

                // Update state after successful start
                setRecording(newRecording);
                setIsRecording(true);
                setRecordingStatus('recording');

                // Reset and start the duration timer
                setRecordingDuration(0);
                if (durationTimerRef.current) {
                    clearInterval(durationTimerRef.current);
                }
                durationTimerRef.current = setInterval(() => {
                    setRecordingDuration(prev => {
                        // Add maximum recording duration (30 seconds)
                        if (prev >= 30) {
                            stopRecording();
                            return 30;
                        }
                        return prev + 1;
                    });
                }, 1000);
            } catch (err) {
                console.error('Recording preparation failed', err);
                throw err;
            }
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert(
                'Recording Error',
                'Failed to start recording. Please check your microphone and try again.',
                [{ text: 'OK' }]
            );
            setRecordingStatus('idle');
        }
    };


    // Stop recording and process the audio
    const stopRecording = async () => {
        if (!recording) return;

        try {
            // First provide feedback to the user
            if (Platform.OS === 'ios') {
                // On iOS, haptic feedback
                try {
                    const Haptics = await import('expo-haptics');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (err) {
                    console.log('Haptics not available:', err);
                }
            }

            // Update UI state first to provide immediate feedback
            setIsRecording(false);
            setRecordingStatus('stopping');
            console.log('Stopping recording...');

            // Clear the duration timer
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
                durationTimerRef.current = null;
            }

            let recordingUri = null;

            // Try to stop the recording gracefully
            try {
                // Stop the recording and get its status
                const status = await recording.stopAndUnloadAsync();
                console.log('Recording stopped successfully with status:', status);

                // Get the recording URI
                recordingUri = recording.getURI();

                if (!recordingUri) {
                    throw new Error('Recording URI is undefined');
                }

                console.log('Recording saved to:', recordingUri);

                // Check if recording is too short (less than 0.5 seconds)
                if (recordingDuration < 1) {
                    setRecordingStatus('idle');
                    Alert.alert(
                        'Recording Too Short',
                        'Please record for at least 1 second.',
                        [{ text: 'OK' }]
                    );
                    return;
                }

                // Process the recording for speech-to-text
                await processRecording(recordingUri);

            } catch (stopError) {
                console.error('Error stopping recording:', stopError);

                // Try a fallback method to ensure recording stops
                try {
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: false,
                        playsInSilentModeIOS: false,
                    });

                    setRecordingStatus('idle');
                    Alert.alert(
                        'Recording Note',
                        'Recording may not have saved properly. Please try again.',
                        [{ text: 'OK' }]
                    );
                } catch (fallbackError) {
                    console.error('Fallback error handling failed:', fallbackError);
                    throw fallbackError;
                }
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
            Alert.alert(
                'Recording Error',
                'Failed to process recording. Please try again.',
                [{ text: 'OK' }]
            );
            setRecordingStatus('idle');
        } finally {
            // Ensure we clean up and reset states
            setRecording(null);
        }
    };


    // Process the recording with speech recognition service
    const processRecording = async (uri) => {
        try {
            // Update UI state to show processing
            setRecordingStatus('processing');

            // Get appropriate language code based on current language mode
            const languageCode =
                languageMode === 'english' ? 'en-US' :
                    languageMode === 'sinhala' ? 'si-LK' :
                        'ta-IN'; // Tamil

            // Instead of using our speech service, let's directly prompt the user to enter text
            // This is a temporary solution until your backend speech API is integrated

            // Show prompt asking user to type what they said
            Alert.prompt(
                'Speech Input',
                'Please type what you just said:',
                [
                    {
                        text: 'Cancel',
                        onPress: () => {
                            console.log('User cancelled speech input');
                            setRecordingStatus('idle');
                        },
                        style: 'cancel'
                    },
                    {
                        text: 'OK',
                        onPress: (text) => {
                            if (text && text.trim()) {
                                // Update input text field with user-provided text
                                setInputText(text);

                                // Also update the appropriate script based on language
                                if (languageMode === 'sinhala') {
                                    const sinhalaText = transliterateToSinhalaScript(text);
                                    setSinhalaScript(sinhalaText);
                                } else if (languageMode === 'tamil') {
                                    const tamilText = transliterateToTamilScript(text);
                                    setTamilScript(tamilText);
                                }

                                // Trigger translation automatically after a slight delay
                                setTimeout(() => {
                                    handleTranslate();
                                }, 300);
                            }
                            setRecordingStatus('idle');
                        }
                    }
                ],
                'plain-text'
            );

            // For Android which doesn't support Alert.prompt, use a different approach
            // You would implement a custom modal or input dialog
            if (Platform.OS === 'android') {
                setRecordingStatus('idle');
                Alert.alert(
                    'Manual Input Required',
                    'Please type what you said in the text box and press Translate.',
                    [{ text: 'OK' }]
                );
            }

        } catch (error) {
            console.error('Speech processing error:', error);
            Alert.alert(
                'Speech Recognition Error',
                'Could not process your speech. Please type your message instead.',
                [{ text: 'OK' }]
            );
            setRecordingStatus('idle');
        }
    };

    // Render the recording button and status
    const renderRecordingControls = () => {
        // Don't show if we don't have permission
        if (!hasRecordingPermission && recordingStatus === 'idle') {
            return (
                <TouchableOpacity
                    style={styles.micPermissionButton}
                    onPress={async () => {
                        const { status } = await Audio.requestPermissionsAsync();
                        setHasRecordingPermission(status === 'granted');
                    }}
                >
                    <MaterialIcons name="mic-off" size={24} color="#D32F2F" />
                    <Text style={styles.micPermissionText}>Enable Microphone</Text>
                </TouchableOpacity>
            );
        }

        if (recordingStatus === 'preparing') {
            return (
                <View style={styles.recordingStatusContainer}>
                    <ActivityIndicator size="small" color="#FF9800" />
                    <Text style={styles.recordingStatusText}>Preparing...</Text>
                </View>
            );
        }

        if (recordingStatus === 'processing') {
            return (
                <View style={styles.recordingStatusContainer}>
                    <ActivityIndicator size="small" color="#4C9EFF" />
                    <Text style={styles.recordingStatusText}>Processing speech...</Text>
                </View>
            );
        }

        if (recordingStatus === 'stopping') {
            return (
                <View style={styles.recordingStatusContainer}>
                    <ActivityIndicator size="small" color="#FF9800" />
                    <Text style={styles.recordingStatusText}>Finalizing...</Text>
                </View>
            );
        }

        if (isRecording) {
            const remainingTime = 30 - recordingDuration;
            const isTimeRunningOut = remainingTime <= 5;

            return (
                <View style={styles.recordingContainer}>
                    <View style={styles.recordingIndicator}>
                        <Animated.View
                            style={[
                                styles.recordingDot,
                                isTimeRunningOut && styles.recordingDotWarning,
                                { transform: [{ scale: pulseAnim }] }
                            ]}
                        />
                        <Text style={[
                            styles.recordingTime,
                            isTimeRunningOut && styles.recordingTimeWarning
                        ]}>
                            {Math.floor(recordingDuration / 60).toString().padStart(2, '0')}:
                            {(recordingDuration % 60).toString().padStart(2, '0')}
                            {isTimeRunningOut && ` (${remainingTime}s left)`}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.stopRecordingButton}
                        onPress={stopRecording}
                    >
                        <FontAwesome name="stop" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            );
        }

        // Language-specific mic button tooltip
        const getLanguageTooltip = () => {
            switch (languageMode) {
                case 'english':
                    return "Speak in English";
                case 'sinhala':
                    return "Speak in Sinhala";
                case 'tamil':
                    return "Speak in Tamil";
                default:
                    return "Speak now";
            }
        };

        return (
            <View style={styles.micButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.micButton,
                        {
                            borderColor:
                                languageMode === 'english' ? '#FF9800' :
                                    languageMode === 'sinhala' ? '#4C9EFF' :
                                        '#9C27B0' // Tamil
                        }
                    ]}
                    onPress={startRecording}
                >
                    <MaterialIcons
                        name="mic"
                        size={24}
                        color={
                            languageMode === 'english' ? '#FF9800' :
                                languageMode === 'sinhala' ? '#4C9EFF' :
                                    '#9C27B0' // Tamil
                        }
                    />
                </TouchableOpacity>
                <Text style={styles.micButtonTooltip}>{getLanguageTooltip()}</Text>
            </View>
        );
    };

    // Enhanced getSignVideoByWord to handle array format of Sinhala words
    const getSignVideoWithArraySupport = (word) => {
        if (!signsData || !word) return null;

        // First try to find an exact match
        const exactMatch = signsData.find(sign => sign.word.toLowerCase() === word.toLowerCase());
        if (exactMatch) return exactMatch;

        // Try to find by Sinhala word/transliteration (handling both string and array formats)
        const sinhalaMatch = signsData.find(sign => {
            // Check if sinhalaWord is an array
            if (Array.isArray(sign.sinhalaWord)) {
                return sign.sinhalaWord.some(sw => sw.toLowerCase() === word.toLowerCase());
            }
            // Otherwise treat as string
            return sign.sinhalaWord && sign.sinhalaWord.toLowerCase() === word.toLowerCase();
        });
        if (sinhalaMatch) return sinhalaMatch;

        // Try to find by transliteration
        const translitMatch = signsData.find(sign => {
            // Check if sinhalaTranslit is an array
            if (Array.isArray(sign.sinhalaTranslit)) {
                return sign.sinhalaTranslit.some(st => st.toLowerCase() === word.toLowerCase());
            }
            // Otherwise treat as string
            return sign.sinhalaTranslit && sign.sinhalaTranslit.toLowerCase() === word.toLowerCase();
        });
        if (translitMatch) return translitMatch;

        // Try to find partial matches (for multi-word searches)
        if (word.includes(' ')) {
            const words = word.split(' ');
            for (const w of words) {
                const partialMatch = getSignVideoWithArraySupport(w);
                if (partialMatch) return partialMatch;
            }
        }

        return null;
    };

    // Function to scroll to bottom of the ScrollView
    const scrollToBottom = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    };

    //refresh
    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);

        // Reset functionality here
        setInputText('');
        setSinhalaScript('');
        setTamilScript('');
        setTranslatedText('');
        setTranslatedSigns([]);
        setVideoError(false);
        setPlaylistReady(false);
        setCurrentConversation(null);
        setIsSaved(false);
        setNotFoundWords([]);
        setSkippedWords([]);
        setOriginalInputTokens([]);
        setLoadingProgress(0);
        setVideosPreloaded(false);

        // Reload data from Firebase
        await loadRecentTranslations();

        setRefreshing(false);
    }, []);

    // Set appropriate bottom padding for navigation bar
    useEffect(() => {
        const updateBottomPadding = () => {
            const bottomInset = Platform.OS === 'ios' ? 34 : 16;
            setBottomPadding(bottomInset + 50); // Add extra space for the navigation bar
        };

        updateBottomPadding();
    }, []);

    // Convert input text to appropriate script as the user types
    useEffect(() => {
        if (inputText) {
            // Save original token structure - split by space but keep track of each token
            const tokens = inputText.split(/\s+/).filter(token => token.length > 0);
            setOriginalInputTokens(tokens);

            // Check if input contains spaced letters pattern
            const spacedLetters = hasSpacedLetters(tokens);
            setHasSpacedLetterInput(spacedLetters);

            if (languageMode === 'sinhala') {
                const sinhalaText = transliterateToSinhalaScript(inputText);
                setSinhalaScript(sinhalaText);
                setTamilScript('');
            } else if (languageMode === 'tamil') {
                const tamilText = transliterateToTamilScript(inputText);
                setTamilScript(tamilText);
                setSinhalaScript('');
            } else {
                setSinhalaScript('');
                setTamilScript('');
            }
        } else {
            setSinhalaScript('');
            setTamilScript('');
            setOriginalInputTokens([]);
            setHasSpacedLetterInput(false);
        }
    }, [inputText, languageMode]);

    // Monitor keyboard visibility
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    // Load recent translations from Firestore on component mount
    useEffect(() => {
        loadRecentTranslations();
    }, []);

    // Preload videos when sign data becomes available
    useEffect(() => {
        if (signsData && signsData.length > 0 && !videosPreloaded) {
            // Preload the most common signs
            const commonSigns = signsData.slice(0, 10); // Take first 10 signs (assumes most common are first)

            commonSigns.forEach(sign => {
                if (sign.videoUrl) {
                    prefetchVideo(sign.videoUrl, sign.word.toLowerCase());
                }
            });

            setVideosPreloaded(true);
        }
    }, [signsData]);

    // Load recent translations from Firestore
    const loadRecentTranslations = async () => {
        if (!auth.currentUser) {
            console.log('No user is logged in');
            return;
        }

        try {
            const conversationsRef = collection(db, "users", auth.currentUser.uid, "conversations");
            const q = query(conversationsRef, orderBy("timestamp", "desc"), limit(10));
            const querySnapshot = await getDocs(q);

            const conversations = [];
            querySnapshot.forEach((doc) => {
                conversations.push(doc.data());
            });

            setRecentTranslations(conversations);
        } catch (e) {
            console.log('Failed to load conversations from Firestore', e);
            // Fall back to local storage if Firestore fails
            try {
                const stored = await FileSystem.readAsStringAsync(
                    FileSystem.documentDirectory + 'recentTranslations.json'
                ).catch(() => '[]');

                setRecentTranslations(JSON.parse(stored));
            } catch (err) {
                console.log('Failed to load recent translations from local storage', err);
                setRecentTranslations([]);
            }
        }
    };

    // Save the current translation to Firestore
    const saveConversation = async () => {
        if (!currentConversation) return;

        try {
            if (auth.currentUser) {
                // Firebase is available and user is logged in

                // Create a reference to the user's conversations collection
                const conversationsRef = collection(db, "users", auth.currentUser.uid, "conversations");

                // Add a document with a generated ID
                const newConversationRef = doc(conversationsRef);

                // Prepare the data to save
                const conversationData = {
                    ...currentConversation,
                    id: newConversationRef.id,
                    userId: auth.currentUser.uid
                };

                // Save to Firestore
                await setDoc(newConversationRef, conversationData);

                // Update local state
                const newRecent = [
                    conversationData,
                    ...recentTranslations.filter(item => item.text !== currentConversation.text)
                ].slice(0, 10);

                setRecentTranslations(newRecent);
                setIsSaved(true);

                // Also save to local storage as a backup
                await FileSystem.writeAsStringAsync(
                    FileSystem.documentDirectory + 'recentTranslations.json',
                    JSON.stringify(newRecent)
                );
            } else {
                // Fall back to local storage if no user is logged in
                const newRecent = [
                    currentConversation,
                    ...recentTranslations.filter(item => item.text !== currentConversation.text)
                ].slice(0, 10);

                setRecentTranslations(newRecent);
                setIsSaved(true);

                await FileSystem.writeAsStringAsync(
                    FileSystem.documentDirectory + 'recentTranslations.json',
                    JSON.stringify(newRecent)
                );
            }
        } catch (e) {
            console.log('Failed to save conversation', e);
            Alert.alert("Error", "Failed to save conversation. Please try again.");
        }
    };

    // Function to delete a conversation
    const deleteConversation = async (index) => {
        try {
            const itemToDelete = recentTranslations[index];

            // Store the deleted item and its index for potential undo
            setDeletedConversation({
                item: itemToDelete,
                index: index
            });

            // Create a new array without the item to delete
            const updatedTranslations = [
                ...recentTranslations.slice(0, index),
                ...recentTranslations.slice(index + 1)
            ];

            // Update state
            setRecentTranslations(updatedTranslations);

            if (auth.currentUser && itemToDelete.id) {
                // Delete from Firestore if user is logged in and the item has an ID
                const conversationRef = doc(db, "users", auth.currentUser.uid, "conversations", itemToDelete.id);
                await deleteDoc(conversationRef);
            }

            // Also update local storage
            await FileSystem.writeAsStringAsync(
                FileSystem.documentDirectory + 'recentTranslations.json',
                JSON.stringify(updatedTranslations)
            );

            // Show undo toast
            setShowUndoToast(true);

            // Clear any existing timer
            if (undoTimerRef.current) {
                clearTimeout(undoTimerRef.current);
            }

            // Set timer to hide toast after 3 seconds
            undoTimerRef.current = setTimeout(() => {
                setShowUndoToast(false);
                setDeletedConversation(null);
            }, 3000);

        } catch (e) {
            console.log('Failed to delete conversation', e);
            Alert.alert("Error", "Failed to delete conversation. Please try again.");
        }
    };

    // Function to undo the delete
    const undoDelete = async () => {
        if (!deletedConversation) return;

        try {
            // Create a new array with the deleted item restored
            const restoredTranslations = [...recentTranslations];
            restoredTranslations.splice(
                deletedConversation.index,
                0,
                deletedConversation.item
            );

            // Update state
            setRecentTranslations(restoredTranslations);

            // Restore to Firestore if user is logged in and the item has an ID
            if (auth.currentUser && deletedConversation.item.id) {
                const conversationRef = doc(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "conversations",
                    deletedConversation.item.id
                );
                await setDoc(conversationRef, deletedConversation.item);
            }

            // Also update local storage
            await FileSystem.writeAsStringAsync(
                FileSystem.documentDirectory + 'recentTranslations.json',
                JSON.stringify(restoredTranslations)
            );

            // Clear undo state
            setShowUndoToast(false);
            setDeletedConversation(null);

            // Clear timer
            if (undoTimerRef.current) {
                clearTimeout(undoTimerRef.current);
                undoTimerRef.current = null;
            }

        } catch (e) {
            console.log('Failed to restore conversation', e);
        }
    };

    // Clear history
    const clearHistory = async () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to clear all saved translations?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Clear All",
                    onPress: async () => {
                        try {
                            // Clear from Firestore if user is logged in
                            if (auth.currentUser) {
                                const conversationsRef = collection(db, "users", auth.currentUser.uid, "conversations");
                                const snapshot = await getDocs(conversationsRef);

                                // Batch delete (Firebase has a limit of 500 operations per batch)
                                const batch = writeBatch(db);
                                snapshot.docs.forEach((doc) => {
                                    batch.delete(doc.ref);
                                });
                                await batch.commit();
                            }

                            // Clear local state
                            setRecentTranslations([]);

                            // Clear local storage backup
                            await FileSystem.writeAsStringAsync(
                                FileSystem.documentDirectory + 'recentTranslations.json',
                                '[]'
                            );
                        } catch (e) {
                            console.log('Failed to clear history', e);
                            Alert.alert("Error", "Failed to clear all conversations. Please try again.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Translate from source language to English - preserves letter spacing
    const translateToEnglish = async (text) => {
        if (!text.trim()) return '';

        setIsTransliterating(true);
        try {
            let translatedText = '';

            // First do the translation
            switch (languageMode) {
                case 'sinhala':
                    translatedText = await translateSinhalaToEnglish(text);
                    break;
                case 'tamil':
                    translatedText = await translateTamilToEnglish(text);
                    break;
                default:
                    translatedText = text;
            }

            // Process the translated text based on input pattern
            if (hasSpacedLetterInput) {
                // If original input had spaced letters, combine them in the translation
                const translatedTokens = translatedText.split(/\s+/).filter(t => t.length > 0);
                const combinedTokens = combineSpacedLetters(translatedTokens);
                translatedText = combinedTokens.join(' ');
            }

            // Remove common words
            translatedText = removeCommonWords(translatedText);

            //console.log(`Translated: "${text}" → "${translatedText}"`);
            setTranslatedText(translatedText);
            setIsTransliterating(false);
            return translatedText;
        } catch (error) {
            console.error("Translation error:", error);
            setIsTransliterating(false);
            Alert.alert(
                "Translation Error",
                "Failed to translate text. Please try again."
            );
            return '';
        }
    };

    // Handle text translation to sign videos - IMPROVED IMPLEMENTATION
    const handleTranslate = async () => {
        if (!inputText.trim()) return;

        Keyboard.dismiss(); // Hide keyboard when translating
        setIsTranslating(true);
        setPlaylistReady(false);
        setIsPlaying(false); // Reset playing state
        setIsSaved(false); // Reset saved state for new translation
        setVideoError(false); // Reset video error state
        setNotFoundWords([]); // Reset missing words list
        setSkippedWords([]); // Reset skipped words list
        retryCounter.current = 0; // Reset retry counter
        setLoadingProgress(0); // Reset loading progress

        // Process text based on language mode
        let textToProcess = inputText;

        // If not in English mode, translate to English first
        if (languageMode !== 'english') {
            textToProcess = await translateToEnglish(inputText);
            if (!textToProcess) {
                setIsTranslating(false);
                return;
            }
        } else {
            // For English mode, apply the same filters (remove common words)
            textToProcess = removeCommonWords(inputText);
            setTranslatedText(textToProcess);
        }

        // Create current conversation object but don't save yet
        const conversationData = {
            text: inputText,
            sinhalaScript: languageMode === 'sinhala' ? sinhalaScript : '',
            tamilScript: languageMode === 'tamil' ? tamilScript : '',
            translated: textToProcess,
            timestamp: new Date().toISOString(),
            language: languageMode
        };
        setCurrentConversation(conversationData);

        // Split the text into words, ignoring punctuation
        // For video processing, we keep the original tokens to preserve individual letters
        const tokens = inputText
            .replace(punctuationToIgnore, '') // Remove punctuation
            .trim()
            .split(/\s+/)
            .filter(token => token.length > 0);

        const signs = [];
        const missingWords = [];
        const skipped = [];
        const playlist = [];

        // Process each token (word or letter)
        for (let i = 0; i < tokens.length; i++) {
            const originalToken = tokens[i];
            const cleanToken = originalToken.toLowerCase().replace(punctuationToIgnore, "");

            if (!cleanToken) continue; // Skip empty strings

            // Check if this is a common word that typically doesn't have a sign
            const isCommonWord = commonWordsWithoutSigns.includes(cleanToken);

            // Check if this is a single letter
            const isSingleChar = isSingleLetter(cleanToken);

            // Check if this token should be treated as a name
            const shouldSpellLetterByLetter = isProperName(originalToken);

            // Skip common words completely
            if (isCommonWord) {
                signs.push({
                    word: originalToken,
                    notFound: true,
                    index: i,
                    isCommonWord: true
                });
                skipped.push(originalToken);
                continue; // Skip to next token - don't add to playlist
            }

            // Try to get the sign for this token using the enhanced function
            const sign = getSignVideoWithArraySupport(cleanToken);

            if (isSingleChar) {
                // This is a single letter - process as a letter
                const letterSign = getSignVideoWithArraySupport(cleanToken);

                if (letterSign && letterSign.videoUrl) {
                    signs.push({
                        word: originalToken,
                        videoUrl: letterSign.videoUrl,
                        notFound: false,
                        index: i,
                        isLetter: true,
                        letterPosition: 0,
                        nameLength: 1
                    });
                    playlist.push(letterSign.videoUrl);

                    // Start prefetching this video now
                    prefetchVideo(letterSign.videoUrl, cleanToken);
                } else {
                    signs.push({
                        word: originalToken,
                        notFound: true,
                        index: i,
                        isLetter: true
                    });
                    missingWords.push(originalToken);
                }
            } else if (sign && sign.videoUrl) {
                // Word has a sign video
                signs.push({
                    word: originalToken,
                    videoUrl: sign.videoUrl,
                    notFound: false,
                    index: i
                });
                playlist.push(sign.videoUrl);

                // Start prefetching this video now
                prefetchVideo(sign.videoUrl, cleanToken);
            } else if (shouldSpellLetterByLetter) {
                // This is a proper name - process letter by letter
                let allLettersFound = true;
                const nameLetterVideos = [];

                // Add a special "name start" indicator if available
                const nameStartSign = getSignVideoWithArraySupport("name_start");
                if (nameStartSign && nameStartSign.videoUrl) {
                    signs.push({
                        word: "🔤", // Using emoji to indicate finger spelling will begin
                        videoUrl: nameStartSign.videoUrl,
                        notFound: false,
                        index: i,
                        isNameIndicator: true
                    });
                    playlist.push(nameStartSign.videoUrl);
                    prefetchVideo(nameStartSign.videoUrl, "name_start");
                }

                // Process each letter individually and collect the videos
                for (let j = 0; j < originalToken.length; j++) {
                    const letter = originalToken[j];

                    // Skip non-alphabetic characters
                    if (!letter.match(/[A-Za-z]/)) continue;

                    const letterSign = getSignVideoWithArraySupport(letter.toLowerCase());

                    if (letterSign && letterSign.videoUrl) {
                        const letterSignObj = {
                            word: letter,
                            videoUrl: letterSign.videoUrl,
                            notFound: false,
                            index: i,
                            isNameLetter: true,
                            letterPosition: j,
                            nameLength: originalToken.length
                        };
                        signs.push(letterSignObj);
                        nameLetterVideos.push(letterSign.videoUrl);
                        prefetchVideo(letterSign.videoUrl, letter.toLowerCase());
                    } else {
                        signs.push({
                            word: letter,
                            notFound: true,
                            index: i,
                            isNameLetter: true,
                            letterPosition: j,
                            nameLength: originalToken.length
                        });
                        allLettersFound = false;
                        missingWords.push(letter);
                    }
                }

                // Add all letter videos to the playlist in sequence
                playlist.push(...nameLetterVideos);

                // Add a special "name end" indicator if available
                const nameEndSign = getSignVideoWithArraySupport("name_end");
                if (nameEndSign && nameEndSign.videoUrl) {
                    signs.push({
                        word: "🔤", // Using emoji to indicate finger spelling is complete
                        videoUrl: nameEndSign.videoUrl,
                        notFound: false,
                        index: i,
                        isNameIndicator: true
                    });
                    playlist.push(nameEndSign.videoUrl);
                    prefetchVideo(nameEndSign.videoUrl, "name_end");
                }

                // If any letters were missing, add the whole name to missing words
                if (!allLettersFound) {
                    missingWords.push(originalToken);
                }
            } else {
                // Regular word with no sign
                signs.push({
                    word: originalToken,
                    notFound: true,
                    index: i
                });
                missingWords.push(originalToken);
            }
        }

        // Update state with signs and playlist
        setTranslatedSigns(signs);
        setNotFoundWords(missingWords.filter(word => !skipped.includes(word)));
        setSkippedWords(skipped);

        // Set up video playback
        if (playlist.length > 0) {
            setCurrentPlaylist(playlist);
            setCurrentVideoIndex(0);

            // Ensure all videos in the playlist are valid (pre-validation)
            const validPlaylist = playlist.filter(url => url && typeof url === 'string' && url.startsWith('http'));
            if (validPlaylist.length > 0) {
                // Initiate background pre-loading of all videos to improve playback speed
                validPlaylist.forEach((url, index) => {
                    // Stagger loading to not overwhelm network
                    setTimeout(() => {
                        fetch(url, { method: 'HEAD' })
                            .then(() => {
                                setLoadingProgress(prev => {
                                    const newProgress = Math.min(100, prev + (100 / validPlaylist.length));
                                    if (newProgress >= 95) {
                                        // Once we've loaded enough, mark playlist as ready
                                        if (!playlistReady) {
                                            setPlaylistReady(true);
                                        }
                                    }
                                    return newProgress;
                                });
                            })
                            .catch(error => {
                                console.error(`Error checking video ${url}:`, error);
                            });
                    }, index * 50); // Stagger by 50ms per video
                });

                // Set a timeout to ensure we show something even if network is slow
                setTimeout(() => {
                    if (!playlistReady) {
                        setPlaylistReady(true);
                    }
                }, 1500); // Show after 1.5 seconds max wait
            } else {
                Alert.alert(
                    "Video Error",
                    "No valid sign language videos could be found for this translation."
                );
            }
        } else if (missingWords.length > 0) {
            Alert.alert(
                "No Signs Available",
                `We don't have sign language videos for the ${missingWords.length > 1 ? 'words' : 'word'}: ${missingWords.join(', ')}`
            );
        }

        setIsTranslating(false);

        // Scroll to bottom
        setTimeout(() => {
            scrollToBottom();
        }, 500);
    };

    // Enhanced video playback status update
    const handleVideoStatusUpdate = (status) => {
        if (status.didJustFinish && isPlaying) {
            // Move to the next video in the playlist
            const nextIndex = currentVideoIndex + 1;
            if (nextIndex < currentPlaylist.length) {
                //console.log(`Video finished. Moving to next video at index ${nextIndex}`);
                setCurrentVideoIndex(nextIndex);
            } else {
                // End of playlist
                //console.log('End of playlist reached');
                setIsPlaying(false);
            }
        }
    };

    // Enhanced video error handling
    const handleVideoError = (error) => {
        console.error('Video playback error:', error);
        setVideoError(true);

        // Extract the URL from the error if possible
        let errorUrl = '';
        try {
            if (error && error.error && error.error.uri) {
                errorUrl = error.error.uri;

                // Record this failed URL to avoid trying it again
                if (recordFailedVideoUrl) {
                    recordFailedVideoUrl(errorUrl);
                }
            }
        } catch (e) {
            console.error('Error extracting URL from error object:', e);
        }

        // Check if the error is a 404 (not found)
        const is404 = error && error.error && error.error.status === 404;

        if (is404) {
            // For 404 errors, just move to the next video
            if (currentVideoIndex < currentPlaylist.length - 1) {
                setTimeout(() => {
                    setCurrentVideoIndex(prevIndex => prevIndex + 1);
                }, 200); // Reduced delay for faster recovery
            } else {
                // No more videos to play
                Alert.alert(
                    "Video Not Found",
                    "The sign language video for this word isn't available in our database yet."
                );
            }
        } else {
            // For other errors, try to recover
            if (retryCounter.current < 2) {
                // Try to reload the current video up to 2 times
                retryCounter.current++;
                setTimeout(() => {
                    console.log(`Retrying video load attempt ${retryCounter.current}/2`);

                    // Try to reload the current video
                    if (videoRef.current && playlistReady && currentPlaylist.length > 0) {
                        videoRef.current.loadAsync(
                            { uri: currentPlaylist[currentVideoIndex] },
                            { shouldPlay: isPlaying, rate: playbackRate }
                        ).catch(err => {
                            console.error('Retry failed:', err);
                            // If retry fails, move to the next video
                            if (currentVideoIndex < currentPlaylist.length - 1) {
                                setCurrentVideoIndex(prevIndex => prevIndex + 1);
                            }
                        });
                    }
                }, 400); // Reduced delay for faster recovery
            } else {
                // If we've exhausted retries, move to the next video
                if (currentVideoIndex < currentPlaylist.length - 1) {
                    setTimeout(() => {
                        retryCounter.current = 0; // Reset retry counter for next video
                        setCurrentVideoIndex(prevIndex => prevIndex + 1);
                    }, 200); // Reduced delay for faster recovery
                } else {
                    // No more videos to play and retries exhausted
                    Alert.alert(
                        "Video Error",
                        "Unable to load the sign language videos. Please check your internet connection and try again."
                    );
                }
            }
        }
    };

    // Focus the input field
    const focusInput = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Start playback of the current video
    const startPlayback = async () => {
        if (videoRef.current && playlistReady) {
            setIsPlaying(true);
            try {
                await videoRef.current.playAsync();
                // Set the playback rate to faster speed
                await videoRef.current.setRateAsync(playbackRate, true);
            } catch (error) {
                console.error('Error starting playback:', error);
                handleVideoError(error);
            }
        }
    };

    // Stop playback
    const stopPlayback = async () => {
        if (videoRef.current) {
            setIsPlaying(false);
            try {
                await videoRef.current.pauseAsync();
            } catch (error) {
                console.error('Error stopping playback:', error);
            }
        }
    };

    // Reset playback to beginning
    const resetPlayback = async () => {
        setCurrentVideoIndex(0);
        retryCounter.current = 0; // Reset retry counter

        if (videoRef.current) {
            try {
                // First pause and unload any current video
                await videoRef.current.pauseAsync();
                await videoRef.current.unloadAsync();

                // Small delay to ensure clean unload
                await new Promise(resolve => setTimeout(resolve, 100));

                // Then load the first video
                if (currentPlaylist.length > 0) {
                    await videoRef.current.loadAsync(
                        { uri: currentPlaylist[0] },
                        { shouldPlay: true, rate: playbackRate }
                    );
                    setIsPlaying(true);
                }
            } catch (error) {
                console.error('Error resetting playback:', error);
                handleVideoError(error);
            }
        }
    };

    // Enhanced function to get the currently playing word
    const getCurrentWord = () => {
        if (!playlistReady || currentPlaylist.length === 0 || currentVideoIndex >= currentPlaylist.length) return "";

        // Get the URL of the currently playing video
        const currentUrl = currentPlaylist[currentVideoIndex];

        // Find the sign object that has this URL
        const sign = translatedSigns.find(sign => !sign.notFound && sign.videoUrl === currentUrl);

        // If this is a letter from a name
        if (sign && sign.isNameLetter) {
            // Find all the letters for this name (all signs with the same index)
            const lettersWithSameIndex = translatedSigns.filter(
                s => s.isNameLetter && s.index === sign.index
            );

            // If there are multiple letters for this name
            if (lettersWithSameIndex.length > 1) {
                const fullName = lettersWithSameIndex.map(l => l.word).join('');

                // Show which letter of the name we're on
                return `${sign.word} (${sign.letterPosition + 1}/${sign.nameLength} of "${fullName}")`;
            }

            return sign.word;
        }

        // If this is a single letter (not part of a name)
        if (sign && sign.isLetter) {
            return sign.word;
        }

        // If this is a name indicator
        if (sign && sign.isNameIndicator) {
            return sign.word === "🔤" ? "Name Indicator" : "End of Name";
        }

        // Regular word
        return sign ? sign.word : "";
    };

    // Helper function to check if we're currently in a name spelling sequence
    const isInNameSpellingSequence = () => {
        if (!playlistReady || translatedSigns.length === 0) return false;

        // Get the URL of the currently playing video
        const currentUrl = currentPlaylist[currentVideoIndex];

        // Find the sign object that has this URL
        const currentSign = translatedSigns.find(sign => !sign.notFound && sign.videoUrl === currentUrl);

        return currentSign && (currentSign.isNameLetter || currentSign.isNameIndicator);
    };

    // Optimized video loading with better error handling and caching
    React.useEffect(() => {
        const loadCurrentVideo = async () => {
            // Prevent multiple concurrent loading attempts
            if (isLoadingVideo.current) return;

            // Only proceed if we have a valid video reference and playlist
            if (videoRef.current && playlistReady && currentPlaylist.length > 0 && currentVideoIndex < currentPlaylist.length) {
                isLoadingVideo.current = true;

                try {
                    // Get and validate the current video URL
                    const videoUrl = currentPlaylist[currentVideoIndex];
                    //console.log(`Loading video at index ${currentVideoIndex}: ${videoUrl}`);

                    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.startsWith('http')) {
                        console.error(`Invalid video URL at index ${currentVideoIndex}:`, videoUrl);
                        setVideoError(true);

                        // Skip to next video if available
                        if (currentVideoIndex < currentPlaylist.length - 1) {
                            setCurrentVideoIndex(currentIndex => currentIndex + 1);
                        }
                        isLoadingVideo.current = false;
                        return;
                    }

                    // Reset error state
                    setVideoError(false);

                    // Unload any previous video completely
                    await videoRef.current.unloadAsync();

                    // Small delay to ensure clean slate for next video
                    await new Promise(resolve => setTimeout(resolve, 50)); // Reduced from 100ms to 50ms

                    // Use headers to improve caching and avoid network issues
                    const headers = {
                        'Cache-Control': 'max-age=3600',
                        'Pragma': 'no-cache'
                    };

                    // Load the new video with increased playback rate
                    await videoRef.current.loadAsync(
                        { uri: videoUrl, headers },
                        { shouldPlay: false, rate: playbackRate, progressUpdateIntervalMillis: 50 }
                    );

                    //console.log(`Successfully loaded video: ${videoUrl}`);

                    // Start playing after successful load
                    if (isPlaying) {
                        await videoRef.current.playAsync();
                        await videoRef.current.setRateAsync(playbackRate, true);
                    } else {
                        // If this is the first video, start playing automatically
                        if (currentVideoIndex === 0) {
                            setIsPlaying(true);
                            await videoRef.current.playAsync();
                            await videoRef.current.setRateAsync(playbackRate, true);
                        }
                    }

                    isLoadingVideo.current = false;
                } catch (error) {
                    console.error('Error loading video:', error);
                    setVideoError(true);
                    isLoadingVideo.current = false;

                    // Try to recover
                    handleVideoError(error);
                }
            } else {
                isLoadingVideo.current = false;
            }
        };

        loadCurrentVideo();
    }, [currentVideoIndex, playlistReady, currentPlaylist]);

    // Add auto-play when playlist becomes ready
    useEffect(() => {
        if (playlistReady && currentPlaylist.length > 0 && !isPlaying) {
            // Start playing automatically when playlist becomes ready
            setTimeout(() => {
                setIsPlaying(true);
            }, 300); // Reduced from 500ms to 300ms for faster startup
        }
    }, [playlistReady, currentPlaylist]);

    // Translate a recent item
    const translateRecent = (text, sinhalaScript, tamilScript, translated, language) => {
        setInputText(text);
        setLanguageMode(language || 'sinhala');

        if (language === 'sinhala') {
            setSinhalaScript(sinhalaScript || '');
            setTamilScript('');
        } else if (language === 'tamil') {
            setTamilScript(tamilScript || '');
            setSinhalaScript('');
        } else {
            setSinhalaScript('');
            setTamilScript('');
        }

        // If we already have the translation, use it directly
        if (translated && language !== 'english') {
            setTranslatedText(translated);
            setTimeout(() => {
                handleTranslate();
            }, 100);
        } else {
            // Otherwise, just translate normally
            setTimeout(() => {
                handleTranslate();
            }, 100);
        }
    };

    // Toggle language mode between Sinhala, Tamil, and English
    const toggleLanguageMode = () => {
        setLanguageMode(prevMode => {
            if (prevMode === 'sinhala') return 'tamil';
            if (prevMode === 'tamil') return 'english';
            return 'sinhala';
        });

        // Reset state
        setInputText('');
        setSinhalaScript('');
        setTamilScript('');
        setTranslatedText('');
        setTranslatedSigns([]);
        setPlaylistReady(false);
        setCurrentConversation(null);
        setIsSaved(false);
        setNotFoundWords([]);
        setSkippedWords([]);
        setOriginalInputTokens([]);
        setHasSpacedLetterInput(false);
        setLoadingProgress(0);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#D0F3DA" />
                    <Text>Loading sign language data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#D0F3DA" barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => {
                        // This will scroll to bottom when content changes
                        if (translatedSigns.length > 0) {
                            scrollToBottom();
                        }
                    }}

                    //refresh 
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#155658']}
                            tintColor={'#155658'}
                        />
                    }
                >
                    <Common />
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Text to Sign Language</Text>
                        <TouchableOpacity
                            style={styles.languageToggle}
                            onPress={toggleLanguageMode}
                        >
                            <Text style={styles.languageToggleText}>
                                {languageMode === 'sinhala'
                                    ? 'Sinhala → English'
                                    : languageMode === 'tamil'
                                        ? 'Tamil → English'
                                        : 'English'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.inputRow}>
                            <TouchableOpacity
                                style={styles.textInputWrap}
                                activeOpacity={0.8}
                                onPress={focusInput}
                            >
                                <TextInput
                                    ref={inputRef}
                                    style={[styles.textInput, isRecording && styles.textInputRecording]}
                                    placeholder={
                                        languageMode === 'sinhala'
                                            ? "Type Sinhala words using English letters..."
                                            : languageMode === 'tamil'
                                                ? "Type Tamil words using English letters..."
                                                : "Enter English text to translate..."
                                    }
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    blurOnSubmit={true}
                                    onSubmitEditing={handleTranslate}
                                    enablesReturnKeyAutomatically={true}
                                    keyboardType="default"
                                    autoCapitalize="none"
                                    disableFullscreenUI={true}
                                    editable={!isRecording}
                                />
                            </TouchableOpacity>

                            {/* Voice recording button */}
                            {renderRecordingControls()}
                        </View>

                        {/* Display Sinhala script as user types */}
                        {languageMode === 'sinhala' && sinhalaScript && (
                            <View style={styles.sinhalaScriptContainer}>
                                <Text style={styles.sinhalaScriptLabel}>Sinhala:</Text>
                                <Text style={styles.sinhalaScriptText}>{sinhalaScript}</Text>
                            </View>
                        )}

                        {/* Display Tamil script as user types */}
                        {languageMode === 'tamil' && tamilScript && (
                            <View style={styles.tamilScriptContainer}>
                                <Text style={styles.tamilScriptLabel}>Tamil:</Text>
                                <Text style={styles.tamilScriptText}>{tamilScript}</Text>
                            </View>
                        )}

                        {(languageMode === 'sinhala' || languageMode === 'tamil') && translatedText && (
                            <View style={styles.translatedTextContainer}>
                                <Text style={styles.translatedTextLabel}>English Translation:</Text>
                                <Text style={styles.translatedTextContent}>{translatedText}</Text>
                            </View>
                        )}

                        <Button text={isTranslating || isTransliterating ? 'Translating...' : 'Translate'}
                            type="fill"
                            onPress={handleTranslate}
                            disabled={isTranslating || !inputText.trim() || isRecording} />
                    </View>

                    {(isTranslating || isTransliterating) ? (
                        <ActivityIndicator size="large" color="#4C9EFF" />
                    ) : translatedSigns.length > 0 ? (
                        <View style={styles.resultsContainer}>
                            <Text style={styles.resultsTitle}>Translation Results:</Text>

                            {/* Loading progress indicator */}
                            {!playlistReady && loadingProgress > 0 && (
                                <View style={styles.loadingProgressContainer}>
                                    <Text style={styles.loadingText}>Loading videos: {Math.round(loadingProgress)}%</Text>
                                    <View style={styles.progressBarContainer}>
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                { width: `${loadingProgress}%` }
                                            ]}
                                        />
                                    </View>
                                </View>
                            )}

                            {/* Word chips to show the translated words */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.wordChipsContainer}
                            >
                                {translatedSigns
                                    .filter(sign => !sign.isCommonWord) // Filter out common words in display
                                    .map((sign, index) => {
                                        // For name letters, group them differently
                                        if (sign.isNameLetter) {
                                            // For the first letter of a name, add a special container
                                            if (sign.letterPosition === 0) {
                                                return (
                                                    <View key={`word-${index}`} style={styles.nameLettersContainer}>
                                                        {/* Get all consecutive letters for this name */}
                                                        {translatedSigns
                                                            .slice(index, index + sign.nameLength)
                                                            .filter(s => s.isNameLetter)
                                                            .map((letterSign, letterIndex) => (
                                                                <View
                                                                    key={`letter-${letterIndex}`}
                                                                    style={[
                                                                        styles.letterChip,
                                                                        letterSign.notFound ? styles.wordChipNotFound : {},
                                                                        currentPlaylist[currentVideoIndex] === letterSign.videoUrl && isPlaying
                                                                            ? styles.wordChipActive
                                                                            : {}
                                                                    ]}
                                                                >
                                                                    <Text
                                                                        style={[
                                                                            styles.letterChipText,
                                                                            letterSign.notFound ? styles.wordChipTextNotFound : {},
                                                                            currentPlaylist[currentVideoIndex] === letterSign.videoUrl && isPlaying
                                                                                ? styles.wordChipTextActive
                                                                                : {}
                                                                        ]}
                                                                    >
                                                                        {letterSign.word}
                                                                    </Text>
                                                                    {letterSign.notFound && (
                                                                        <MaterialIcons
                                                                            name="videocam-off"
                                                                            size={8}
                                                                            color="#D32F2F"
                                                                            style={styles.missingVideoIcon}
                                                                        />
                                                                    )}
                                                                </View>
                                                            ))}
                                                    </View>
                                                );
                                            } else if (sign.letterPosition > 0) {
                                                // Skip letters after the first one as they're handled in the first letter's render
                                                return null;
                                            }
                                        }

                                        // If this is a single letter (not part of a name)
                                        if (sign.isLetter) {
                                            return (
                                                <View
                                                    key={`word-${index}`}
                                                    style={[
                                                        styles.letterChip,
                                                        sign.notFound ? styles.wordChipNotFound : {},
                                                        currentPlaylist[currentVideoIndex] === sign.videoUrl && isPlaying
                                                            ? styles.wordChipActive
                                                            : {}
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.letterChipText,
                                                            sign.notFound ? styles.wordChipTextNotFound : {},
                                                            currentPlaylist[currentVideoIndex] === sign.videoUrl && isPlaying
                                                                ? styles.wordChipTextActive
                                                                : {}
                                                        ]}
                                                    >
                                                        {sign.word}
                                                    </Text>
                                                    {sign.notFound && (
                                                        <MaterialIcons
                                                            name="videocam-off"
                                                            size={8}
                                                            color="#D32F2F"
                                                            style={styles.missingVideoIcon}
                                                        />
                                                    )}
                                                </View>
                                            );
                                        }

                                        // For name indicator emojis, use a special style
                                        if (sign.isNameIndicator) {
                                            return (
                                                <View
                                                    key={`word-${index}`}
                                                    style={[
                                                        styles.nameIndicatorChip,
                                                        currentPlaylist[currentVideoIndex] === sign.videoUrl && isPlaying
                                                            ? styles.wordChipActive
                                                            : {}
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.nameIndicatorText,
                                                            currentPlaylist[currentVideoIndex] === sign.videoUrl && isPlaying
                                                                ? styles.wordChipTextActive
                                                                : {}
                                                        ]}
                                                    >
                                                        {sign.word}
                                                    </Text>
                                                </View>
                                            );
                                        }

                                        // Regular words (non-name)
                                        return (
                                            <View
                                                key={`word-${index}`}
                                                style={[
                                                    styles.wordChip,
                                                    sign.notFound ? styles.wordChipNotFound : {},
                                                    currentPlaylist[currentVideoIndex] === sign.videoUrl && isPlaying
                                                        ? styles.wordChipActive
                                                        : {}
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.wordChipText,
                                                        sign.notFound ? styles.wordChipTextNotFound : {},
                                                        currentPlaylist[currentVideoIndex] === sign.videoUrl && isPlaying
                                                            ? styles.wordChipTextActive
                                                            : {}
                                                    ]}
                                                >
                                                    {sign.word}
                                                </Text>
                                                {sign.notFound && !sign.isCommonWord && (
                                                    <MaterialIcons
                                                        name="videocam-off"
                                                        size={12}
                                                        color="#D32F2F"
                                                        style={styles.missingVideoIcon}
                                                    />
                                                )}
                                            </View>
                                        );
                                    })}
                            </ScrollView>

                            {/* Save Conversation Button */}
                            {currentConversation && !isSaved && (
                                <Button text="Save Conversation"
                                    type="outline"
                                    onPress={saveConversation} />
                            )}

                            {isSaved && (
                                <Text style={styles.savedMessage}>Conversation saved!</Text>
                            )}

                            {playlistReady && currentPlaylist.length > 0 ? (
                                <View style={styles.videoPlayerContainer}>
                                    {/* Now Playing section */}
                                    <Text style={styles.nowPlayingText}>
                                        Now signing:
                                    </Text>

                                    {/* Enhanced display for current word/letter */}
                                    {(() => {
                                        // Get the current video URL
                                        const currentUrl = currentPlaylist[currentVideoIndex];
                                        // Find the sign that matches this URL
                                        const sign = translatedSigns.find(
                                            sign => !sign.notFound && sign.videoUrl === currentUrl
                                        );

                                        if (sign && sign.isNameLetter) {
                                            // This is a letter in a name, show specialized display
                                            const lettersWithSameIndex = translatedSigns.filter(
                                                s => s.isNameLetter && s.index === sign.index
                                            );
                                            const fullName = lettersWithSameIndex.map(l => l.word).join('');

                                            return (
                                                <View style={styles.currentNameContainer}>
                                                    <Text style={styles.currentWordText}>
                                                        Finger spelling: <Text style={{ fontWeight: '900' }}>{sign.word}</Text>
                                                    </Text>
                                                    <Text style={styles.letterCountText}>
                                                        Letter {sign.letterPosition + 1} of {sign.nameLength} in "{fullName}"
                                                    </Text>
                                                </View>
                                            );
                                        } else if (sign && sign.isLetter) {
                                            // This is a single letter (not part of a name)
                                            return (
                                                <Text style={styles.currentWordText}>
                                                    Letter: <Text style={{ fontWeight: '900' }}>{sign.word}</Text>
                                                </Text>
                                            );
                                        } else if (sign && sign.isNameIndicator) {
                                            // This is a name indicator
                                            return (
                                                <Text style={styles.currentWordText}>
                                                    {sign.word === "🔤" ? "Beginning name" : "End of name"}
                                                </Text>
                                            );
                                        } else {
                                            // Regular word
                                            return (
                                                <Text style={styles.currentWordText}>
                                                    {getCurrentWord()}
                                                </Text>
                                            );
                                        }
                                    })()}

                                    <Text style={{ color: '#666', marginTop: 4 }}>
                                        {currentVideoIndex + 1}/{currentPlaylist.length}
                                    </Text>

                                    {videoError ? (
                                        <View style={styles.videoErrorContainer}>
                                            <MaterialIcons name="error-outline" size={48} color="#D32F2F" />
                                            <Text style={styles.videoErrorText}>
                                                Unable to load video. The video file may be missing or corrupted.
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.retryButton}
                                                onPress={() => {
                                                    setVideoError(false);
                                                    retryCounter.current = 0;
                                                    // Try to reload the current video
                                                    if (videoRef.current && playlistReady && currentPlaylist.length > 0) {
                                                        videoRef.current.loadAsync(
                                                            { uri: currentPlaylist[currentVideoIndex] },
                                                            { shouldPlay: true }
                                                        ).catch(err => {
                                                            console.error('Retry failed:', err);
                                                            handleVideoError(err);
                                                        });
                                                    }
                                                }}
                                            >
                                                <Text style={styles.retryButtonText}>Retry</Text>
                                            </TouchableOpacity>

                                            {currentVideoIndex < currentPlaylist.length - 1 && (
                                                <TouchableOpacity
                                                    style={[styles.retryButton, { backgroundColor: '#4CAF50', marginTop: 8 }]}
                                                    onPress={() => {
                                                        retryCounter.current = 0;
                                                        setCurrentVideoIndex(prevIndex => prevIndex + 1);
                                                    }}
                                                >
                                                    <Text style={styles.retryButtonText}>Next Word</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ) : (
                                        <Video
                                            ref={videoRef}
                                            style={styles.videoPlayer}
                                            resizeMode="contain"
                                            useNativeControls={false}
                                            isLooping={false}
                                            shouldPlay={isPlaying}
                                            rate={playbackRate} // Set playback speed
                                            onPlaybackStatusUpdate={handleVideoStatusUpdate}
                                            onError={handleVideoError}
                                            // Use a source prop with a key to force refresh when URL changes
                                            source={currentPlaylist[currentVideoIndex] ? {
                                                uri: currentPlaylist[currentVideoIndex],
                                                // Add a timestamp to prevent caching issues
                                                headers: { 'Cache-Control': 'max-age=3600' }
                                            } : undefined}
                                        />
                                    )}

                                    <View style={styles.videoControls}>
                                        {isPlaying ? (
                                            <TouchableOpacity style={styles.controlButton} onPress={stopPlayback}>
                                                <Text style={styles.controlButtonText}>Pause</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity style={styles.controlButton} onPress={startPlayback}>
                                                <Text style={styles.controlButtonText}>Play</Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity style={styles.controlButton} onPress={resetPlayback}>
                                            <Text style={styles.controlButtonText}>Restart</Text>
                                        </TouchableOpacity>

                                        {currentVideoIndex < currentPlaylist.length - 1 && !videoError && (
                                            <TouchableOpacity
                                                style={[styles.controlButton, { backgroundColor: '#4CAF50' }]}
                                                onPress={() => {
                                                    retryCounter.current = 0;
                                                    setCurrentVideoIndex(currentIndex => currentIndex + 1);
                                                }}
                                            >
                                                <Text style={styles.controlButtonText}>Next</Text>
                                            </TouchableOpacity>
                                        )}

                                        {/* Display the current playback speed */}
                                        <View style={styles.speedIndicator}>
                                            <Text style={styles.speedIndicatorText}>{playbackRate}x</Text>
                                        </View>
                                    </View>

                                    {/* Video progress indicator */}
                                    <View style={styles.progressContainer}>
                                        <View
                                            style={[
                                                styles.progressBar,
                                                { width: `${(currentVideoIndex / Math.max(currentPlaylist.length - 1, 1)) * 100}%` }
                                            ]}
                                        />
                                    </View>
                                </View>
                            ) : translatedSigns.some(sign => sign.notFound && !sign.isCommonWord) &&
                                translatedSigns.filter(sign => !sign.notFound).length === 0 ? (
                                <View style={styles.missingVideoBanner}>
                                    <MaterialIcons name="info-outline" size={24} color="#D32F2F" />
                                    <Text style={styles.missingVideoText}>
                                        No sign language videos are available for the words in this translation.
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    ) : null}

                    <View style={styles.recentContainer}>
                        <Text style={styles.recentTitle}>Recent Translations</Text>
                        {recentTranslations.length > 0 && (
                            <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
                                <Text style={styles.clearButtonText}>Clear History</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Recent Translations List */}
                    {recentTranslations.length > 0 && (
                        <View style={styles.recentList}>
                            {recentTranslations.map((item, index) => (
                                <View key={index} style={styles.recentItemRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.recentItem,
                                            {
                                                borderLeftColor:
                                                    item.language === 'sinhala' ? '#4C9EFF' :
                                                        item.language === 'tamil' ? '#9C27B0' :
                                                            '#FF9800'  // English
                                            }
                                        ]}
                                        onPress={() => translateRecent(
                                            item.text,
                                            item.sinhalaScript,
                                            item.tamilScript,
                                            item.translated,
                                            item.language
                                        )}
                                    >
                                        <View style={styles.recentItemContent}>
                                            {item.language === 'sinhala' && item.sinhalaScript ? (
                                                <>
                                                    <Text style={styles.recentItemScript}>{item.sinhalaScript}</Text>
                                                    <Text style={styles.recentItemText} numberOfLines={1}>({item.text})</Text>
                                                </>
                                            ) : item.language === 'tamil' && item.tamilScript ? (
                                                <>
                                                    <Text style={styles.recentItemScript}>{item.tamilScript}</Text>
                                                    <Text style={styles.recentItemText} numberOfLines={1}>({item.text})</Text>
                                                </>
                                            ) : (
                                                <Text style={styles.recentItemText} numberOfLines={1}>{item.text}</Text>
                                            )}
                                            {(item.language === 'sinhala' || item.language === 'tamil') && item.translated && (
                                                <Text style={styles.recentItemTranslated} numberOfLines={1}>
                                                    → {item.translated}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={[
                                            styles.languageIndicator,
                                            {
                                                backgroundColor:
                                                    item.language === 'sinhala' ? '#4C9EFF' :
                                                        item.language === 'tamil' ? '#9C27B0' :
                                                            '#FF9800'  // English
                                            }
                                        ]}>
                                            <Text style={styles.languageIndicatorText}>
                                                {item.language === 'sinhala' ? 'SI' :
                                                    item.language === 'tamil' ? 'TA' :
                                                        'EN'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Delete button */}
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => deleteConversation(index)}
                                    >
                                        <MaterialIcons name="delete-outline" size={22} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Extra space at bottom to avoid navigation bar */}
                    <View style={[styles.bottomSpacer, { height: bottomPadding }]} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Undo delete toast */}
            {showUndoToast && (
                <View style={styles.undoToast}>
                    <Text style={styles.undoToastText}>Conversation deleted</Text>
                    <TouchableOpacity onPress={undoDelete}>
                        <Text style={styles.undoButton}>UNDO</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );


}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#D0F3DA',
        //backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
        color: '#333',
        marginTop: -20
    },
    languageToggle: {
        backgroundColor: '#F7B316',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: -20
    },
    languageToggleText: {
        color: '#fff',
        fontWeight: '500',
    },
    inputContainer: {
        marginTop: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInputWrap: {
        flex: 1,
        borderRadius: 8,
        marginRight: 10,
    },
    textInput: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    textInputRecording: {
        borderColor: '#FF3B30',
        borderWidth: 2,
    },
    // Voice recording styles
    micButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#155658',
        alignSelf: 'flex-start',
    },
    micPermissionButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D32F2F',
        alignSelf: 'flex-start',
    },
    micPermissionText: {
        fontSize: 10,
        color: '#D32F2F',
        textAlign: 'center',
        marginTop: 4,
    },
    recordingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFEBEE',
        borderRadius: 25,
        paddingHorizontal: 12,
        paddingVertical: 6,
        width: 130,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recordingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF3B30',
        marginRight: 8,
    },
    recordingTime: {
        fontSize: 14,
        color: '#333',
    },
    stopRecordingButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: 170,
    },
    recordingStatusText: {
        color: '#1976D2',
        marginLeft: 8,
        fontSize: 14,
    },
    // Sinhala script display
    sinhalaScriptContainer: {
        backgroundColor: '#155658',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#155658',
    },
    sinhalaScriptLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    sinhalaScriptText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    // Tamil script display styles
    tamilScriptContainer: {
        backgroundColor: '#155658',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#155658',
    },
    tamilScriptLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    tamilScriptText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    translatedTextContainer: {
        backgroundColor: '#155658',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    translatedTextLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    translatedTextContent: {
        color: '#fff',
        fontSize: 16,
    },
    translateButton: {
        backgroundColor: '#4C9EFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resultsContainer: {
        flex: 1,
        marginTop: 12,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    // Save conversation button
    saveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginVertical: 10,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    savedMessage: {
        color: '#155658',
        textAlign: 'center',
        fontWeight: '500',
        marginVertical: 8,
        marginTop: 5,
        fontSize: 14
    },
    wordChipsContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    wordChip: {
        backgroundColor: '#155658',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#155658',
    },
    wordChipNotFound: {
        backgroundColor: '#FFEBEE',
        borderColor: '#FFCDD2',
    },
    wordChipActive: {
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
    },
    wordChipText: {
        fontSize: 14,
        color: '#fff',
    },
    wordChipTextNotFound: {
        color: '#D32F2F',
    },
    wordChipTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },

    // Skipped words styles (common words without sign videos)
    skippedWordChip: {
        backgroundColor: '#FFF3E0',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#FFE0B2',
        opacity: 0.7,
    },
    skippedWordChipText: {
        fontSize: 14,
        color: '#E65100',
        fontStyle: 'italic',
    },
    skippedWordsBanner: {
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    skippedWordsText: {
        color: '#E65100',
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
    },

    // Name letters container
    nameLettersContainer: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#90CAF9',
    },

    // Individual letter chips
    letterChip: {
        backgroundColor: '#155658',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 6,
        margin: 2,
        borderWidth: 1,
        borderColor: '#155658',
    },

    letterChipText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },

    // Name indicator styles (for start/end of finger spelling)
    nameIndicatorChip: {
        backgroundColor: '#FFD54F',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#FFCA28',
    },

    nameIndicatorText: {
        fontSize: 14,
        color: '#5D4037',
        fontWeight: 'bold',
    },

    // Loading progress bar
    loadingProgressContainer: {
        marginBottom: 15,
    },
    loadingText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },

    // Current word display indicators
    currentNameContainer: {
        backgroundColor: '#E8F5E9',
        padding: 8,
        borderRadius: 4,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#A5D6A7',
    },

    currentNameText: {
        color: '#2E7D32',
        fontWeight: 'bold',
        fontSize: 14,
    },

    letterCountText: {
        color: '#2E7D32',
        fontSize: 12,
        marginTop: 2,
    },

    videoPlayerContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginTop: 10
    },
    nowPlayingText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    currentWordText: {
        fontWeight: 'bold',
        color: '#4C9EFF',
        fontSize: 16,
    },
    videoPlayer: {
        width: '100%',
        height: 250,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
    },
    videoControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    controlButton: {
        backgroundColor: '#4C9EFF',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        alignItems: 'center',
    },
    controlButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    speedIndicator: {
        backgroundColor: '#155658',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedIndicatorText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4C9EFF',
        borderRadius: 2,
    },
    noVideoText: {
        textAlign: 'center',
        margin: 20,
        color: '#D32F2F',
        fontSize: 16,
    },
    translatedWordsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 8,
    },
    signCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    notFoundCard: {
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    signWord: {
        fontSize: 16,
        fontWeight: '500',
    },
    notFoundText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#D32F2F',
    },
    notFoundSubtext: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
    },
    noResults: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    recentContainer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearButton: {
        padding: 8,
    },
    clearButtonText: {
        color: '#4C9EFF',
        fontWeight: '500',
    },
    recentList: {
        maxHeight: 150,
        marginBottom: 8,
    },
    // Updated styles for recent items with delete button
    recentItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    recentItem: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 6,
        borderLeftWidth: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recentItemContent: {
        flex: 1,
        paddingRight: 8,
    },
    recentItemScript: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    recentItemText: {
        fontSize: 14,
        color: '#666',
    },
    recentItemTranslated: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    languageIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    languageIndicatorText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Undo toast styles
    undoToast: {
        position: 'absolute',
        bottom: 70,
        left: 20,
        right: 20,
        backgroundColor: '#333333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    undoToastText: {
        color: 'white',
        fontSize: 14,
    },
    undoButton: {
        color: '#4C9EFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    bottomSpacer: {
        height: 80, // Increased to ensure content is above navigation bar
    },
    // Video error styles
    videoErrorContainer: {
        width: '100%',
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        borderRadius: 4,
        padding: 16,
    },
    videoErrorText: {
        color: '#D32F2F',
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#4C9EFF',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Missing video banner
    missingVideoBanner: {
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    missingVideoText: {
        color: '#D32F2F',
        marginLeft: 8,
        flex: 1,
    },
    // Missing video icon for chips
    missingVideoIcon: {
        marginLeft: 4,
    }
})
