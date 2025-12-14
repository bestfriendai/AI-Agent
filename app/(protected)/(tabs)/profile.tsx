import { appwriteConfig, database, Session } from "@/utils/appwrite";
import { colors } from "@/utils/colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { BlurMask, Canvas, Circle } from "@shopify/react-native-skia";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions, // Kept for types if needed, but unused in logic now
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
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

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        buttons: [] as { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }[],
    });

    const showAlert = (title: string, message: string, buttons?: { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }[]) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons: buttons || [{ text: 'OK', style: 'default' }],
        });
    };

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

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
        showAlert(
            "Clear History",
            "Are you sure you want to clear all session history? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            closeAlert(); // Close first
                            setIsLoading(true);
                            await Promise.all(
                                sessionHistory.map(session =>
                                    database.deleteDocument(
                                        appwriteConfig.db,
                                        appwriteConfig.tables.session,
                                        session.$id
                                    )
                                )
                            );
                            setSessionHistory([]);
                            setStats({ totalSessions: 0, totalDuration: 0, totalTokens: 0 });
                            showAlert("Success", "History cleared successfully");
                        } catch (e) {
                            console.log("Error clearing sessions:", e);
                            showAlert("Error", "Failed to clear sessions");
                        } finally {
                            setIsLoading(false);
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
            showAlert("Error", "Failed to sign out");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Background Gradient (Top Half) - Static & Darker */}
            <View style={styles.headerBackground}>
                <LinearGradient
                    colors={['#2E3A68', '#202B55', '#131A3A']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <Canvas style={StyleSheet.absoluteFill}>
                    <Circle cx={width - 60} cy={20} r={140} color="rgba(255, 180, 80, 0.25)">
                        <BlurMask blur={60} style="normal" />
                    </Circle>
                    <Circle cx={width - 80} cy={160} r={120} color="rgba(150, 100, 255, 0.25)">
                        <BlurMask blur={70} style="normal" />
                    </Circle>
                    <Circle cx={width - 220} cy={60} r={100} color="rgba(255, 255, 255, 0.18)">
                        <BlurMask blur={50} style="normal" />
                    </Circle>
                </Canvas>
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

                        <TouchableOpacity
                            style={styles.editProfileButton}
                            onPress={() => showAlert("Coming Soon", "Edit Profile feature will be available in the next update.")}
                        >
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
                                        <Text style={styles.logoText}>GO</Text>
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

                        <TouchableOpacity
                            style={styles.settingRow}
                            onPress={() => showAlert("Coming Soon", "Focus Mode settings will be available shortly.")}
                        >
                            <Text style={styles.settingLabel}>Focus Mode</Text>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </TouchableOpacity>

                        <View style={styles.settingDivider} />

                        <TouchableOpacity
                            style={styles.settingRow}
                            onPress={() => showAlert("Coming Soon", "Voice Settings will be available shortly.")}
                        >
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

            {/* Custom iOS-style Modal */}
            <Modal
                transparent
                visible={alertConfig.visible}
                animationType="fade"
                onRequestClose={closeAlert}
            >
                <View style={styles.modalOverlay}>
                    {/* Dark/Blur Backdrop */}
                    <TouchableWithoutFeedback onPress={closeAlert}>
                        <View style={StyleSheet.absoluteFill} />
                    </TouchableWithoutFeedback>

                    <View style={styles.alertContainer}>
                        <BlurView intensity={80} tint="light" style={styles.alertBlur}>
                            <View style={styles.alertContent}>
                                <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                                <Text style={styles.alertMessage}>{alertConfig.message}</Text>
                            </View>

                            <View style={[
                                styles.alertButtonsContainer,
                                alertConfig.buttons.length > 2 && styles.alertButtonsVertical
                            ]}>
                                {alertConfig.buttons.map((btn, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.alertButton,
                                            alertConfig.buttons.length === 2 && index === 0 && styles.alertButtonBorderRight,
                                            alertConfig.buttons.length > 2 && index < alertConfig.buttons.length - 1 && styles.alertButtonBorderBottom,
                                            // Handle top border for first button if vertical or row
                                            index === 0 && styles.alertButtonBorderTop
                                        ]}
                                        onPress={() => {
                                            closeAlert();
                                            if (btn.onPress) btn.onPress();
                                        }}
                                    >
                                        <Text style={[
                                            styles.alertButtonText,
                                            btn.style === 'destructive' && styles.textDestructive,
                                            btn.style === 'cancel' && styles.textBold,
                                        ]}>
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </BlurView>
                    </View>
                </View>
            </Modal>
        </View >
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
        borderWidth: 2,
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
        borderWidth: 2,
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
        borderWidth: 2,
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
        marginTop: 10,
        paddingHorizontal: 24,
        marginBottom: 16,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 8,
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
        marginBottom: 12,
    },
    editProfileButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
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
        gap: 12,
        marginBottom: 12,
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
        height: 90,
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
    glassCardInnerAi: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    bannerContainer: {
        marginHorizontal: 24,
        marginBottom: 24,
    },
    banner: {
        borderRadius: 24,
        padding: 20,
        height: 120,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bannerContent: {
        justifyContent: 'center',
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111827',
        lineHeight: 28,
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
        fontSize: 28,
        fontWeight: '900',
        color: '#111827',
        lineHeight: 30,
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
        paddingBottom: 90,
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.18)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: 280,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Light background
    },
    alertBlur: {
        width: '100%',
        alignItems: 'center',
    },
    alertContent: {
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 20,
        alignItems: 'center',
    },
    alertTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
        textAlign: 'center',
    },
    alertMessage: {
        fontSize: 13,
        color: '#333',
        textAlign: 'center',
        lineHeight: 18,
    },
    alertButtonsContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    alertButtonsVertical: {
        flexDirection: 'column',
    },
    alertButton: {
        flex: 1,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(255,255,255,0.05)', // slight highlight
    },
    alertButtonBorderTop: {
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(60, 60, 67, 0.29)', // Standard iOS separator color
    },
    alertButtonBorderRight: {
        borderRightWidth: 0.5,
        borderRightColor: 'rgba(60, 60, 67, 0.29)',
    },
    alertButtonBorderBottom: {
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(60, 60, 67, 0.29)',
    },
    alertButtonText: {
        fontSize: 17,
        color: '#0A84FF', // iOS Blue
        fontWeight: '400',
    },
    textBold: {
        fontWeight: '600',
    },
    textDestructive: {
        color: '#FF453A', // iOS Red
        fontWeight: '600',
    },
});
