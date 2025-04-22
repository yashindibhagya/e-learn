import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    useWindowDimensions,
} from 'react-native';
import { Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function SignView() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const { sign, category, index } = useLocalSearchParams();
    const videoRef = useRef(null);
    const [signData, setSignData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSpeed, setCurrentSpeed] = useState(1.0);

    useEffect(() => {
        // Parse sign data from params if available
        if (sign) {
            try {
                const signInfo = JSON.parse(sign);
                setSignData(signInfo);
            } catch (error) {
                console.error("Error parsing sign data:", error);
            }
        }
    }, [sign]);

    const handlePrevious = () => {
        // Navigate to previous sign
        router.back();
    };

    const handleNext = () => {
        // Navigate to next sign
        router.back();
    };

    const handleSpeedChange = () => {
        // Toggle speed between 0.5, 1.0, and 1.5
        const speeds = [0.5, 1.0, 1.5];
        const currentIndex = speeds.indexOf(currentSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        setCurrentSpeed(speeds[nextIndex]);

        // Apply speed to video if playing
        if (videoRef.current) {
            videoRef.current.setRateAsync(speeds[nextIndex], true);
        }
    };

    const togglePlayback = async () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            await videoRef.current.pauseAsync();
        } else {
            await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{signData?.word || category || "Alphabet"}</Text>
            </View>

            <View style={styles.videoContainer}>
                <Video
                    ref={videoRef}
                    source={{ uri: signData?.videoUrl || "https://res.cloudinary.com/dxjb5lepy/video/upload/v1742644990/a_bcg3yg.mp4" }}
                    style={styles.video}
                    useNativeControls={false}
                    resizeMode="contain"
                    isLooping
                    onPlaybackStatusUpdate={status => setIsPlaying(status.isPlaying)}
                    rate={currentSpeed}
                />

                <View style={styles.signLabel}>
                    <Text style={styles.signText}>{signData?.word || "A"}</Text>
                </View>

                <TouchableOpacity
                    style={styles.expandButton}
                    onPress={togglePlayback}
                >
                    <MaterialIcons name={isPlaying ? "pause" : "play-arrow"} size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.navigationContainer}>
                <Text style={styles.currentSignText}>Current sign</Text>
                <Text style={styles.signLetter}>{signData?.word || "A"}</Text>

                <View style={styles.navButtonsContainer}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={handlePrevious}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={handleNext}
                    >
                        <MaterialIcons name="arrow-forward" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.toolsContainer}>
                <TouchableOpacity style={styles.toolButton} onPress={handleSpeedChange}>
                    <View style={styles.toolIconContainer}>
                        <MaterialIcons name="speed" size={24} color="#666" />
                    </View>
                    <Text style={styles.toolText}>Speed</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton}>
                    <View style={styles.toolIconContainer}>
                        <MaterialIcons name="quiz" size={24} color="#666" />
                    </View>
                    <Text style={styles.toolText}>Quiz</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton}>
                    <View style={styles.toolIconContainer}>
                        <MaterialIcons name="style" size={24} color="#666" />
                    </View>
                    <Text style={styles.toolText}>Flashcards</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#fff',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    signLabel: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    signText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    expandButton: {
        position: 'absolute',
        bottom: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        borderRadius: 25,
    },
    navigationContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center',
    },
    currentSignText: {
        fontSize: 14,
        color: '#666',
    },
    signLetter: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    navButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: 8,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 16,
    },
    toolsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    toolButton: {
        alignItems: 'center',
    },
    toolIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolText: {
        fontSize: 12,
        marginTop: 4,
        color: '#666',
    },
});