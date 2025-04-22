import React, { useEffect } from "react";
import { useRouter, Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

/**
 * Entry point for onboarding flow
 * Redirects to first screen or checks if onboarding is already complete
 */
export default function OnboardingIndex() {
    const router = useRouter();

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            try {
                const onboardingComplete = await AsyncStorage.getItem("onboardingComplete");
                if (onboardingComplete === "true") {
                    // Onboarding already completed, redirect to home
                    router.replace("/(tabs)/home");
                } else {
                    // Onboarding not completed, redirect to first screen
                    router.replace("/onboarding/screen1");
                }
            } catch (error) {
                console.error("Error checking onboarding status:", error);
                // Default to showing onboarding if there's an error
                router.replace("/onboarding/screen1");
            }
        };

        checkOnboardingStatus();
    }, []);

    // Show loading indicator while checking status
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#D0F3DA" }}>
            <ActivityIndicator size="large" color="#155658" />
        </View>
    );
}