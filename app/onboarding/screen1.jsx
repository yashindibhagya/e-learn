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

const { width } = Dimensions.get("window");

/**
 * First onboarding screen for new users
 * Introduces users to the app's purpose
 */
export default function OnboardingScreen1() {
    const router = useRouter();

    // Skip the entire onboarding flow
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
        // Use replace for consistent navigation behavior
        router.push("/onboarding/screen2");
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Top decorative image */}
            <Image
                source={require("../../assets/images/Unt.png")}
                style={styles.upperLeaves}
            />

            {/* Main content */}
            <View style={styles.contentContainer}>
                <Image
                    source={require("../../assets/images/gesture.png")}
                    style={styles.logo}
                />

                <Text style={styles.title}>Welcome to GestureConnect</Text>

                <Text style={styles.description}>
                    Breaking barriers through sign language! Connect with the deaf community
                    and learn sign language in an interactive way.
                </Text>

                <View style={styles.featureContainer}>
                    <View style={styles.featureIconContainer}>
                        <Text style={styles.featureIcon}>👋</Text>
                    </View>
                    <View style={styles.featureTextContainer}>
                        <Text style={styles.featureTitle}>Learn Sign Language</Text>
                        <Text style={styles.featureText}>
                            Access a comprehensive library of sign language videos and tutorials
                        </Text>
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
                    <View style={[styles.indicator, styles.activeIndicator]} />
                    <View style={styles.indicator} />
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
    contentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
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
        marginBottom: 40,
    },
    featureContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    featureIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#FFECB3",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20,
    },
    featureIcon: {
        fontSize: 30,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#155658",
        marginBottom: 5,
    },
    featureText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
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