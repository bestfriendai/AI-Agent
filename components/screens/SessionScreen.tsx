/**
 * SessionScreen Component
 * Voice conversation session with AI using ElevenLabs
 */

import { useConversation } from "@/hooks/useConversation";
import { sessions } from "@/utils/sessions";
import { colors } from "@/utils/colors";
import { parseError, logError, withTimeout } from "@/utils/errors";
import haptics from "@/utils/haptics";
import { API_CONFIG } from "@/utils/constants";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Brightness from "expo-brightness";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState, useCallback, useRef } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gradient } from "../gradient";
import { FullScreenSkeleton } from "../Skeleton";

const { width } = Dimensions.get("window");
const CONNECTION_TIMEOUT_MS = 30000;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SessionError {
    message: string;
    canRetry: boolean;
}

export default function SessionScreen() {
    const { user, isLoaded } = useUser();
    const { sessionId } = useLocalSearchParams();
    const router = useRouter();

    // Refs for cleanup
    const isMounted = useRef(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // State
    const [currentSession, setCurrentSession] = useState(
        sessions.find((s) => s.id === Number(sessionId)) ?? sessions[0]
    );
    const [isStarting, setIsStarting] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [error, setError] = useState<SessionError | null>(null);

    // Animation values
    const buttonScale = useSharedValue(1);

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Session persistence
    useEffect(() => {
        const manageSessionPersistence = async (): Promise<void> => {
            if (sessionId) {
                const s = sessions.find((s) => s.id === Number(sessionId));
                if (s) {
                    setCurrentSession(s);
                    try {
                        await SecureStore.setItemAsync("last_session_id", String(s.id));
                    } catch (e) {
                        logError("SessionScreen:persistSession", e);
                    }
                }
            } else {
                try {
                    const savedId = await SecureStore.getItemAsync("last_session_id");
                    if (savedId) {
                        const s = sessions.find((s) => s.id === Number(savedId));
                        if (s && isMounted.current) setCurrentSession(s);
                    }
                } catch (e) {
                    logError("SessionScreen:restoreSession", e);
                }
            }
        };
        manageSessionPersistence();
    }, [sessionId]);

    // Conversation hook
    const conversation = useConversation({
        onConnect: (data: { conversationId?: string }) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (data?.conversationId && isMounted.current) {
                setConversationId(data.conversationId);
                setError(null);
                haptics.success();
            }
        },
        onDisconnect: () => {
            if (__DEV__) console.log("Disconnected from conversation");
        },
        onMessage: (message: unknown) => {
            if (__DEV__) console.log("Received message:", message);
        },
        onError: (err: unknown) => {
            logError("SessionScreen:conversation", err);
            const parsedError = parseError(err);
            if (isMounted.current) {
                setError({
                    message: parsedError.message,
                    canRetry: parsedError.type !== "auth",
                });
                setIsStarting(false);
                haptics.error();
            }
        },
        onModeChange: (mode: unknown) => {
            if (__DEV__) console.log("Mode changed:", mode);
        },
        onStatusChange: (prop: { status: string }) => {
            if (__DEV__) console.log("Status changed:", prop.status);
        },
        onCanSendFeedbackChange: () => {},
        onUnhandledClientToolCall: () => {},

        clientTools: {
            handleSetBrightness: async (params: unknown) => {
                try {
                    const { brightnessValue } = params as { brightnessValue: number };
                    const { status } = await Brightness.requestPermissionsAsync();
                    if (status === "granted") {
                        await Brightness.setSystemBrightnessAsync(brightnessValue);
                        return brightnessValue;
                    }
                    return -1;
                } catch (e) {
                    logError("SessionScreen:brightness", e);
                    return -1;
                }
            },
        },
    });

    const startConversation = useCallback(async (): Promise<void> => {
        if (isStarting) return;
        if (conversation.status !== "disconnected") return;

        const agentId = process.env.EXPO_PUBLIC_AGENT_ID;
        if (!agentId) {
            setError({
                message: "Configuration error. Please contact support.",
                canRetry: false,
            });
            haptics.error();
            return;
        }

        try {
            setIsStarting(true);
            setError(null);
            haptics.medium();

            // Set up timeout
            timeoutRef.current = setTimeout(() => {
                if (isMounted.current && isStarting) {
                    setError({
                        message: "Connection timed out. Please check your internet connection and try again.",
                        canRetry: true,
                    });
                    setIsStarting(false);
                    haptics.error();
                }
            }, CONNECTION_TIMEOUT_MS);

            await conversation.startSession({
                agentId,
                dynamicVariables: {
                    username: user?.firstName || "user",
                    session_title: String(currentSession.title),
                    session_description: String(currentSession.description),
                },
            });
        } catch (e) {
            logError("SessionScreen:startConversation", e);
            const parsedError = parseError(e);

            if (isMounted.current) {
                setError({
                    message: parsedError.message,
                    canRetry: true,
                });
                haptics.error();
            }
        } finally {
            if (isMounted.current) {
                setIsStarting(false);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, [isStarting, conversation, user?.firstName, currentSession]);

    const endConversation = useCallback(async (): Promise<void> => {
        if (conversation.status !== "connected") return;

        try {
            haptics.medium();
            await conversation.endSession();

            if (conversationId) {
                router.push(`/summary?conversationId=${conversationId}`);
            } else {
                router.back();
            }
        } catch (e) {
            logError("SessionScreen:endConversation", e);
            haptics.error();
            // Still navigate even if end fails
            router.back();
        }
    }, [conversation, conversationId, router]);

    const handleBack = useCallback((): void => {
        haptics.light();
        router.back();
    }, [router]);

    const dismissError = useCallback((): void => {
        setError(null);
    }, []);

    // Button animation
    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleButtonPressIn = (): void => {
        buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    };

    const handleButtonPressOut = (): void => {
        buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    // Loading state
    if (!isLoaded) {
        return <FullScreenSkeleton />;
    }

    const isConnected = conversation.status === "connected";
    const isConnecting = conversation.status === "connecting" || isStarting;
    const isActive = isConnected || isConnecting;

    return (
        <View style={styles.container}>
            <Gradient position="top" isSpeaking={isActive} />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        onPress={handleBack}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Ionicons
                            name="chevron-back"
                            size={28}
                            color={isActive ? "#fff" : "#000"}
                        />
                    </Pressable>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Animated.View
                        entering={FadeInDown.delay(200).springify()}
                        style={styles.textContainer}
                    >
                        <Text
                            style={[styles.title, isActive && styles.titleActive]}
                            accessibilityRole="header"
                        >
                            {currentSession.title}
                        </Text>
                        <Text style={[styles.description, isActive && styles.descriptionActive]}>
                            {currentSession.description}
                        </Text>
                    </Animated.View>

                    {/* Connection Status */}
                    {isConnected && (
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={styles.statusContainer}
                        >
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Session Active</Text>
                        </Animated.View>
                    )}
                </View>

                {/* Error Banner */}
                {error && (
                    <Animated.View
                        entering={FadeInDown.springify()}
                        exiting={FadeOut}
                        style={styles.errorBanner}
                    >
                        <Ionicons name="alert-circle" size={20} color={colors.error} />
                        <Text style={styles.errorText}>{error.message}</Text>
                        <Pressable
                            onPress={dismissError}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityRole="button"
                            accessibilityLabel="Dismiss error"
                        >
                            <Ionicons name="close" size={20} color="#666" />
                        </Pressable>
                    </Animated.View>
                )}

                {/* Controls */}
                <View style={styles.controls}>
                    <AnimatedPressable
                        onPress={isConnected ? endConversation : startConversation}
                        onPressIn={handleButtonPressIn}
                        onPressOut={handleButtonPressOut}
                        disabled={isConnecting}
                        style={[styles.buttonWrapper, buttonAnimatedStyle]}
                        accessibilityRole="button"
                        accessibilityLabel={isConnected ? "End session" : "Start session"}
                        accessibilityState={{ disabled: isConnecting }}
                    >
                        <View
                            style={[
                                styles.mainButton,
                                isConnecting && styles.buttonDisabled,
                                isConnected && styles.buttonEnd,
                            ]}
                        >
                            {isConnecting ? (
                                <>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.buttonText}>Connecting...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons
                                        name={isConnected ? "stop" : "mic"}
                                        size={24}
                                        color="#fff"
                                    />
                                    <Text style={styles.buttonText}>
                                        {isConnected ? "End Session" : "Start Session"}
                                    </Text>
                                </>
                            )}
                        </View>
                    </AnimatedPressable>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        height: 60,
        justifyContent: "center",
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    textContainer: {
        alignItems: "center",
        gap: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: "800",
        color: "#1a1a1a",
        textAlign: "center",
        letterSpacing: -0.5,
    },
    titleActive: {
        color: "#fff",
    },
    description: {
        fontSize: 18,
        fontWeight: "500",
        color: "#666",
        textAlign: "center",
        lineHeight: 26,
        maxWidth: width * 0.8,
    },
    descriptionActive: {
        color: "rgba(255,255,255,0.8)",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 32,
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.success,
    },
    statusText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: `${colors.error}10`,
        marginHorizontal: 24,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: `${colors.error}20`,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: colors.error,
        lineHeight: 20,
    },
    controls: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === "ios" ? 20 : 40,
    },
    buttonWrapper: {
        width: "100%",
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    mainButton: {
        flexDirection: "row",
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: 10,
        backgroundColor: colors.primary,
    },
    buttonEnd: {
        backgroundColor: colors.error,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
});
