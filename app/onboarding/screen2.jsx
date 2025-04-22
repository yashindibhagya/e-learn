import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

/**
 * Second onboarding screen for new users
 * Introduces users to the Text to Sign Language feature
 */
export default function OnboardingScreen2() {
    const router = useRouter();

    // Skip the rest of the onboarding
    const handleSkip = async () => {
        try {
            // Mark user as not new anymore - onboarding completed
            await AsyncStorage.setItem("onboardingComplete", "true");

            // Navigate to home tab
            router.replace("/(tabs)/home");
        } catch (error) {
            console.error("Error updating user status:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

    // Navigate to the next onboarding screen
    const handleNext = () => {
        // Use replace for consistency
        router.replace("/onboarding/screen3");
    };

    // Navigate to the previous onboarding screen
    const handleBack = () => {
        router.replace("/onboarding/screen1");
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top decorative image */}
            <Image
                source={require("../../assets/images/Unt.png")}
                style={styles.upperLeaves}
            />

            {/* Back button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
            >
                <MaterialIcons name="arrow-back" size={24} color="#155658" />
            </TouchableOpacity>

            {/* Main content */}
            <View style={styles.contentContainer}>
                <View style={styles.featureImageContainer}>
                    <Image
                        source={require("../../assets/images/textsign.png")}
                        style={styles.featureImage}
                    />
                </View>

                <Text style={styles.title}>Text to Sign Language</Text>

                <Text style={styles.description}>
                    Type or speak in English, Sinhala, or Tamil and see the
                    corresponding sign language videos. Our app instantly translates
                    your words into sign language, making communication easy and accessible.
                </Text>

                <View style={styles.stepsContainer}>
                    <View style={styles.step}>
                        <View style={styles.stepNumberContainer}>
                            <Text style={styles.stepNumber}>1</Text>
                        </View>
                        <Text style={styles.stepText}>Type or speak your message</Text>
                    </View>

                    <View style={styles.step}>
                        <View style={styles.stepNumberContainer}>
                            <Text style={styles.stepNumber}>2</Text>
                        </View>
                        <Text style={styles.stepText}>Our app translates to sign language</Text>
                    </View>

                    <View style={styles.step}>
                        <View style={styles.stepNumberContainer}>
                            <Text style={styles.stepNumber}>3</Text>
                        </View>
                        <Text style={styles.stepText}>Watch the sign language videos</Text>
                    </View>
                </View>
            </View>

            {/* Navigation buttons */}
            <View style={styles.navigationContainer}>
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>

                <View style={styles.indicatorsContainer}>
                    <View style={styles.indicator} />
                    <View style={[styles.indicator, styles.activeIndicator]} />
                    <View style={styles.indicator} />
                </View>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.7}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom decorative image */}
            <Image
                source={require("../../assets/images/Unt.png")}
                style={styles.lowerLeaves}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D0F3DA",
    },
    upperLeaves: {
        position: "absolute",
        top: -70,
        width: width,
        height: 300,
        resizeMode: "cover",
        transform: [{ rotate: "180deg" }],
        opacity: 0.4,
    },
    lowerLeaves: {
        position: "absolute",
        bottom: -70,
        width: width,
        height: 250,
        resizeMode: "cover",
        opacity: 0.4,
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    contentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
        paddingTop: 60,
    },
    featureImageContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featureImage: {
        width: 120,
        height: 120,
        resizeMode: "contain",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#155658",
        textAlign: "center",
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: "#444",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 30,
    },
    stepsContainer: {
        width: "100%",
        marginTop: 10,
    },
    step: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    stepNumberContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#155658",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    stepNumber: {
        color: "white",
        fontWeight: "bold",
    },
    stepText: {
        fontSize: 16,
        color: "#333",
    },
    navigationContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    skipButton: {
        padding: 10,
    },
    skipButtonText: {
        color: "#155658",
        fontSize: 16,
        fontWeight: "500",
    },
    indicatorsContainer: {
        flexDirection: "row",
    },
    indicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#BBDFC8",
        marginHorizontal: 5,
    },
    activeIndicator: {
        backgroundColor: "#155658",
        width: 20,
    },
    nextButton: {
        backgroundColor: "#F5A623",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
    },
    nextButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});