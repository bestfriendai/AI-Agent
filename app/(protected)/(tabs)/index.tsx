import ParallaxScrollView, { blurhash } from "@/components/ParallaxScrollView";
import { colors } from "@/utils/colors";
import { sessions } from "@/utils/sessions";
import { Session, supabase } from "@/utils/supabase";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";

export default function Index() {
    const router = useRouter();
    const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
    const { user } = useUser();

    useEffect(() => {
        fetchSession();
    }, []);

    const fetchSession = async () => {
        if (!user) {
            alert("No user found")
            return;
        }
        try {
            const { data, error } = await supabase
                .from('session')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            setSessionHistory(data as Session[])
            console.log(JSON.stringify(data, null, 2));
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <ParallaxScrollView>
            <Text style={styles.title}>Explore Sessions</Text>
            <FlashList<typeof sessions[0]>
                data={sessions}
                renderItem={({ item: session }) => (
                    <Pressable
                        style={styles.sessionContainer}
                        onPress={() =>
                            router.navigate({
                                pathname: "/session/[sessionId]",
                                params: { sessionId: session.id },
                            })
                        }
                    >
                        <Image
                            source={session.image}
                            style={styles.sessionImage}
                            contentFit="cover"
                            transition={1000}
                            placeholder={{ blurhash }}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.5)']}
                            style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                borderRadius: 16,
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Text style={styles.sessionTitle}>{session.title}</Text>
                        </LinearGradient>
                    </Pressable>
                )}
                // @ts-ignore
                estimatedItemSize={266}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingLeft: 16,
                    paddingRight: 16,
                }}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            />

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent History</Text>
                <Pressable
                    onPress={fetchSession}
                    style={({ pressed }) => [
                        styles.refreshButton,
                        pressed && { opacity: 0.7 }
                    ]}
                >
                    <Ionicons
                        name="refresh"
                        size={20}
                        color={colors.primary}
                    />
                </Pressable>
            </View>

            <View style={styles.historyContainer}>
                {sessionHistory.length > 0 ? (
                    sessionHistory.map((session, index) => (
                        <Animated.View
                            key={session.id}
                            entering={FadeInDown.delay(index * 100 + 300).springify()}
                        >
                            <SessionCard session={session} />
                        </Animated.View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="time-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyStateText}>No recent sessions</Text>
                        <Text style={styles.emptyStateSubtext}>Start a conversation to see it here</Text>
                    </View>
                )}
            </View>
            <View style={{ height: 40 }} />
        </ParallaxScrollView>
    );
}

const SessionCard = ({ session }: { session: Session }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const randomEmoji = useMemo(() => {
        return ["🌱", "🏄", "⛅", "🌙", "🗻", "☁️", "🐚", "🌸", "✨", "🕊️"][
            Math.floor(Math.random() * 10)
        ];
    }, []);

    return (
        <Pressable
            style={styles.card}
            onPress={() => setIsExpanded(!isExpanded)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{randomEmoji}</Text>
                </View>
                <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {session.call_summary_title || "Untitled Session"}
                    </Text>
                    <Text style={styles.cardDate}>
                        {new Date(session.created_at).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric"
                        })}
                    </Text>
                </View>
                <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#999"
                />
            </View>

            <View style={styles.cardStats}>
                <View style={styles.statBadge}>
                    <Ionicons name="time-outline" size={12} color="#666" />
                    <Text style={styles.statText}>{session.call_duration_secs}s</Text>
                </View>
                <View style={styles.statBadge}>
                    <Ionicons name="chatbubble-outline" size={12} color="#666" />
                    <Text style={styles.statText}>{session.tokens} tokens</Text>
                </View>
            </View>

            {isExpanded && (
                <Animated.View entering={FadeInDown.duration(200)} style={styles.cardContent}>
                    <Text style={styles.transcriptLabel}>Summary</Text>
                    <Text style={styles.transcriptText}>{session.transcript}</Text>
                </Animated.View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        padding: 16,
    },
    sessionContainer: {
        position: "relative",
    },
    sessionImage: {
        width: 250,
        height: 140,
        borderRadius: 16,
        overflow: "hidden",
    },
    sessionTitle: {
        position: "absolute",
        width: "100%",
        bottom: 16,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 32,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    refreshButton: {
        padding: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
    },
    historyContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    emptyState: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#eee",
        borderStyle: "dashed",
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#999",
        marginTop: 4,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    emojiContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#f0f8ff",
        alignItems: "center",
        justifyContent: "center",
    },
    emoji: {
        fontSize: 24,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 13,
        color: "#888",
    },
    cardStats: {
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
        paddingLeft: 60, // Align with text
    },
    statBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    cardContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    transcriptLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: "#999",
        textTransform: "uppercase",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    transcriptText: {
        fontSize: 15,
        color: "#444",
        lineHeight: 22,
    },
    profileCard: {
        marginHorizontal: 20,
        backgroundColor: "white",
        borderRadius: 24,
        padding: 20,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 20,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: "#fff",
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    profileEmail: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    profileActions: {
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 16,
    },
});
