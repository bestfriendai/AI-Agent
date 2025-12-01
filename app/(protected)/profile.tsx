import { Gradient } from "@/components/gradient";
import { appwriteConfig, database, Session } from "@/utils/appwrite";
import { colors } from "@/utils/colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Query } from "react-native-appwrite";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();
    const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalDuration: 0,
        totalTokens: 0,
    });

    useEffect(() => {
        fetchSessionData();
    }, []);

    const fetchSessionData = async () => {
        if (!user) {
            return;
        }
        try {
            setIsLoading(true);
            const { documents } = await database.listDocuments(
                appwriteConfig.db,
                appwriteConfig.tables.session,
                [Query.equal("user_id", user.id)]
            );
            const sessions = documents as unknown as Session[];
            setSessionHistory(sessions);

            // Calculate stats
            const totalDuration = sessions.reduce(
                (acc, session) => acc + (session.call_duration_secs || 0),
                0
            );
            const totalTokens = sessions.reduce(
                (acc, session) => acc + (session.tokens || 0),
                0
            );

            setStats({
                totalSessions: sessions.length,
                totalDuration,
                totalTokens,
            });
        } catch (e) {
            console.log("Error fetching session data:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearAllSessions = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to clear all session history? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            for (const session of sessionHistory) {
                                await database.deleteDocument(
                                    appwriteConfig.db,
                                    appwriteConfig.tables.session,
                                    session.$id
                                );
                            }
                            setSessionHistory([]);
                            setStats({ totalSessions: 0, totalDuration: 0, totalTokens: 0 });
                            Alert.alert("Success", "History cleared successfully");
                        } catch (e) {
                            console.log("Error clearing sessions:", e);
                            Alert.alert("Error", "Failed to clear sessions");
                        }
                    },
                },
            ]
        );
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out");
        }
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <View style={styles.container}>
            <Gradient position="top" isSpeaking={false} />
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    style={styles.header}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="chevron-back" size={28} color="#1a1a1a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={{ width: 40 }} />
                </Animated.View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Profile Section */}
                    <Animated.View
                        entering={FadeInUp.delay(200).springify()}
                        style={styles.profileSection}
                    >
                        <View style={styles.avatarContainer}>
                            {user?.imageUrl ? (
                                <Image
                                    source={user.imageUrl}
                                    style={styles.avatar}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitial}>
                                        {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || "?"}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                            </View>
                        </View>
                        <Text style={styles.userName}>
                            {user?.firstName} {user?.lastName}
                        </Text>
                        <Text style={styles.userEmail}>
                            {user?.emailAddresses[0]?.emailAddress}
                        </Text>
                    </Animated.View>

                    {/* Stats Grid */}
                    <Animated.View
                        entering={FadeInUp.delay(300).springify()}
                        style={styles.statsGrid}
                    >
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="chatbubbles" size={24} color="#2196F3" />
                            </View>
                            <Text style={styles.statValue}>{stats.totalSessions}</Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#F3E5F5' }]}>
                                <Ionicons name="time" size={24} color="#9C27B0" />
                            </View>
                            <Text style={styles.statValue}>
                                {formatDuration(stats.totalDuration)}
                            </Text>
                            <Text style={styles.statLabel}>Time</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                                <Ionicons name="flash" size={24} color="#FF9800" />
                            </View>
                            <Text style={styles.statValue}>
                                {(stats.totalTokens / 1000).toFixed(1)}k
                            </Text>
                            <Text style={styles.statLabel}>Tokens</Text>
                        </View>
                    </Animated.View>

                    {/* Menu Groups */}
                    <Animated.View entering={FadeInUp.delay(400).springify()}>
                        <Text style={styles.sectionHeader}>Account</Text>
                        <View style={styles.menuGroup}>
                            <View style={styles.menuItem}>
                                <View style={[styles.menuIcon, { backgroundColor: '#F5F5F5' }]}>
                                    <Ionicons name="finger-print-outline" size={20} color="#666" />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuLabel}>User ID</Text>
                                    <Text style={styles.menuValue} numberOfLines={1}>
                                        {user?.id}
                                    </Text>
                                </View>
                                <Ionicons name="copy-outline" size={20} color="#C7C7CC" />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.menuItem}>
                                <View style={[styles.menuIcon, { backgroundColor: '#F5F5F5' }]}>
                                    <Ionicons name="calendar-outline" size={20} color="#666" />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuLabel}>Member Since</Text>
                                    <Text style={styles.menuValue}>
                                        {new Date(user?.createdAt || "").toLocaleDateString(undefined, {
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.sectionHeader}>Preferences</Text>
                        <View style={styles.menuGroup}>
                            <TouchableOpacity style={styles.menuItem}>
                                <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="mic-outline" size={20} color="#2196F3" />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuLabel}>Voice Settings</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.menuItem}>
                                <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
                                    <Ionicons name="moon-outline" size={20} color="#9C27B0" />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuLabel}>Appearance</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionHeader}>Support</Text>
                        <View style={styles.menuGroup}>
                            <TouchableOpacity style={styles.menuItem}>
                                <View style={[styles.menuIcon, { backgroundColor: '#E0F2F1' }]}>
                                    <Ionicons name="help-buoy-outline" size={20} color="#009688" />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuLabel}>Help & Support</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity style={styles.menuItem}>
                                <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuLabel}>Privacy Policy</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={clearAllSessions}
                            >
                                <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
                                    <Ionicons name="trash-outline" size={20} color={colors.red} />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={[styles.menuLabel, { color: colors.red }]}>Clear History</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.signOutButton}
                            onPress={handleSignOut}
                        >
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>

                        <Text style={styles.versionText}>Version 1.0.0</Text>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1a1a1a",
        letterSpacing: -0.5,
    },
    profileSection: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 32,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: "#fff",
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "#fff",
    },
    avatarInitial: {
        fontSize: 40,
        fontWeight: "700",
        color: "#fff",
    },
    verifiedBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 2,
    },
    userName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    userEmail: {
        fontSize: 15,
        color: "#666",
        fontWeight: "500",
    },
    statsGrid: {
        flexDirection: "row",
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        fontWeight: "600",
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginLeft: 32,
        marginBottom: 8,
    },
    menuGroup: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 24,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        paddingHorizontal: 16,
    },
    menuIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    menuValue: {
        fontSize: 13,
        color: "#8E8E93",
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: "#F2F2F7",
        marginLeft: 60,
    },
    signOutButton: {
        marginHorizontal: 16,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    signOutText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.red,
    },
    versionText: {
        textAlign: "center",
        marginTop: 24,
        fontSize: 13,
        color: "#8E8E93",
    },
});
