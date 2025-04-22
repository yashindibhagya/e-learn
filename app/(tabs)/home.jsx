import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import Header from "../../Components/Home/Header";
import Common from "../../Components/Container/Common";

/**
 * Home screen with quick access to main app features
 */
export default function Home() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Common Header */}
                <Common />
                <Header />

                {/* Main Content */}
                <View style={styles.box}>
                    {/* Sign Language to Text */}
                    <TouchableOpacity
                        style={[styles.card, styles.signTextCard]}
                        onPress={() => router.push("/(tabs)/signToText")}
                    >
                        <View style={styles.greenBox}>
                            <Image
                                source={require("../../assets/images/signtext.png")}
                                style={styles.image}
                            />
                        </View>
                        <Text style={styles.cardText}>Sign language - to Text</Text>
                    </TouchableOpacity>

                    {/* Text to Sign Language */}
                    <TouchableOpacity
                        style={[styles.card, styles.textSignCard]}
                        onPress={() => router.push("/(tabs)/textToSign")}
                    >
                        <View style={styles.greenBox}>
                            <Image
                                source={require("../../assets/images/textsign.png")}
                                style={styles.image}
                            />
                        </View>
                        <Text style={styles.cardText}>Text - to - Sign language</Text>
                    </TouchableOpacity>

                    {/* Learning Section */}
                    <View style={[styles.learningCard]}>
                        <View style={styles.greenBox}>
                            <Image
                                source={require("../../assets/images/learning.png")}
                                style={styles.learningImage}
                            />
                        </View>
                        <Text style={styles.learningText}>
                            What would you like to learn today?
                        </Text>
                        <TouchableOpacity
                            style={styles.getStartedButton}
                            onPress={() => router.push("/(tabs)/learning")}
                        >
                            <Text style={styles.getStartedText}>Get started</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Settings Section */}
                    <TouchableOpacity
                        style={[styles.card, styles.settingsCard]}
                        onPress={() => router.push("/(tabs)/profile")}
                    >
                        <View style={styles.greenBox}>
                            <Image
                                source={require("../../assets/images/setting.png")}
                                style={styles.image}
                            />
                        </View>
                        <Text style={styles.cardText}>Settings</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#D0F3DA",
    },
    container: {
        flex: 1,
        padding: 25,
    },
    contentContainer: {
        paddingBottom: 100, // Add extra bottom padding for nav bar
    },
    box: {
        marginTop: 20,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    signTextCard: { backgroundColor: "#156658" },
    textSignCard: { backgroundColor: "#0E7C7B" },
    settingsCard: { backgroundColor: "#155658" },
    greenBox: {
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Slight transparency
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
    },
    image: {
        width: 100,
        height: 100,
    },
    cardText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        flexShrink: 1,
    },
    learningCard: {
        alignItems: "center",
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        backgroundColor: "#A7E9AF",
    },
    learningImage: {
        width: 100,
        height: 100,
    },
    learningText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
    },
    getStartedButton: {
        backgroundColor: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 10,
    },
    getStartedText: {
        color: "#155658",
        fontWeight: "bold",
    },
});