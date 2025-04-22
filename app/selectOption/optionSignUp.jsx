import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/**
 * Option Sign Up screen that lets users choose between regular and gesture-based registration
 */
export default function OptionSignUp() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <StatusBar backgroundColor="#D0F3DA" barStyle="dark-content" />

                <Image
                    source={require("../../assets/images/Unt.png")}
                    style={styles.upperLeaves}
                />

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={20} color="black" />
                </TouchableOpacity>

                <Image
                    source={require("../../assets/images/gesture.png")}
                    style={styles.logo}
                />

                <Text style={styles.welcome}>Join GestureConnect Today! 🌟</Text>

                <Text style={styles.description}>
                    Communication knows no barriers only bridges
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/auth/signUp")}
                >
                    <Text style={styles.buttonText}>Typing-proficient</Text>
                    <FontAwesome name="keyboard-o" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/auth/gestureSignUp")}
                >
                    <Text style={styles.buttonText}>Non-typing individuals</Text>
                    <MaterialIcons name="gesture" size={20} color="white" />
                </TouchableOpacity>

                <Image
                    source={require("../../assets/images/Unt.png")}
                    style={styles.lowerLeaves}
                />
            </View>
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
        alignItems: "center",
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    upperLeaves: {
        position: "absolute",
        top: -70,
        height: 300,
        resizeMode: "cover",
        transform: [{ rotate: "180deg" }],
        opacity: 0.4,
    },
    lowerLeaves: {
        position: "absolute",
        bottom: -90,
        height: 300,
        opacity: 0.4,
    },
    backButton: {
        position: "absolute",
        top: 30,
        left: 20,
        padding: 10, // Adds touchable area
        backgroundColor: "#fff",
        borderRadius: 30,
        zIndex: 1,
    },
    logo: {
        width: 200,
        height: 200,
        marginTop: 120,
    },
    welcome: {
        fontSize: 26,
        fontWeight: "bold",
        marginVertical: 8,
        color: "#155658",
        textAlign: "center",
    },
    description: {
        textAlign: "center",
        color: "#555",
        paddingHorizontal: 20,
        marginBottom: 30,
        fontWeight: "600",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5a623",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginVertical: 10,
        width: "90%",
        justifyContent: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
        textAlign: "center",
        flex: 1,
    },
});