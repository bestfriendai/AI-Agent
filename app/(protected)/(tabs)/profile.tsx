import { appwriteConfig, database, Session } from "@/utils/appwrite";
import { colors } from "@/utils/colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Query } from "react-native-appwrite";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

// Reusable Glass Card Component (Matching "Siora" Home Page Badge Style)
const GlassCard = ({ children, style, intensity = 40 }: { children: React.ReactNode, style?: any, intensity?: number }) => (
    <View style={[styles.glassCardWrapper, style]}>
        <BlurView intensity={intensity} tint="dark" style={styles.glassCardInner}>
            {children}
        </BlurView>
    </View>
);

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

    return (
        <View style={styles.container}>
            {/* Header Background Gradient (Top Half) - Static & Darker */}
            <View style={styles.headerBackground}>
                <LinearGradient
                    colors={['#1e3a8a', '#172554', '#0f172a']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                {/* New Pattern: Concentric Rings */}
                <View style={styles.ring1} />
                <View style={styles.ring2} />
                <View style={styles.ring3} />
            </View>

            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Loading State Overlay */}
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    )}

                    {/* Header Section */}
                    <Animated.View entering={FadeInDown.springify()} style={styles.headerSection}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarRing}>
                                <Image
                                    source={user?.imageUrl}
                                    style={styles.avatar}
                                    contentFit="cover"
                                />
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={22} color="#60A5FA" />
                            </View>
                        </View>

                        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                        <Text style={styles.userHandle}>{user?.primaryEmailAddress?.emailAddress}</Text>

                        <TouchableOpacity style={styles.editProfileButton}>
                            <Text style={styles.editProfileText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Stats Section */}
                    <Text style={styles.sectionTitle}>My Goals</Text>
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsRow}>
                        <GlassCard style={styles.statCard}>
                            <View style={styles.statTop}>
                                <Text style={styles.statValue}>{stats.totalSessions}</Text>
                                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
                            </View>
                            <Text style={styles.statLabel}>Total Sessions</Text>
                        </GlassCard>

                        <GlassCard style={styles.statCard}>
                            <View style={styles.statTop}>
                                <Text style={styles.statValue}>{Math.floor(stats.totalDuration / 60)}m</Text>
                                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
                            </View>
                            <Text style={styles.statLabel}>Mindful Minutes</Text>
                        </GlassCard>
                    </Animated.View>

                    {/* Exclusive Widgets Banner - Less Saturated */}
                    <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.bannerContainer}>
                        <LinearGradient
                            colors={['#facc15', '#ca8a04']} // Slightly less neon yellow/gold
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.banner}
                        >
                            <View style={styles.bannerContent}>
                                <Text style={styles.bannerTitle}>exclusive</Text>
                                <View style={styles.bannerRow}>
                                    <View style={styles.logoBadge}>
                                        <Text style={styles.logoText}>GD</Text>
                                    </View>
                                    <Text style={styles.bannerSubtitle}>widgets</Text>
                                </View>
                            </View>
                            <View style={styles.bannerImage}>
                                <Ionicons name="phone-portrait" size={60} color="#1F2937" />
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Bottom Sheet (White Background) */}
                    <View style={styles.bottomSheet}>
                        <Text style={styles.bottomSheetHeader}>Preferences & Settings</Text>

                        <TouchableOpacity style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Focus Mode</Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </TouchableOpacity>

                        <View style={styles.settingDivider} />

                        <TouchableOpacity style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Voice Settings</Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </TouchableOpacity>

                        <View style={styles.settingDivider} />

                        <TouchableOpacity style={styles.settingRow} onPress={clearAllSessions}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="trash-outline" size={20} color={colors.red} />
                                <Text style={[styles.settingLabel, { color: colors.red, marginLeft: 12 }]}>Clear History</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </TouchableOpacity>

                        <View style={styles.settingDivider} />

                        <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="log-out-outline" size={20} color={colors.red} />
                                <Text style={[styles.settingLabel, { color: colors.red, marginLeft: 12 }]}>Log Out</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </TouchableOpacity>

                        <Text style={styles.versionText}>Version 1.0.2</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3B82F6',
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, // Cover full screen
        height: '100%',
    },
    // Concentric Ring Pattern
    ring1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        opacity: 0.8,
    },
    ring2: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        opacity: 0.6,
    },
    ring3: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        opacity: 0.4,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 60,
    },
    headerSection: {
        marginTop: 20,
        paddingHorizontal: 24,
        marginBottom: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
        position: 'relative',
    },
    avatarRing: {
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 60,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    userName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    userHandle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 20,
    },
    editProfileButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    editProfileText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 16,
        marginBottom: 16,
    },
    glassCardWrapper: {
        overflow: 'hidden',
        borderRadius: 20,
    },
    glassCardInner: {
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.08)', // From Siora Badge
        flex: 1, // Ensure it fills the wrapper
    },
    statCard: {
        flex: 1,
        height: 100,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)', // From Siora Badge
        borderRadius: 20, // Move borderRadius here safely
    },
    statTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    statLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    aiButton: {
        marginHorizontal: 24,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    aiContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    aiText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    glassCardInnerAi: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    bannerContainer: {
        marginHorizontal: 24,
        marginBottom: 32,
    },
    banner: {
        borderRadius: 24,
        padding: 24,
        height: 140,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bannerContent: {
        justifyContent: 'center',
    },
    bannerTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#111827',
        lineHeight: 36,
        letterSpacing: -1,
    },
    bannerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    logoBadge: {
        backgroundColor: '#111827',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
    },
    logoText: {
        color: '#FDE047',
        fontWeight: '900',
        fontSize: 16,
    },
    bannerSubtitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#111827',
        lineHeight: 36,
        letterSpacing: -1,
    },
    bannerImage: {
        opacity: 0.8,
    },
    bottomSheet: {
        backgroundColor: '#fffffff9',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        minHeight: 400,
    },
    bottomSheetHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 24,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    settingDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    versionText: {
        textAlign: 'center',
        marginTop: 32,
        color: '#9CA3AF',
        fontSize: 13,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});
