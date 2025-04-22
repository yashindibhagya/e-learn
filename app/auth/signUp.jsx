import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { registerUser } from "../../services/authService";
import Button from "../../Components/Shared/Button";

/**
 * Sign Up screen for creating a new account
 */
export default function SignUp() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle sign up
    const handleSignUp = async () => {
        // Validate input
        if (!name.trim()) {
            Alert.alert("Error", "Please enter your name");
            return;
        }

        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        if (!password) {
            Alert.alert("Error", "Please enter a password");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            // Register the user
            await registerUser(email, password, name);

            // Show success message and navigate to sign in
            Alert.alert(
                "Account Created",
                "Your account has been successfully created!",
                [
                    {
                        text: "Sign In Now",
                        onPress: () => router.push("/auth/signIn")
                    }
                ]
            );
        } catch (error) {
            console.error("Registration error:", error);

            // Handle specific error codes
            let errorMessage = "Failed to create account.";

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already in use. Please use a different email or sign in.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Please choose a stronger password.";
            }

            Alert.alert("Sign Up Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={20} color="black" />
                    </TouchableOpacity>

                    {/* Logo */}
                    <Image
                        source={require("../../assets/images/gesture.png")}
                        style={styles.logo}
                    />

                    {/* Header */}
                    <Text style={styles.heading}>Create New Account</Text>
                    <Text style={styles.subHeading}>
                        Sign up now for free and start learning and translating signs to text
                    </Text>

                    {/* Form */}
                    <TextInput
                        placeholder="Full Name"
                        style={styles.textInput}
                        onChangeText={setName}
                        value={name}
                    />

                    <TextInput
                        placeholder="Email"
                        style={styles.textInput}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={setEmail}
                        value={email}
                    />

                    <TextInput
                        placeholder="Password"
                        secureTextEntry={true}
                        style={styles.textInput}
                        onChangeText={setPassword}
                        value={password}
                    />

                    {/* Sign Up Button */}
                    <Button
                        text="Create Account"
                        onPress={handleSignUp}
                        loading={loading}
                        style={styles.button}
                    />

                    {/* Sign In Link */}
                    <View style={styles.buttonContainer}>
                        <Text>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push("/auth/signIn")}>
                            <Text style={styles.signInLink}>Sign In here</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Decorative Image */}
                    <Image
                        source={require("../../assets/images/Unt.png")}
                        style={styles.lowerLeaves}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#D0F3DA",
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        alignItems: "center",
        padding: 25,
    },
    logo: {
        width: 100,
        height: 100,
        marginTop: 80,
        marginBottom: 20,
    },
    heading: {
        textAlign: "center",
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#155658",
    },
    subHeading: {
        textAlign: "center",
        fontSize: 16,
        color: "#555",
        marginBottom: 20,
    },
    textInput: {
        width: "90%",
        padding: 15,
        fontSize: 16,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#555",
        backgroundColor: "rgba(255,255,255,0.4)",
        borderRadius: 5,
    },
    button: {
        marginTop: 20,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        marginTop: 10,
    },
    signInLink: {
        color: "#155658",
        fontWeight: "bold",
        marginLeft: 5,
    },
    lowerLeaves: {
        height: 200,
        width: "100%",
        opacity: 0.4,
        marginTop: 20,
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 10,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 30,
        zIndex: 1,
    },
});