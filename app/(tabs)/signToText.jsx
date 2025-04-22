import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert
} from "react-native";
import { Camera } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";
import Common from "../../Components/Container/Common";
import Button from "../../Components/Shared/Button";

/**
 * SignToText screen for translating sign language to text
 * Currently implemented as a placeholder with camera functionality
 */
export default function SignToText() {
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [translatedText, setTranslatedText] = useState("");
    const [cameraType, setCameraType] = useState(null); // Initialize as null
    const cameraRef = useRef(null);

    // Initialize camera constants after ensuring Camera is available
    useEffect(() => {
        // Safely set camera type once Camera is confirmed available
        if (Camera && Camera.Constants && Camera.Constants.Type) {
            setCameraType(Camera.Constants.Type.front);
        }
    }, []);

    // Request camera permissions
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setHasPermission(status === "granted");
            } catch (error) {
                console.error("Error requesting camera permissions:", error);
                setHasPermission(false);
            }
        })();
    }, []);

    // Function to toggle camera type (front/back)
    const toggleCameraType = () => {
        if (!Camera || !Camera.Constants || !Camera.Constants.Type) {
            return; // Exit if Camera is not available
        }

        setCameraType(
            cameraType === Camera.Constants.Type.front
                ? Camera.Constants.Type.back
                : Camera.Constants.Type.front
        );
    };

    // Start recording sign language video
    const startRecording = async () => {
        if (!cameraRef.current || isRecording) return;

        try {
            setIsRecording(true);
            const videoOptions = {
                maxDuration: 10, // 10 seconds max
                quality: "720p", // Use string value instead of constant
                mute: true,
            };

            cameraRef.current.recordAsync(videoOptions).then((recordedVideo) => {
                // Process the recorded video
                processRecordedVideo(recordedVideo.uri);
            }).catch(error => {
                console.error("Error recording video:", error);
                setIsRecording(false);
                Alert.alert("Error", "Failed to record video");
            });
        } catch (error) {
            console.error("Error starting recording:", error);
            setIsRecording(false);
            Alert.alert("Error", "Failed to start recording");
        }
    };

    // Stop the current recording
    const stopRecording = async () => {
        if (!cameraRef.current || !isRecording) return;

        try {
            cameraRef.current.stopRecording();
            setIsRecording(false);
        } catch (error) {
            console.error("Error stopping recording:", error);
            setIsRecording(false);
            Alert.alert("Error", "Failed to stop recording");
        }
    };

    // Process the recorded video to translate to text
    const processRecordedVideo = async (videoUri) => {
        setIsProcessing(true);

        try {
            // Simulating API call to translate sign language
            // In a real app, you'd upload the video to a server or use ML Kit
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock response
            setTranslatedText("Hello! This is a demonstration of sign language translation.");
        } catch (error) {
            console.error("Error processing video:", error);
            Alert.alert("Error", "Failed to process video");
        } finally {
            setIsProcessing(false);
        }
    };

    // Reset the translation
    const resetTranslation = () => {
        setTranslatedText("");
    };

    if (!Camera || !Camera.Constants || !Camera.Constants.Type) {
        return (
            <SafeAreaView style={styles.container}>
                <Common />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Camera not available</Text>
                    <Text style={styles.errorSubtext}>
                        The camera module could not be initialized. Please try restarting the app.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Handle loading state
    if (hasPermission === null) {
        return (
            <SafeAreaView style={styles.container}>
                <Common />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#F7B316" />
                    <Text style={styles.loadingText}>Requesting camera permission...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <Common />

            <Text style={styles.title}>Sign Language to Text</Text>
            <Text style={styles.subtitle}>
                Record yourself signing and get a text translation
            </Text>

            <View style={styles.cameraContainer}>
                <Camera
                    ref={cameraRef}
                    style={styles.camera}
                    type={cameraType}
                    onCameraReady={() => setCameraReady(true)}
                    ratio="16:9"
                >
                    {/* Camera overlay with controls */}
                    <View style={styles.cameraOverlay}>
                        {/* Camera type toggle button */}
                        <TouchableOpacity
                            style={styles.cameraToggleButton}
                            onPress={toggleCameraType}
                        >
                            <FontAwesome name="refresh" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </Camera>
            </View>

            {translatedText ? (
                <View style={styles.translationContainer}>
                    <Text style={styles.translationLabel}>Translation:</Text>
                    <Text style={styles.translationText}>{translatedText}</Text>
                    <Button
                        text="New Translation"
                        onPress={resetTranslation}
                        type="outline"
                    />
                </View>
            ) : (
                <View style={styles.controlsContainer}>
                    {isRecording ? (
                        <TouchableOpacity
                            style={styles.stopButton}
                            onPress={stopRecording}
                            disabled={!cameraReady || isProcessing}
                        >
                            <FontAwesome name="stop" size={24} color="#FFF" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.recordButton}
                            onPress={startRecording}
                            disabled={!cameraReady || isProcessing}
                        >
                            <FontAwesome name="circle" size={24} color="#FFF" />
                        </TouchableOpacity>
                    )}

                    {isProcessing && (
                        <View style={styles.processingContainer}>
                            <ActivityIndicator size="large" color="#F7B316" />
                            <Text style={styles.processingText}>Processing sign language...</Text>
                        </View>
                    )}

                    <Text style={styles.instructionText}>
                        {isRecording
                            ? "Recording... Tap stop when finished"
                            : "Tap the button to start recording"}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D0F3DA",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#155658",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
    },
    cameraContainer: {
        width: "100%",
        aspectRatio: 9 / 16,
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 20,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: "transparent",
        justifyContent: "flex-start",
        alignItems: "flex-end",
    },
    cameraToggleButton: {
        margin: 20,
        padding: 10,
        borderRadius: 20,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    controlsContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    recordButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#F44336",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 4,
        borderColor: "rgba(255, 255, 255, 0.5)",
    },
    stopButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#F44336",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    instructionText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: "#666",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#F44336",
        marginBottom: 10,
    },
    errorSubtext: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    processingContainer: {
        marginBottom: 20,
        alignItems: "center",
    },
    processingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    translationContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
    },
    translationLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#155658",
        marginBottom: 10,
    },
    translationText: {
        fontSize: 18,
        color: "#333",
        marginBottom: 20,
        lineHeight: 24,
    },
});