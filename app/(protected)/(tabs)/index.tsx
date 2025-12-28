/**
 * Home Screen
 * Displays session carousel and recent history
 */

import ParallaxScrollView, { blurhash } from "@/components/ParallaxScrollView";
import { SessionCardSkeleton, HorizontalSessionSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/utils/colors";
import { db } from "@/utils/firebase";
import { sessions } from "@/utils/sessions";
import { Session } from "@/utils/types";
import { logError, parseError } from "@/utils/errors";
import haptics from "@/utils/haptics";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { useEffect, useCallback, useState, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Stable emoji mapping based on session ID
const EMOJIS = ["🌱", "🏄", "⛅", "🌙", "🗻", "☁️", "🐚", "🌸", "✨", "🕊️"];
function getEmojiForId(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return EMOJIS[Math.abs(hash) % EMOJIS.length];
}

interface FetchState {
    isLoading: boolean;
    error: string | null;
}

export default function Index(): JSX.Element {
    const router = useRouter();
    const { user } = useUser();
    const isMounted = useRef(true);

    const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
    const [fetchState, setFetchState] = useState<FetchState>({
        isLoading: true,
        error: null,
    });

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Fetch sessions on mount
    useEffect(() => {
        fetchSessions();
    }, [user?.id]);

    const fetchSessions = useCallback(async (): Promise<void> => {
        if (!user) {
            setFetchState({ isLoading: false, error: null });
            return;
        }

        try {
            setFetchState((prev) => ({ ...prev, isLoading: true, error: null }));

            const sessionsRef = collection(db, "session");
            const q = query(
                sessionsRef,
                where("user_id", "==", user.id),
                orderBy("created_at", "desc"),
                limit(10)
            );
            const querySnapshot = await getDocs(q);

            const fetchedSessions: Session[] = [];
            querySnapshot.forEach((doc) => {
                fetchedSessions.push({ id: doc.id, ...doc.data() } as Session);
            });

            if (isMounted.current) {
                setSessionHistory(fetchedSessions);
                setFetchState({ isLoading: false, error: null });
            }
        } catch (e) {
            logError("HomeScreen:fetchSessions", e);
            const parsedError = parseError(e);

            if (isMounted.current) {
                setFetchState({
                    isLoading: false,
                    error: parsedError.message,
                });
            }
        }
    }, [user]);

    const handleRefresh = useCallback((): void => {
        haptics.light();
        fetchSessions();
    }, [fetchSessions]);

    const handleSessionPress = useCallback((sessionId: number): void => {
        haptics.light();
        router.navigate({
            pathname: "/session/[sessionId]",
            params: { sessionId },
        });
    }, [router]);

    const handleHistoryPress = useCallback((sessionId: string): void => {
        haptics.light();
        router.push({
            pathname: "/summary",
            params: { sessionId },
        });
    }, [router]);

    return (
        <ParallaxScrollView>
            {/* Sessions Carousel Section */}
            <Text style={styles.title} accessibilityRole="header">
                Explore Sessions
            </Text>

            <FlashList<typeof sessions[0]>
                data={sessions}
                renderItem={({ item: session }) => (
                    <SessionCarouselItem
                        session={session}
                        onPress={() => handleSessionPress(session.id)}
                    />
                )}
                estimatedItemSize={266}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContainer}
                ItemSeparatorComponent={() => <View style={styles.carouselSeparator} />}
            />

            {/* Recent History Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle} accessibilityRole="header">
                    Recent History
                </Text>
                <Pressable
                    onPress={handleRefresh}
                    disabled={fetchState.isLoading}
                    style={({ pressed }) => [
                        styles.refreshButton,
                        pressed && styles.refreshButtonPressed,
                        fetchState.isLoading && styles.refreshButtonDisabled,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh history"
                    accessibilityState={{ disabled: fetchState.isLoading }}
                >
                    <Ionicons
                        name={fetchState.isLoading ? "reload" : "refresh"}
                        size={20}
                        color={colors.primary}
                    />
                </Pressable>
            </View>

            <View style={styles.historyContainer}>
                {fetchState.isLoading && sessionHistory.length === 0 ? (
                    // Loading skeletons
                    <>
                        <SessionCardSkeleton />
                        <SessionCardSkeleton />
                        <SessionCardSkeleton />
                    </>
                ) : fetchState.error ? (
                    // Error state
                    <EmptyState
                        type="error"
                        message={fetchState.error}
                        actionLabel="Try Again"
                        onAction={handleRefresh}
                    />
                ) : sessionHistory.length > 0 ? (
                    // Session cards
                    sessionHistory.map((session, index) => (
                        <Animated.View
                            key={session.id}
                            entering={FadeInDown.delay(index * 80).springify()}
                        >
                            <SessionCard
                                session={session}
                                onPress={() => handleHistoryPress(session.id)}
                            />
                        </Animated.View>
                    ))
                ) : (
                    // Empty state
                    <EmptyState
                        type="no-history"
                        actionLabel="Start a Session"
                        onAction={() => {
                            haptics.light();
                            router.navigate({
                                pathname: "/session/[sessionId]",
                                params: { sessionId: 1 },
                            });
                        }}
                    />
                )}
            </View>

            {/* Bottom spacer for tab bar */}
            <View style={styles.bottomSpacer} />
        </ParallaxScrollView>
    );
}

/**
 * Session Carousel Item Component
 */
interface SessionCarouselItemProps {
    session: typeof sessions[0];
    onPress: () => void;
}

function SessionCarouselItem({ session, onPress }: SessionCarouselItemProps): JSX.Element {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (): void => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = (): void => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    return (
        <AnimatedPressable
            style={[styles.sessionContainer, animatedStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="button"
            accessibilityLabel={`${session.title} - ${session.description}`}
        >
            <Image
                source={session.image}
                style={styles.sessionImage}
                contentFit="cover"
                transition={300}
                placeholder={{ blurhash }}
            />
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.6)"]}
                style={styles.sessionGradient}
            >
                <Text style={styles.sessionTitle}>{session.title}</Text>
            </LinearGradient>
        </AnimatedPressable>
    );
}

/**
 * Session History Card Component
 */
interface SessionCardProps {
    session: Session;
    onPress: () => void;
}

function SessionCard({ session, onPress }: SessionCardProps): JSX.Element {
    const scale = useSharedValue(1);
    const emoji = getEmojiForId(session.id);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (): void => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = (): void => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const formatDuration = (seconds: number | undefined): string => {
        if (!seconds) return "0s";
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    };

    return (
        <AnimatedPressable
            style={[styles.card, animatedStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="button"
            accessibilityLabel={`${session.call_summary_title || "Session"}, ${formatDuration(session.call_duration_secs)}`}
        >
            <View style={styles.cardHeader}>
                <View style={styles.emojiContainer}>
                    <Text style={styles.emoji}>{emoji}</Text>
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
                            minute: "2-digit",
                        })}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>

            <View style={styles.cardStats}>
                <View style={styles.statBadge}>
                    <Ionicons name="time-outline" size={12} color="#666" />
                    <Text style={styles.statText}>
                        {formatDuration(session.call_duration_secs)}
                    </Text>
                </View>
                {session.tokens && (
                    <View style={styles.statBadge}>
                        <Ionicons name="chatbubble-outline" size={12} color="#666" />
                        <Text style={styles.statText}>{session.tokens} tokens</Text>
                    </View>
                )}
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "700",
        padding: 16,
        color: "#1a1a1a",
    },
    carouselContainer: {
        paddingHorizontal: 16,
    },
    carouselSeparator: {
        width: 16,
    },
    sessionContainer: {
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
    },
    sessionImage: {
        width: 250,
        height: 140,
        borderRadius: 16,
    },
    sessionGradient: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 16,
        justifyContent: "flex-end",
        paddingBottom: 16,
    },
    sessionTitle: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        color: "white",
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
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
        backgroundColor: colors.gray6,
        borderRadius: 20,
    },
    refreshButtonPressed: {
        opacity: 0.7,
    },
    refreshButtonDisabled: {
        opacity: 0.5,
    },
    historyContainer: {
        paddingHorizontal: 20,
        gap: 16,
        minHeight: 200,
    },
    card: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.gray5,
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
        paddingLeft: 60,
    },
    statBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: colors.gray6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    bottomSpacer: {
        height: 100,
    },
});
