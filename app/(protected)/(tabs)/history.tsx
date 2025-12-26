import { GlassBlur } from "@/components/GlassBlur";
import { PullToRefreshSectionList } from "@/components/PullToRefreshSectionList";
import { sessionThemes } from "@/utils/colors";
import { db } from "@/utils/firebase";
import { Session } from "@/utils/types";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HistorySection = {
    title: string;
    data: Session[];
};

const getSessionTheme = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % sessionThemes.length;
    return sessionThemes[index];
};

export default function HistoryScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const router = useRouter();
    const [sections, setSections] = useState<HistorySection[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

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
        }
    };

    const handleRefresh = async () => {
        await fetchSessions();
        setRefreshKey(prev => prev + 1);
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
        <GlassBlur
            intensity={90}
            style={[styles.glassHeader, { paddingTop: insets.top + 5 }]}
        >
            <View style={styles.headerContent}>
                <Text style={styles.headerTitleLarge}>History</Text>
                <View style={styles.headerRightButtons}>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="search" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarButton}>
                        {user?.imageUrl ? (
                            <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitial}>{user?.firstName?.[0] || "U"}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </GlassBlur>
    );

    const renderEmptyState = () => (
        <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
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
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    const HistoryCard = ({ item, index }: { item: Session, index: number }) => {
        return (
            <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                <Pressable
                    style={({ pressed }) => [
                        styles.cardContainer,
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
                    <View style={styles.cardContent}>
                        {/* LEFT SIDE: Text Content */}
                        <ScrollView
                            style={styles.cardLeft}
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.cardContextRow}>
                                <Text style={styles.cardContextText}>
                                    {new Date(item.created_at).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()} • {formatTime(item.created_at)} • {item.tokens || 0} TOKENS
                                </Text>
                            </View>

                            <Text style={styles.cardTitle}>
                                {item.call_summary_title || "Untitled Session"}
                            </Text>

                            <View style={styles.cardTagRow}>
                                <View style={styles.pillTag}>
                                    <Text style={styles.pillText}>{formatDuration(item.call_duration_secs)}</Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* RIGHT SIDE: Avatars/Visuals */}
                        <View style={styles.cardRight}>
                            <View style={styles.avatarCluster}>
                                {/* 1. Top Center (Topic/Generic) */}
                                <View style={[styles.avatarFrame, styles.avatarTopic]}>
                                    <Ionicons name="chatbubbles" size={18} color="#6B7280" />
                                </View>

                                {/* 2. Bottom Left (AI) */}
                                <View style={[styles.avatarFrame, styles.avatarAI]}>
                                    <Ionicons name="sparkles" size={18} color="#4F46E5" />
                                </View>

                                {/* 3. Bottom Right (User - Dominant) */}
                                <View style={[styles.avatarFrame, styles.avatarUser]}>
                                    <Image source={{ uri: user?.imageUrl }} style={styles.avatarImage} />
                                </View>

                                {/* 4. Floating Badge (Count) */}
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>+2</Text>
                                </View>
                            </View>
                        </View>
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

                {renderHeader()}

                <PullToRefreshSectionList
                    sections={sections}
                    keyExtractor={(item: any) => `${item.id}-${refreshKey}`}
                    renderItem={({ item, index }: any) => <HistoryCard item={item} index={index} />}
                    renderSectionHeader={renderSectionHeader}
                    onRefresh={handleRefresh}
                    contentContainerStyle={[
                        styles.listContent,
                        {
                            paddingBottom: insets.bottom + 100,
                            paddingTop: insets.top + 90
                        }
                    ]}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                    topOffset={insets.top + 80}
                />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    // Library-style Header
    glassHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.0)',
    },
    headerContent: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerTitleLarge: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 0.35,
    },
    headerRightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    moreButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Shared Avatar styles
    avatarButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
    },

    listContent: {
        paddingHorizontal: 20, // Match header padding (was 16)
    },
    sectionHeader: {
        marginBottom: 10,
        marginTop: 0, // More breathing room
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 1.2, // Slightly wider
    },

    // Clubhouse Card
    cardContainer: {
        backgroundColor: "#F9F8F4",
        borderRadius: 24,
        marginBottom: 16,
        padding: 24, // Increased padding for spacious feel
    },
    cardPressed: {
        opacity: 0.7, // Standard opacity feedback
    },
    cardContent: {
        flexDirection: 'row',
    },
    cardLeft: {
        flex: 1,
        paddingRight: 16,
        maxHeight: 150, // Limit height to enable internal scrolling
    },
    cardContextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    roomIcon: {
        width: 20,
        height: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContextText: {
        fontSize: 11,
        fontWeight: "800", // Extra Bold for small text
        color: "#6B7280", // Slightly darker gray
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    cardTitle: {
        fontSize: 19, // Slightly reduced for better flow
        fontWeight: "700",
        color: "#111827",
        lineHeight: 26,
        marginBottom: 14, // More space before tags
    },
    cardTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pillTag: {
        backgroundColor: "#EAE9E4",
        paddingHorizontal: 12,
        paddingVertical: 6, // Plumper pills
        borderRadius: 16,
    },
    pillText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#4B5563",
    },

    // Right side Avatars Cluster
    cardRight: {
        width: 80, // Slightly wider for cluster
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCluster: {
        width: 70,
        height: 70,
        position: 'relative',
    },
    avatarFrame: {
        width: 40,
        height: 40,
        borderRadius: 16,
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#F9F8F4', // Match card bg for cutout effect
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    // 1. Top Bubble
    avatarTopic: {
        backgroundColor: '#E5E7EB', // Gray 200
        top: 0,
        left: 15, // Centered horizontally relative to width 70
        zIndex: 1,
    },
    // 2. Bottom Left Bubble
    avatarAI: {
        backgroundColor: '#E0E7FF', // Indigo 100
        bottom: 0,
        left: 0,
        zIndex: 2,
    },
    // 3. Bottom Right Bubble
    avatarUser: {
        backgroundColor: '#FCE7F3', // Pink 100
        bottom: 5,
        right: 0,
        zIndex: 3,
        width: 44, // Make user slightly larger
        height: 44,
        borderRadius: 18,
    },
    // 4. Count Badge
    countBadge: {
        position: 'absolute',
        bottom: -4,
        left: 20,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        zIndex: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    countText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#4B5563',
    },

    // Empty State
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
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700", // Bolder
        color: "#111827",
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
    },
});
