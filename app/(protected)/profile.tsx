import { Gradient } from "@/components/gradient";
import { db } from "@/utils/firebase";
import { logError, parseError } from "@/utils/errors";
import haptics from "@/utils/haptics";
import { Session } from "@/utils/types";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { BlurMask, Canvas, Circle } from "@shopify/react-native-skia";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

// Reusable Light Mode Card
const LightCard = ({ children, style }: { children: React.ReactNode, style?: any }) => (
    <View style={[styles.lightCard, style]}>
        {children}
    </View>
);

// Get app version from Constants
const appVersion = Constants.expoConfig?.version ?? '1.0.0';

export default function ProfileScreen() {
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();
    const isMounted = useRef(true);
    const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalDuration: 0,
        totalTokens: 0,
    });

    const [focusMode, setFocusMode] = useState(false);

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

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
            const sessionsRef = collection(db, "session");
            const q = query(sessionsRef, where("user_id", "==", user.id));
            const querySnapshot = await getDocs(q);

            if (!isMounted.current) return;

            const sessions: Session[] = [];
            querySnapshot.forEach((doc) => {
                sessions.push({ id: doc.id, ...doc.data() } as Session);
            });

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
            logError("ProfileScreen:fetchSessionData", e);
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    const handleSignOut = async () => {
        haptics.light();
        try {
            await signOut();
        } catch (e) {
            logError("ProfileScreen:handleSignOut", e);
            haptics.error();
            showAlert("Error", "Failed to sign out. Please try again.");
        }
    };

    const handleFocusModeToggle = (value: boolean) => {
        haptics.light();
        setFocusMode(value);
        // In a real app, this would persist the setting
    };

    return (
        <View style={styles.container}>
            {/* Soft Light Gradient Background at Top */}
            <View style={styles.headerBackground}>
                <Gradient position="top" isSpeaking={false} />
                <Canvas style={StyleSheet.absoluteFill}>
                    <Circle cx={width} cy={0} r={180} color="rgba(59, 130, 246, 0.15)">
                        <BlurMask blur={80} style="normal" />
                    </Circle>
                    <Circle cx={0} cy={100} r={140} color="rgba(147, 197, 253, 0.15)">
                        <BlurMask blur={60} style="normal" />
                    </Circle>
                </Canvas>
            </View>

            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    )}

                    {/* Profile Header Center - Refined */}
                    <Animated.View entering={FadeInDown.springify()} style={styles.headerSection}>
                        <View style={styles.avatarRing}>
                            <Image
                                source={user?.imageUrl}
                                style={styles.avatar}
                                contentFit="cover"
                            />
                        </View>

                        <View style={styles.userInfoContainer}>
                            <View style={styles.nameRow}>
                                <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" style={styles.verifiedIcon} />
                            </View>
                            <Text style={styles.userHandle}>{user?.primaryEmailAddress?.emailAddress}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.softButton}
                            onPress={() => showAlert("Coming Soon", "Edit Profile feature will be available in the next update.")}
                        >
                            <Text style={styles.softButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Overview Section */}
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsRow}>
                        <LightCard style={styles.statCard}>
                            <View style={styles.statIconBadge}>
                                <Ionicons name="chatbubbles" size={24} color="#3B82F6" />
                            </View>
                            <View>
                                <Text style={styles.statValue}>{stats.totalSessions}</Text>
                                <Text style={styles.statLabel}>Sessions</Text>
                            </View>
                        </LightCard>

                        <LightCard style={styles.statCard}>
                            <View style={[styles.statIconBadge, { backgroundColor: '#F0FDFA' }]}>
                                <Ionicons name="time" size={24} color="#0D9488" />
                            </View>
                            <View>
                                <Text style={styles.statValue}>{Math.floor(stats.totalDuration / 60)}m</Text>
                                <Text style={styles.statLabel}>Mindful Time</Text>
                            </View>
                        </LightCard>
                    </Animated.View>

                    {/* Settings Section */}
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <LightCard style={styles.settingsCard}>
                            {/* Focus Mode */}
                            <View style={styles.settingRow}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: '#ECFDF5' }]}>
                                        <Ionicons name="moon" size={20} color="#059669" />
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.settingLabel}>Focus Mode</Text>
                                        <Text style={styles.settingSubLabel}>{focusMode ? "On" : "Off"}</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={focusMode}
                                    onValueChange={handleFocusModeToggle}
                                    trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                                    thumbColor={"#fff"}
                                    ios_backgroundColor="#E5E7EB"
                                />
                            </View>

                            <View style={styles.settingDivider} />

                            {/* Voice & Audio */}
                            <TouchableOpacity
                                style={styles.settingRow}
                                onPress={() => showAlert("Coming Soon", "Voice Settings will be available shortly.")}
                            >
                                <View style={styles.rowLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: '#EFF6FF' }]}>
                                        <Ionicons name="mic" size={20} color="#3B82F6" />
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.settingLabel}>Voice & Audio</Text>
                                        <Text style={styles.settingSubLabel}>Volume: 80%</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>

                        </LightCard>
                    </Animated.View>

                    {/* Other Actions Card */}
                    <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 16 }}>
                        <LightCard style={styles.settingsCard}>
                            {/* Log Out */}
                            <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: '#FEF2F2' }]}>
                                        <Ionicons name="log-out" size={20} color="#EF4444" />
                                    </View>
                                    <Text style={[styles.settingLabel, { color: '#EF4444', marginLeft: 12 }]}>Log Out</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </LightCard>
                    </Animated.View>

                    <Text style={styles.versionText}>Version {appVersion}</Text>
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>

            {/* Modal */}
            <Modal
                transparent
                visible={alertConfig.visible}
                animationType="fade"
                onRequestClose={closeAlert}
            >
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={closeAlert}>
                        <View style={StyleSheet.absoluteFill} />
                    </TouchableWithoutFeedback>
                    <View style={styles.alertContainer}>
                        <BlurView intensity={80} tint="light" style={styles.alertBlur}>
                            <View style={styles.alertContent}>
                                <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                                <Text style={styles.alertMessage}>{alertConfig.message}</Text>
                            </View>
                            <View style={[styles.alertButtonsContainer, alertConfig.buttons.length > 2 && styles.alertButtonsVertical]}>
                                {alertConfig.buttons.map((btn, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.alertButton,
                                            alertConfig.buttons.length === 2 && index === 0 && styles.alertButtonBorderRight,
                                            alertConfig.buttons.length > 2 && index < alertConfig.buttons.length - 1 && styles.alertButtonBorderBottom,
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Premium light background
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400, // Gradient affects top portion
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 10,
    },
    avatarRing: {
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 64, // (120 + 8)/2
        marginBottom: 16,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    userInfoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    userName: {
        fontSize: 30, // Larger
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    verifiedIcon: {
        marginTop: 4,
    },
    userHandle: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    softButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 100,
        backgroundColor: '#EFF6FF', // Soft Blue
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    softButtonText: {
        color: '#2563EB', // Stronger Blue
        fontSize: 15,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    lightCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statCard: {
        flex: 1,
        aspectRatio: 1, // Make them square-ish
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIconBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
    },
    settingsCard: {
        padding: 0, // Reset padding for list
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    settingSubLabel: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 2,
    },
    settingDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 64, // Indent for standard iOS look
    },
    versionText: {
        textAlign: 'center',
        marginTop: 24,
        color: '#D1D5DB',
        fontSize: 13,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: 280,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
        color: '#000',
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
    },
    alertButtonBorderTop: {
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(60, 60, 67, 0.29)',
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
        color: '#007AFF',
        fontWeight: '400',
    },
    textBold: {
        fontWeight: '600',
    },
    textDestructive: {
        color: '#FF3B30',
        fontWeight: '600',
    },
});
