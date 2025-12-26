import { db } from "@/utils/firebase";
import { Session } from "@/utils/types";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HistorySection = {
    title: string;
    data: Session[];
};

export default function HistoryScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const router = useRouter();
    const [sections, setSections] = useState<HistorySection[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, [user]);

    const fetchSessions = async () => {
        if (!user) return;
        try {
            if (sections.length === 0) setLoading(true);

            const sessionsRef = collection(db, "session");
            const q = query(sessionsRef, where("user_id", "==", user.id));
            const querySnapshot = await getDocs(q);

            const sessions: Session[] = [];
            querySnapshot.forEach((doc) => {
                sessions.push({ id: doc.id, ...doc.data() } as Session);
            });

            sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            const grouped = groupSessions(sessions);
            setSections(grouped);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSessions();
    };

    const groupSessions = (sessions: Session[]): HistorySection[] => {
        const groups: { [key: string]: Session[] } = {
            "Today": [],
            "Yesterday": [],
            "This Week": [],
            "Earlier": []
        };

        const now = new Date();
        const todayStr = now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        sessions.forEach(session => {
            const date = new Date(session.created_at);
            const dateStr = date.toDateString();

            if (dateStr === todayStr) {
                groups["Today"].push(session);
            } else if (dateStr === yesterdayStr) {
                groups["Yesterday"].push(session);
            } else if (date > lastWeek) {
                groups["This Week"].push(session);
            } else {
                groups["Earlier"].push(session);
            }
        });

        return Object.entries(groups)
            .map(([title, data]) => ({ title, data }))
            .filter(section => section.data.length > 0);
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "0m";
        const mins = Math.floor(seconds / 60);
        // If less than a minute, show seconds, else show minutes
        if (mins === 0) return `${seconds}s`;
        return `${mins}m`;
    };

    const renderHeader = () => (
        <Animated.View
            entering={FadeInDown.duration(500).springify()}
            style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}
        >
            <Text style={styles.headerTitle}>History</Text>
            <Text style={styles.headerSubtitle}>Your conversations & explorations</Text>
        </Animated.View>
    );

    const renderEmptyState = () => (
        <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.emptyContainer}
        >
            <View style={styles.emptyIconCircle}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#999" />
            </View>
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptySubtitle}>Start a new conversation to see it here.</Text>
        </Animated.View>
    );

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <Animated.View
            entering={FadeInDown.springify()}
            style={styles.sectionHeader}
        >
            <Text style={styles.sectionTitle}>{title}</Text>
        </Animated.View>
    );

    const HistoryCard = ({ item, index }: { item: Session, index: number }) => {
        return (
            <Animated.View entering={FadeInRight.delay(index * 50).springify().damping(12)}>
                <Pressable
                    style={({ pressed }) => [
                        styles.card,
                        pressed && styles.cardPressed
                    ]}
                    onPress={() => {
                        router.push({
                            pathname: "/summary",
                            params: {
                                sessionId: item.id,
                                title: item.call_summary_title,
                                createdAt: item.created_at
                            }
                        });
                    }}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="mic-outline" size={20} color="#000" />
                        </View>
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.cardTitle} numberOfLines={1}>
                                {item.call_summary_title || "Untitled Session"}
                            </Text>
                            <Text style={styles.cardTime}>
                                {formatTime(item.created_at)}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    </View>

                    {item.transcript ? (
                        <Text style={styles.cardPreview} numberOfLines={2}>
                            {item.transcript}
                        </Text>
                    ) : null}

                    <View style={styles.cardFooter}>
                        <View style={styles.badge}>
                            <Ionicons name="time-outline" size={12} color="#666" />
                            <Text style={styles.badgeText}>
                                {formatDuration(item.call_duration_secs)}
                            </Text>
                        </View>
                        {item.tokens ? (
                            <View style={styles.badge}>
                                <Ionicons name="text-outline" size={12} color="#666" />
                                <Text style={styles.badgeText}>{item.tokens} tokens</Text>
                            </View>
                        ) : null}
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    if (loading && sections.length === 0) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="small" color="#000" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

            {renderHeader()}

            <SectionList<Session, HistorySection>
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <HistoryCard item={item} index={index} />}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 100 }
                ]}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7", // iOS System Gray 6
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#F2F2F7",
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: "700",
        color: "#000",
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "#8E8E93",
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    sectionHeader: {
        marginTop: 24,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#8E8E93",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        // Subtle iOS-like shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F2F2F7",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#000",
        marginBottom: 2,
    },
    cardTime: {
        fontSize: 13,
        color: "#8E8E93",
    },
    cardPreview: {
        fontSize: 15,
        color: "#3C3C43",
        lineHeight: 20,
        marginBottom: 14,
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    badgeText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 100,
        padding: 20,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#E5E5EA",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#000",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: "#8E8E93",
        textAlign: "center",
        lineHeight: 22,
    },
});
