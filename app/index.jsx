import React from "react";
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

// Import the background illustration
import frontImage from "../assets/images/Untitled.png";

export default function WelcomeScreen() {
    const router = useRouter(); // Use Expo Router's navigation

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            {/* Background Image */}
            <ImageBackground
                source={frontImage}
                style={styles.imageBackground}
                resizeMode="contain"
            />

            {/* Overlay Content */}
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to</Text>
                <Text style={styles.brand}>GestureConnect</Text>

                {/* Get Started Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("selectOption/optionSignUp")}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>

                {/* Already have an account? (Link to Sign In Page) */}

                <TouchableOpacity
                    onPress={() => router.push("selectOption/optionSignIn")}
                >
                    <Text style={styles.linkText}>Already have an account?</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#155658", // Dark green background
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40
    },
    imageBackground: {
        width: 600,
        height: 900, // Reduce height so text is visible
        position: "absolute", // Position image behind content
        top: -70, // Stick it to the top
    },
    content: {
        position: "absolute", // Place content over the image
        bottom: 100, // Move content up
        width: "100%",
        alignItems: "center",
        top: 650,
    },
    title: {
        fontSize: 22,
        color: "#fff",
        fontWeight: "400",
        top: -40,
    },
    brand: {
        fontSize: 32,
        fontWeight: "900",
        color: "#fff",
        top: -45,
    },
    button: {
        backgroundColor: "#F5A623", // Yellow button color
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginTop: 20,
        width: "80%",
        alignItems: "center",
        top: -60,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    linkText: {
        fontSize: 14,
        color: "#C0C0C0",
        marginTop: 10,
        textAlign: "center",
        top: -60,
    },
    signInText: {
        fontSize: 14,
        color: "#C0C0C0",
        textDecorationLine: "underline", // Underline only "Sign In"
        fontWeight: "bold", // Make it stand out
    },
});
