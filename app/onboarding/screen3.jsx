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
 * Third and final onboarding screen for new users
 * Introduces users to the learning features
 */
export default function OnboardingScreen3() {
    const router = useRouter();

    // Complete onboarding and start using the app
    const handleGetStarted = async () => {
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

    // Navigate to the previous onboarding screen
    const handleBack = () => {
        router.replace("/onboarding/screen2");
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
                        source={require("../../assets/images/learning.png")}
                        style={styles.featureImage}
                    />
                </View>

                <Text style={styles.title}>Learn Sign Language</Text>

                <Text style={styles.description}>
                    Explore a variety of courses designed to help you learn sign language at your own pace.
                    From alphabets to common phrases, we've got everything you need to get started.
                </Text>

                <View style={styles.categoriesContainer}>
                    <View style={styles.categoryRow}>
                        <View style={[styles.categoryCard, { backgroundColor: "#FFD8B9" }]}>
                            <Text style={styles.categoryIcon}>📚</Text>
                            <Text style={styles.categoryText}>Alphabet</Text>
                        </View>

                        <View style={[styles.categoryCard, { backgroundColor: "#D7F5D3" }]}>
                            <Text style={styles.categoryIcon}>🦄</Text>
                            <Text style={styles.categoryText}>WH Questions</Text>
                        </View>
                    </View>

                    <View style={styles.categoryRow}>
                        <View style={[styles.categoryCard, { backgroundColor: "#FFE4B9" }]}>
                            <Text style={styles.categoryIcon}>💬</Text>
                            <Text style={styles.categoryText}>Conversation</Text>
                        </View>

                        <View style={[styles.categoryCard, { backgroundColor: "#FFECB3" }]}>
                            <Text style={styles.categoryIcon}>🎨</Text>
                            <Text style={styles.categoryText}>Colours</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Navigation buttons */}
            <View style={styles.navigationContainer}>
                <View style={styles.indicatorsContainer}>
                    <View style={styles.indicator} />
                    <View style={styles.indicator} />
                    <View style={[styles.indicator, styles.activeIndicator]} />
                </View>

                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={handleGetStarted}
                    activeOpacity={0.7}
                >
                    <Text style={styles.getStartedButtonText}>Get Started</Text>
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
    categoriesContainer: {
        width: "100%",
        marginTop: 10,
    },
    categoryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    categoryCard: {
        width: "48%",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryIcon: {
        fontSize: 30,
        marginBottom: 10,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    navigationContainer: {
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    indicatorsContainer: {
        flexDirection: "row",
        marginBottom: 20,
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
    getStartedButton: {
        backgroundColor: "#F5A623",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: "80%",
    },
    getStartedButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});