import { colors } from "@/utils/colors";
import { db } from "@/utils/firebase";
import { ConversationResponse, TranscriptEntry } from "@/utils/types";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Gradient } from "../gradient";

// Optimized message component
const MessageBubble = React.memo(({ item }: { item: TranscriptEntry }) => {
    const isUser = item.role === "user";
    return (
        <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
                    {item.message}
                </Text>
            </View>
        </View>
    );
});

export default function SummaryScreen() {
    const { conversationId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useUser();
    const [conversation, setConversation] = useState<ConversationResponse>();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getSummary();
    }, []);

    // Auto-refresh every 5 seconds when conversation is not done
    useEffect(() => {
        if (conversation?.status && conversation.status !== "done") {
            const intervalId = setInterval(() => {
                console.log("Auto-refreshing conversation status...");
                getSummary();
            }, 5000); // 5 seconds

            return () => clearInterval(intervalId);
        }
    }, [conversation?.status]);

    async function getSummary() {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_BASE_URL}/api/conversations?conversationId=${conversationId}`
            );

            if (!response.ok) {
                const text = await response.text();
                console.error("Failed to fetch summary:", text);
                return;
            }

            const data: { conversation: ConversationResponse } = await response.json();
            setConversation(data.conversation);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    }

    async function saveAndContinue() {
        try {
            setIsSaving(true);
            await addDoc(collection(db, "session"), {
                user_id: user?.id,
                status: conversation?.status,
                conv_id: conversationId,
                tokens: Number(conversation?.metadata?.cost),
                call_duration_secs: Number(conversation?.metadata?.call_duration_secs),
                transcript: conversation?.transcript.map((t) => t.message).join("\n"),
                call_summary_title: conversation?.analysis?.call_summary_title,
                created_at: new Date().toISOString(),
            });

            router.dismissAll();
        } catch (error) {
            console.error("Error saving summary:", error);
        } finally {
            setIsSaving(false);
        }
    }

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0s";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const formatDate = (unixSeconds: number) => {
        if (!unixSeconds) return "";
        const date = new Date(unixSeconds * 1000);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return "Today, " + date.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
            });
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday, " + date.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
            });
        }

        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getStatusColor = () => {
        const success = conversation?.analysis?.call_successful;
        if (success === "success") return colors.green;
        if (success === "failure") return colors.red;
        return colors.primary;
    };

    const getStatusLabel = () => {
        const success = conversation?.analysis?.call_successful;
        if (success === "success") return "Successful Call";
        if (success === "failure") return "Call Failed";
        return "Call Completed";
    };

    const transcriptData = useMemo(
        () => conversation?.transcript || [],
        [conversation?.transcript]
    );

    if (conversation?.status !== "done") {
        return (
            <View style={styles.container}>
                <Gradient position="top" isSpeaking={false} />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.loadingWrapper}>
                        <View style={styles.loadingContent}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingTitle}>Processing Call</Text>
                            <Text style={styles.loadingSubtitle}>
                                {conversation?.status || "Initializing"}...
                            </Text>
                            <Pressable onPress={getSummary} style={styles.retryButton}>
                                <Text style={styles.retryText}>Refresh</Text>
                            </Pressable>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Gradient position="bottom" isSpeaking={false} />
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Status Badge */}
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                        <Text style={styles.statusLabel}>{getStatusLabel()}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>
                        {conversation?.analysis?.call_summary_title || "Call Summary"}
                    </Text>

                    {/* Metadata */}
                    <Text style={styles.dateText}>
                        {formatDate(conversation?.metadata?.start_time_unix_secs)}
                    </Text>

                    {/* Summary Card */}
                    <View style={styles.summarySection}>
                        <View style={styles.gradientWrapper}>
                            <LinearGradient
                                colors={["rgba(0, 122, 255, 0.1)", "rgba(90, 200, 250, 0.05)"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.summaryCard}
                            >
                                <Text style={styles.summaryLabel}>AI Summary</Text>
                                <Text style={styles.summaryText}>
                                    {conversation?.analysis?.transcript_summary.trim()}
                                </Text>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>
                                {formatDuration(conversation?.metadata?.call_duration_secs)}
                            </Text>
                            <Text style={styles.statLabel}>Duration</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{conversation?.metadata?.cost}</Text>
                            <Text style={styles.statLabel}>Tokens</Text>
                        </View>
                    </View>

                    {/* Conversation */}
                    <View style={styles.conversationSection}>
                        <Text style={styles.sectionTitle}>Conversation</Text>
                        <View style={styles.conversationList}>
                            {transcriptData.map((item, index) => (
                                <MessageBubble key={`msg-${index}`} item={item} />
                            ))}
                        </View>
                    </View>

                    {/* Save Button */}
                    <View style={styles.saveButtonContainer}>
                        <Pressable
                            onPress={saveAndContinue}
                            disabled={isSaving}
                            style={[
                                styles.saveButton,
                                isSaving && styles.saveButtonDisabled,
                            ]}
                            android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
                        >
                            <Text style={styles.saveButtonText}>
                                {isSaving ? "Saving..." : "Save & Continue"}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 16,
    },
    loadingWrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    loadingContent: {
        alignItems: "center",
        gap: 16,
    },
    loadingTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000000",
        marginTop: 8,
    },
    loadingSubtitle: {
        fontSize: 16,
        color: colors.gray,
        textTransform: "capitalize",
    },
    retryButton: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: colors.gray6,
        borderRadius: 12,
    },
    retryText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.primary,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "rgba(0, 0, 0, 0.03)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#000000",
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#000000",
        lineHeight: 38,
        marginBottom: 8,
    },
    dateText: {
        fontSize: 15,
        color: colors.gray2,
        marginBottom: 24,
    },
    summarySection: {
        marginBottom: 24,
    },
    gradientWrapper: {
        borderRadius: 20,
        overflow: "hidden",
    },
    summaryCard: {
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(0, 122, 255, 0.1)",
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.primary,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 16,
        lineHeight: 24,
        color: "#1c1c1e",
    },
    statsContainer: {
        flexDirection: "row",
        backgroundColor: "#F8F9FA",
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        alignItems: "center",
    },
    statBox: {
        flex: 1,
        alignItems: "center",
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: "#E0E0E0",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "800",
        color: "#000000",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: colors.gray,
        fontWeight: "500",
    },
    conversationSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 16,
    },
    conversationList: {
        gap: 0,
    },
    messageContainer: {
        width: "100%",
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    userMessageContainer: {
        alignItems: "flex-end",
    },
    bubble: {
        maxWidth: "80%",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
    },
    aiBubble: {
        backgroundColor: "#F0F0F0",
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    bubbleText: {
        fontSize: 15,
        lineHeight: 21,
        color: "#1c1c1e",
    },
    userBubbleText: {
        color: "#FFFFFF",
    },
    saveButtonContainer: {
        marginTop: 15,
        marginBottom: 40,
    },
    saveButton: {
        height: 64,
        borderRadius: 32,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#007AFF",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },
});
