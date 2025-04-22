import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { UserDetailProvider, useUserDetail } from "../context/UserDetailContext";
import { VideoProvider } from "../context/VideoContext";
import { StatusBar } from "expo-status-bar";
import { auth } from "../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ActivityIndicator, View, Text } from "react-native";

/**
 * AuthProvider component that handles authentication state and redirects
 */
function AuthProvider({ children }) {
    const { userDetail, isLoading } = useUserDetail();
    const router = useRouter();
    const segments = useSegments();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (isLoading) return; // Wait for auth state to be determined

        // Get the current segments, which represent the current route path
        const inAuthGroup = segments[0] === 'auth';
        const inTabsGroup = segments[0] === '(tabs)';
        const isWelcomeScreen = segments.length === 1 && segments[0] === '';

        // Basic logic:
        // - If user is authenticated and trying to access auth screens, redirect to home
        // - If user is not authenticated and trying to access protected screens, redirect to welcome
        if (!initialized) {
            setInitialized(true);
            return;
        }

        if (userDetail) {
            // User is signed in
            if (inAuthGroup || isWelcomeScreen) {
                // Redirect away from auth screens when already signed in
                router.replace('/(tabs)/home');
            }
        } else {
            // User is not signed in
            if (inTabsGroup) {
                // Redirect to welcome screen if trying to access protected tabs
                router.replace('/');
            }
        }
    }, [userDetail, isLoading, segments, initialized]);

    // Show loading indicator while determining auth state
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#155658" />
                <Text style={{ marginTop: 10 }}>Loading...</Text>
            </View>
        );
    }

    // Once auth state is determined, render the app
    return <>{children}</>;
}

/**
 * Root layout component that provides context providers
 * and sets up the stack navigator
 */
export default function RootLayout() {
    return (
        <UserDetailProvider>
            <VideoProvider>
                <AuthProvider>
                    <StatusBar style="dark" />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: '#D0F3DA' },
                            animation: 'slide_from_right',
                        }}
                    />
                </AuthProvider>
            </VideoProvider>
        </UserDetailProvider>
    );
}

// This is a custom layout trick to ensure we have a default catch-all route
// if no other route matches in Expo Router
export function ErrorBoundary(props) {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "GestureConnect",
                }}
            />
        </Stack>
    );
}