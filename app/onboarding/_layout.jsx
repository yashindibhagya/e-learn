import React from "react";
import { Stack } from "expo-router";

/**
 * Layout component for the onboarding flow
 * This sets up a Stack navigator for the onboarding screens
 */
export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "#D0F3DA" },
                gestureEnabled: false, // Disable swipe back gesture
            }}
        />
    );
}