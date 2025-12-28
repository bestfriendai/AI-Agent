import { db } from "@/utils/firebase";
import { logError } from "@/utils/errors";
import haptics from "@/utils/haptics";
import { Session } from "@/utils/types";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

const COLORS = {
    bg: '#FFFFFF',
    card: '#FAFAFA',
    cardBorder: '#E4E4E7',
    primary: '#09090B',
    secondary: '#71717A',
    accent: '#3B82F6',
    danger: '#EF4444',
    success: '#10B981',
};

const BentoCard = ({ children, style, delay = 0, colSpan = 1 }: any) => (
    <Animated.View
        entering={FadeInUp.delay(delay)}
        style={[
            styles.bentoCard,
            { flex: colSpan },
            style
        ]}
    >
        {children}
    </Animated.View>
);

const ActivityBar = ({ height, label, active }: any) => (
    <View style={styles.activityBarContainer}>
        <View style={[styles.activityBar, { height, backgroundColor: active ? COLORS.accent : '#E4E4E7' }]} />
        <Text style={[styles.activityLabel, active && { color: COLORS.primary }]}>{label}</Text>
    </View>
);

const SettingsModal = ({ visible, onClose, signOut, privacyMode, setPrivacyMode }: any) => {
    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
                <Animated.View entering={FadeInUp} style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Preferences</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                            <Ionicons name="close" size={20} color="#52525b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.settingRow}>
                        <View style={styles.settingIconBox}>
                            <Ionicons name="eye-off-outline" size={22} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.settingLabel}>Incognito Mode</Text>
                            <Text style={styles.settingSub}>Hide activity from friends</Text>
                        </View>
                        <Switch
                            value={privacyMode}
                            onValueChange={(v) => {
                                haptics.light();
                                setPrivacyMode(v);
                            }}
                            trackColor={{ false: '#E4E4E7', true: COLORS.accent }}
                            thumbColor={"#FFFFFF"}
                            ios_backgroundColor="#E4E4E7"
                        />
                    </View>

                    <View style={{ height: 1, backgroundColor: '#E4E4E7', marginVertical: 24 }} />

                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={() => {
                            haptics.warning();
                            signOut();
                        }}
                    >
                        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default function ProfileScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { signOut } = useAuth();
    const insets = useSafeAreaInsets();
    const isMounted = useRef(true);

    const [stats, setStats] = useState({
        totalSessions: 0,
        totalDurationMinutes: 0,
        averageDurationMinutes: 0,
        currentStreak: 0,
        dailyActivity: [0, 0, 0, 0, 0, 0, 0],
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const parseDate = (date: any): Date => {
        if (!date) return new Date();
        if (typeof date.toDate === 'function') return date.toDate(); // Firestore Timestamp
        if (date.seconds) return new Date(date.seconds * 1000); // Raw Timestamp object
        return new Date(date); // ISO string or Date
    };

    const calculateStreak = useCallback((sessions: Session[]) => {
        if (!sessions.length) return 0;

        const uniqueDates = Array.from(new Set(sessions.map(s => {
            const date = parseDate(s.created_at);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        }))).sort((a, b) => b - a);

        let streak = 0;
        const today = new Date();
        const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

        const hasToday = uniqueDates.includes(todayReset);
        const yesterdayReset = todayReset - 86400000;
        const hasYesterday = uniqueDates.includes(yesterdayReset);

        if (!hasToday && !hasYesterday) return 0;

        let checkTime = hasToday ? todayReset : yesterdayReset;

        while (uniqueDates.includes(checkTime)) {
            streak++;
            checkTime -= 86400000;
        }

        return streak;
    }, []);

    const calculateDailyActivity = useCallback((sessions: Session[]) => {
        const activity = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        sessions.forEach(s => {
            const sessionDate = parseDate(s.created_at);
            if (sessionDate >= monday) {
                let dayIndex = sessionDate.getDay() - 1;
                if (dayIndex === -1) dayIndex = 6;

                const durationMins = (s.call_duration_secs || 0) / 60;
                activity[dayIndex] += durationMins;
            }
        });

        const maxVal = Math.max(...activity, 1);
        return activity.map(v => (v / maxVal) * 80);
    }, []);

    const processSessions = useCallback((sessions: Session[]) => {
        const totalSessions = sessions.length;
        const totalDurationSecs = sessions.reduce((acc, s) => acc + (s.call_duration_secs || 0), 0);

        setStats({
            totalSessions,
            totalDurationMinutes: Math.floor(totalDurationSecs / 60),
            averageDurationMinutes: totalSessions > 0 ? Math.round((totalDurationSecs / 60) / totalSessions) : 0,
            currentStreak: calculateStreak(sessions),
            dailyActivity: calculateDailyActivity(sessions),
        });
    }, [calculateStreak, calculateDailyActivity]);

    useEffect(() => {
        if (!user) return;

        setIsRefreshing(true);
        const sessionsRef = collection(db, "session");
        const q = query(sessionsRef, where("user_id", "==", user.id));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!isMounted.current) return;

            const sessions: Session[] = [];
            querySnapshot.forEach((doc) => sessions.push({ id: doc.id, ...doc.data() } as Session));
            processSessions(sessions);
            setIsRefreshing(false);
        }, (error) => {
            logError("ProfileScreen:onSnapshot", error);
            if (isMounted.current) {
                setIsRefreshing(false);
            }
        });

        return () => unsubscribe();
    }, [user, processSessions]);

    const onRefresh = () => {
        haptics.light();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handleSignOut = async () => {
        haptics.light();
        try {
            await signOut();
        } catch (e) {
            logError("ProfileScreen:handleSignOut", e);
            haptics.error();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => setSettingsVisible(true)}
                >
                    <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >

                <Animated.View entering={FadeInDown.duration(600)} style={styles.identityRow}>
                    <Image source={user?.imageUrl} style={styles.avatar} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
                        <Text style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
                    </View>
                    <View style={styles.proBadge}>
                        <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                </Animated.View>

                <View style={styles.gridContainer}>
                    <View style={styles.gridRow}>
                        <BentoCard colSpan={2} delay={100} style={{ backgroundColor: COLORS.card }}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="time" size={16} color={COLORS.secondary} />
                                <Text style={styles.cardLabel}>TIME FOCUSED</Text>
                            </View>
                            <View style={styles.timeContent}>
                                <Text style={styles.timeValue}>{stats.totalDurationMinutes}</Text>
                                <Text style={styles.timeUnit}>min</Text>
                            </View>
                        </BentoCard>

                        <BentoCard colSpan={1} delay={200} style={{ backgroundColor: '#F4F4F5', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="flame" size={24} color={COLORS.danger} />
                            <Text style={[styles.cardValue, { marginTop: 8 }]}>{stats.currentStreak}</Text>
                            <Text style={styles.cardLabelBottom}>STREAK</Text>
                        </BentoCard>
                    </View>

                    <View style={styles.gridRow}>
                        <BentoCard colSpan={3} delay={300} style={{ height: 160 }}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="bar-chart" size={16} color={COLORS.secondary} />
                                <Text style={styles.cardLabel}>WEEKLY ACTIVITY</Text>
                            </View>
                            <View style={styles.chartContainer}>
                                <ActivityBar height={Math.max(stats.dailyActivity[0], 10)} label="M" active={new Date().getDay() === 1} />
                                <ActivityBar height={Math.max(stats.dailyActivity[1], 10)} label="T" active={new Date().getDay() === 2} />
                                <ActivityBar height={Math.max(stats.dailyActivity[2], 10)} label="W" active={new Date().getDay() === 3} />
                                <ActivityBar height={Math.max(stats.dailyActivity[3], 10)} label="T" active={new Date().getDay() === 4} />
                                <ActivityBar height={Math.max(stats.dailyActivity[4], 10)} label="F" active={new Date().getDay() === 5} />
                                <ActivityBar height={Math.max(stats.dailyActivity[5], 10)} label="S" active={new Date().getDay() === 6} />
                                <ActivityBar height={Math.max(stats.dailyActivity[6], 10)} label="S" active={new Date().getDay() === 0} />
                            </View>
                        </BentoCard>
                    </View>

                    <View style={styles.gridRow}>
                        <BentoCard colSpan={1} delay={400}>
                            <Text style={styles.cardValueSmall}>{stats.totalSessions}</Text>
                            <Text style={styles.cardLabelBottom}>SESSIONS</Text>
                        </BentoCard>
                        <BentoCard colSpan={1} delay={500}>
                            <Text style={styles.cardValueSmall}>{stats.averageDurationMinutes}m</Text>
                            <Text style={styles.cardLabelBottom}>AVG TIME</Text>
                        </BentoCard>
                        <BentoCard colSpan={1} delay={600} style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent }}>
                            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                        </BentoCard>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            haptics.light();
                            router.push('/(protected)/(tabs)/history');
                        }}
                    >
                        <Text style={styles.menuText}>History & Logs</Text>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.secondary} />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            haptics.success();
                        }}
                    >
                        <Text style={styles.menuText}>Achievements</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontSize: 12, color: COLORS.secondary }}>Coming Soon</Text>
                            <Ionicons name="lock-closed-outline" size={14} color={COLORS.secondary} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            haptics.light();
                            setSettingsVisible(true);
                        }}
                    >
                        <Text style={styles.menuText}>Preferences</Text>
                        <Ionicons name="settings-outline" size={16} color={COLORS.secondary} />
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <SettingsModal
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
                signOut={handleSignOut}
                privacyMode={privacyMode}
                setPrivacyMode={setPrivacyMode}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.primary,
    },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    identityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
        borderWidth: 2,
        borderColor: COLORS.cardBorder,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.primary,
    },
    userEmail: {
        fontSize: 14,
        color: COLORS.secondary,
    },
    proBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#FDE047',
        borderRadius: 4,
    },
    proBadgeText: {
        color: '#000',
        fontWeight: '800',
        fontSize: 10,
    },
    gridContainer: {
        gap: 12,
        marginBottom: 30,
    },
    gridRow: {
        flexDirection: 'row',
        gap: 12,
    },
    bentoCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    cardLabel: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    timeContent: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    timeValue: {
        color: COLORS.primary,
        fontSize: 36,
        fontWeight: '700',
    },
    timeUnit: {
        color: COLORS.secondary,
        fontSize: 16,
        marginLeft: 4,
        fontWeight: '600',
    },
    cardLabelBottom: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },
    cardValue: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: '700',
    },
    cardValueSmall: {
        color: COLORS.primary,
        fontSize: 20,
        fontWeight: '700',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 90,
        paddingBottom: 4,
    },
    activityBarContainer: {
        alignItems: 'center',
        gap: 8,
    },
    activityBar: {
        width: 6,
        borderRadius: 3,
        backgroundColor: '#E4E4E7',
    },
    activityLabel: {
        color: COLORS.secondary,
        fontSize: 10,
        fontWeight: '600',
    },
    menuContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    menuText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.cardBorder,
        marginHorizontal: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    modalTitle: {
        color: COLORS.primary,
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    modalCloseBtn: {
        width: 32,
        height: 32,
        backgroundColor: '#F4F4F5',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F4F4F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabel: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    settingSub: {
        color: COLORS.secondary,
        fontSize: 13,
        marginTop: 2,
    },
    logoutBtn: {
        flexDirection: 'row',
        backgroundColor: '#FEF2F2',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        color: COLORS.danger,
        fontWeight: '700',
        fontSize: 16,
    },
});
