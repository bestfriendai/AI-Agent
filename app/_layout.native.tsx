/**
 * Root Layout for Native Platforms
 * Handles authentication routing and global providers
 */

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { colors } from "@/utils/colors";

/**
 * Loading Screen Component
 * Displayed while Firebase is loading auth state
 */
function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}

/**
 * Auth-aware Layout Component
 * Handles routing based on authentication state
 */
function RootLayoutWithAuth() {
    const { isSignedIn, isLoaded } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;

        const inProtectedGroup = segments[0] === "(protected)";
        const inPublicGroup = segments[0] === "(public)";

        // Redirect based on auth state
        if (isSignedIn && !inProtectedGroup) {
            router.replace("/(protected)");
        } else if (!isSignedIn && !inPublicGroup) {
            router.replace("/(public)");
        }
    }, [isSignedIn, isLoaded, segments, router]);

    // Show loading screen while auth state is loading
    if (!isLoaded) {
        return <LoadingScreen />;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                gestureEnabled: true,
            }}
        >
            <Stack.Protected guard={isSignedIn}>
                <Stack.Screen name="(protected)" options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={!isSignedIn}>
                <Stack.Screen name="(public)" options={{ headerShown: false }} />
            </Stack.Protected>
        </Stack>
    );
}

/**
 * Root Layout Component
 * Provides global context providers and error handling
 */
export default function RootLayout() {
    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={styles.container}>
                <SafeAreaProvider>
                    <AuthProvider>
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                        <RootLayoutWithAuth />
                    </AuthProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
});
