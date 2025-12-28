/**
 * Root Layout for Native Platforms
 * Handles authentication routing and global providers
 */

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { colors } from "@/utils/colors";

/**
 * Loading Screen Component
 * Displayed while Clerk is loading auth state
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
        const isOAuthCallback = segments[0] === "oauth-native-callback";

        // Skip redirect if on OAuth callback - it handles its own redirect
        if (isOAuthCallback) {
            return;
        }

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
            <Stack.Screen
                name="oauth-native-callback"
                options={{ headerShown: false, animation: "fade" }}
            />
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
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

    // Validate Clerk key
    if (!publishableKey) {
        if (__DEV__) {
            console.error(
                "[RootLayout] Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable"
            );
        }
        return (
            <View style={styles.errorContainer}>
                <ActivityIndicator size="large" color={colors.error} />
            </View>
        );
    }

    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={styles.container}>
                <SafeAreaProvider>
                    <ClerkProvider
                        tokenCache={tokenCache}
                        publishableKey={publishableKey}
                    >
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                        <RootLayoutWithAuth />
                    </ClerkProvider>
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
