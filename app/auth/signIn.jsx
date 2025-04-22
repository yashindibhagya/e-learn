import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { loginUser, resetPassword } from "../../services/authService";
import Button from "../../Components/Shared/Button";

/**
 * Sign In screen for users who can type
 */
export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle sign in
    const handleSignIn = async () => {
        // Validate input
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        if (!password) {
            Alert.alert("Error", "Please enter your password");
            return;
        }

        setLoading(true);

        try {
            // Attempt to sign in
            await loginUser(email, password);

            // On success, navigate to home (no need to manually navigate as the auth listener in index.jsx will handle it)
        } catch (error) {
            console.error("Login error:", error);

            // Handle specific error codes
            let errorMessage = "Failed to sign in. Please check your credentials and try again.";

            if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address.";
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Incorrect email or password.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed sign in attempts. Please try again later.";
            }

            Alert.alert("Sign In Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle forgot password
    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email to reset password");
            return;
        }

        try {
            await resetPassword(email.trim());
            Alert.alert(
                "Password Reset Email Sent",
                "Check your email for instructions to reset your password"
            );
        } catch (error) {
            console.error("Password reset error:", error);

            let errorMessage = "Failed to send password reset email.";
            if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address.";
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email.";
            }

            Alert.alert("Error", errorMessage);
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
                    <Text style={styles.heading}>Welcome Back</Text>
                    <Text style={styles.subHeading}>
                        Sign in to continue your sign language journey
                    </Text>

                    {/* Form */}
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

                    {/* Forgot Password */}
                    <TouchableOpacity
                        onPress={handleForgotPassword}
                        style={styles.forgotPasswordContainer}
                    >
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Sign In Button */}
                    <Button
                        text="Sign In"
                        onPress={handleSignIn}
                        loading={loading}
                        style={styles.button}
                    />

                    {/* Create Account Link */}
                    <View style={styles.buttonContainer}>
                        <Text>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => router.push("/auth/signUp")}>
                            <Text style={styles.signUpLink}>Create New Account</Text>
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
        marginBottom: 30,
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
    forgotPasswordContainer: {
        width: "90%",
        alignItems: "flex-end",
        marginTop: 10,
        marginBottom: 20,
    },
    forgotPassword: {
        fontWeight: "600",
        color: "#155658",
    },
    button: {
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        marginTop: 10,
    },
    signUpLink: {
        color: "#155658",
        fontWeight: "bold",
        marginLeft: 5,
    },
    lowerLeaves: {
        top: 60,
        height: 300,
        opacity: 0.4,
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