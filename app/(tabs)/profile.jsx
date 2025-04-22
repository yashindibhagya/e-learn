import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Common from "../../Components/Container/Common";
import { useUserDetail } from "../../context/UserDetailContext";
import {
    updateUserProfile,
    changePassword,
    logoutUser
} from "../../services/authService";
import { auth } from "../../config/firebaseConfig";

/**
 * Profile/Settings screen that allows users to manage their account
 */
export default function Profile() {
    const router = useRouter();
    const { userDetail, setUserDetail, isLoading: userLoading } = useUserDetail();

    const [expanded, setExpanded] = useState({
        account: false,
        accountInfo: false,
        password: false,
        logout: false,
        reportBug: false,
        sendFeedback: false,
    });

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Initialize form data with user details when they're loaded
    useEffect(() => {
        if (userDetail) {
            setFormData({
                name: userDetail.name || "",
                email: userDetail.email || auth.currentUser?.email || "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [userDetail]);

    const toggleExpand = (section) => {
        setExpanded((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Update Profile in Firebase
    const handleUpdateProfile = async () => {
        if (!formData.name.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Not logged in");
            }

            await updateUserProfile(user, { name: formData.name.trim() });

            // Update local state
            setUserDetail({
                ...userDetail,
                name: formData.name.trim()
            });

            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Profile update error:", error);
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    // Change Password
    const handleChangePassword = async () => {
        if (!formData.newPassword || !formData.confirmPassword) {
            Alert.alert("Error", "Please enter both password fields.");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        if (formData.newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Not logged in");
            }

            await changePassword(user, formData.newPassword);

            Alert.alert("Success", "Password changed successfully!");

            // Clear password fields
            setFormData({
                ...formData,
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Password change error:", error);

            // Handle specific Firebase auth errors
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                    "Authentication Required",
                    "Please sign out and sign in again to change your password.",
                    [
                        { text: "OK" },
                        {
                            text: "Sign Out Now",
                            onPress: handleLogout,
                            style: "destructive"
                        }
                    ]
                );
            } else {
                Alert.alert("Error", "Failed to change password.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Logout and Redirect to Sign In
    const handleLogout = async () => {
        try {
            await logoutUser();
            // Explicitly navigate to the welcome screen after logout
            router.replace("/"); // Redirect to welcome screen
        } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to log out.");
        }
    };

    if (userLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Common />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#F7B316" />
                    <Text>Loading user profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Common Header */}
                    <Common />

                    <StatusBar backgroundColor="#D0F3DA" barStyle="dark-content" />

                    <Text style={styles.title}>Settings</Text>

                    <View>
                        <Text style={styles.sectionHeader}>GENERAL</Text>

                        {/* Account */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => toggleExpand("account")}
                        >
                            <View style={styles.optionRow}>
                                <AntDesign name="user" size={20} color="#FFA726" />
                                <Text style={styles.optionText}>Account</Text>
                            </View>
                            <AntDesign
                                name={expanded.account ? "up" : "down"}
                                size={16}
                                color="black"
                            />
                        </TouchableOpacity>

                        {expanded.account && (
                            <View style={styles.expandedContent}>
                                {/* Account Information */}
                                <TouchableOpacity
                                    style={styles.subOption}
                                    onPress={() => toggleExpand("accountInfo")}
                                >
                                    <Text style={styles.subOptionText}>Account Information</Text>
                                    <AntDesign
                                        name={expanded.accountInfo ? "up" : "down"}
                                        size={16}
                                        color="black"
                                    />
                                </TouchableOpacity>

                                {expanded.accountInfo && (
                                    <View style={styles.expandedSubContent}>
                                        <Text style={styles.label}>Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.name}
                                            onChangeText={(text) =>
                                                setFormData((prev) => ({ ...prev, name: text }))
                                            }
                                        />
                                        <Text style={styles.label}>Email (Read-only)</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.email}
                                            editable={false}
                                        />
                                        <TouchableOpacity
                                            style={styles.updateButton}
                                            onPress={handleUpdateProfile}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.buttonText}>Update Profile</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Password */}
                                <TouchableOpacity
                                    style={styles.subOption}
                                    onPress={() => toggleExpand("password")}
                                >
                                    <Text style={styles.subOptionText}>Password</Text>
                                    <AntDesign
                                        name={expanded.password ? "up" : "down"}
                                        size={16}
                                        color="black"
                                    />
                                </TouchableOpacity>

                                {expanded.password && (
                                    <View style={styles.expandedSubContent}>
                                        <Text style={styles.label}>New Password</Text>
                                        <View style={styles.passwordContainer}>
                                            <TextInput
                                                style={styles.input}
                                                value={formData.newPassword}
                                                onChangeText={(text) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        newPassword: text,
                                                    }))
                                                }
                                                secureTextEntry={!showPassword}
                                            />
                                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                                <Ionicons
                                                    name={showPassword ? "eye-off" : "eye"}
                                                    size={20}
                                                    color="black"
                                                    style={styles.eyeIcon}
                                                />
                                            </Pressable>
                                        </View>

                                        <Text style={styles.label}>Confirm Password</Text>
                                        <View style={styles.passwordContainer}>
                                            <TextInput
                                                style={styles.input}
                                                value={formData.confirmPassword}
                                                onChangeText={(text) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        confirmPassword: text,
                                                    }))
                                                }
                                                secureTextEntry={!showConfirmPassword}
                                            />
                                            <Pressable
                                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                <Ionicons
                                                    name={showConfirmPassword ? "eye-off" : "eye"}
                                                    size={20}
                                                    color="black"
                                                    style={styles.eyeIcon}
                                                />
                                            </Pressable>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.updateButton}
                                            onPress={handleChangePassword}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.buttonText}>Change Password</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Logout */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => toggleExpand("logout")}
                        >
                            <View style={styles.optionRow}>
                                <AntDesign name="logout" size={20} color="#FFA726" />
                                <Text style={styles.optionText}>Logout</Text>
                            </View>
                            <AntDesign
                                name={expanded.logout ? "up" : "down"}
                                size={16}
                                color="black"
                            />
                        </TouchableOpacity>

                        {expanded.logout && (
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogout}
                            >
                                <Text style={styles.buttonText}>Confirm Logout</Text>
                            </TouchableOpacity>
                        )}

                        {/* Feedback Section */}
                        <Text style={styles.sectionHeader}>FEEDBACK</Text>

                        {/* Report a Bug */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => toggleExpand("reportBug")}
                        >
                            <View style={styles.optionRow}>
                                <AntDesign name="warning" size={20} color="#FFA726" />
                                <Text style={styles.optionText}>Report a bug</Text>
                            </View>
                            <AntDesign
                                name={expanded.reportBug ? "up" : "down"}
                                size={16}
                                color="black"
                            />
                        </TouchableOpacity>

                        {/* Send Feedback */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => toggleExpand("sendFeedback")}
                        >
                            <View style={styles.optionRow}>
                                <AntDesign name="form" size={20} color="#FFA726" />
                                <Text style={styles.optionText}>Send Feedback</Text>
                            </View>
                            <AntDesign
                                name={expanded.sendFeedback ? "up" : "down"}
                                size={16}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
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
    container: {
        flex: 1,
        padding: 25,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#717171",
        marginTop: 24,
        marginBottom: 8,
    },
    option: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#8A9A95",
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    optionText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "500",
    },
    subOption: {
        paddingVertical: 15,
        marginLeft: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#8A9A95",
    },
    subOptionText: {
        fontSize: 14,
        fontWeight: "500",
        marginLeft: 10,
    },
    expandedContent: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingVertical: 10,
    },
    expandedSubContent: {
        marginTop: 10,
        paddingLeft: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 8,
        marginLeft: 20,
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        paddingLeft: 10,
        marginBottom: 20,
        width: 200,
        marginLeft: 20,
        backgroundColor: "#fff",
    },
    passwordContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    eyeIcon: {
        marginBottom: 20,
        marginRight: 50,
    },
    updateButton: {
        backgroundColor: "#FFA726",
        paddingVertical: 10,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        marginLeft: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },
    logoutButton: {
        backgroundColor: "#FFA726",
        paddingVertical: 10,
        borderRadius: 30,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});