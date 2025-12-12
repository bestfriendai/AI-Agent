import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Enhanced data with slightly softer, more sophisticated colors
const SESSIONS = [
    {
        id: '1',
        title: 'Morning Focus',
        description: 'Start your day with clarity and purpose.',
        duration: '3 min',
        icon: 'sunny',
        // Softer Orange/Peach
        accentColor: '#FBBF24', // Yellow 500
        bgColor: '#FFFBEB', // Lightest Yellow bg
        iconColor: '#92400E',
        audioUri: 'https://repo-asset.vercel.app/assets/nature.mp3',
    },
    {
        id: '2',
        title: 'Deep Relax',
        description: 'For times when you really need a break.',
        duration: '5 min',
        icon: 'moon',
        // Softer Pink/Rose
        accentColor: '#F9A8D4', // Pink 300
        bgColor: '#FFF7FB', // Lightest Pink bg
        iconColor: '#9D174D',
        audioUri: 'https://repo-asset.vercel.app/assets/piano-music.mp3',
    },
    {
        id: '3',
        title: 'Anxiety Relief',
        description: 'Mindfulness tips to deepen your practice.',
        duration: '4 min',
        icon: 'leaf',
        // Softer Green/Teal
        accentColor: '#6EE7B7', // Emerald 300
        bgColor: '#F0FFF4', // Lightest Green bg
        iconColor: '#065F46',
        audioUri: 'https://repo-asset.vercel.app/assets/anxiety.ogg',
    },
    {
        id: '4',
        title: 'Sleep Well',
        description: 'Drift away into a peaceful slumber.',
        duration: '10 min',
        icon: 'bed',
        // Softer Purple/Lavender
        accentColor: '#C4B5FD', // Violet 300
        bgColor: '#FAF5FF', // Lightest Purple bg
        iconColor: '#5B21B6',
        audioUri: 'https://repo-asset.vercel.app/assets/sleep.mp3',
    },
];

export default function LibraryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // State for modal
    const [selectedSession, setSelectedSession] = useState<typeof SESSIONS[0] | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleSessionPress = (session: typeof SESSIONS[0]) => {
        setSelectedSession(session);
        setModalVisible(true);
    };

    const startSession = (withAudio: boolean) => {
        if (!selectedSession) return;
        setModalVisible(false);
        router.push({
            pathname: '/meditate',
            params: {
                ...selectedSession,
                playAudio: withAudio ? 'true' : 'false' // Pass as string param
            },
        });
    };

    const handleRemindPress = () => {
        // console.log('Remind me pressed'); // Placeholder for reminder logic
    };

    return (
        <View style={styles.container}>
            {/* iOS Premium Glass Header */}
            <BlurView
                intensity={90}
                tint="light"
                style={[styles.glassHeader, { paddingTop: insets.top }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.circleButton} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={20} color="#4B5563" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Meditate</Text>
                    <TouchableOpacity style={styles.circleButton} activeOpacity={0.7}>
                        <Ionicons name="search" size={20} color="#4B5563" />
                    </TouchableOpacity>
                </View>
            </BlurView>

            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 80 } // Push content down below header
                ]}
                showsVerticalScrollIndicator={false}
            >

                {/* Session List */}
                <View style={styles.cardList}>
                    {SESSIONS.map((session, index) => (
                        <Animated.View
                            key={session.id}
                            entering={FadeInDown.delay(index * 120).springify()}
                        >
                            <TouchableOpacity
                                style={[styles.card, { backgroundColor: session.bgColor }]}
                                activeOpacity={0.8}
                                onPress={() => handleSessionPress(session)}
                            >
                                <View style={styles.cardContent}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardTitle}>{session.title}</Text>
                                        <Text style={styles.cardDescription}>
                                            {session.description}
                                        </Text>
                                        {/* Updated Duration Badge */}
                                        <View style={styles.durationBadge}>
                                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                                            <Text style={styles.durationText}>{session.duration}</Text>
                                        </View>
                                    </View>

                                    {/* Illustrative graphic area */}
                                    <View style={styles.graphicContainer}>
                                        <View style={[styles.graphicCircle, { backgroundColor: session.accentColor }]}>
                                            <Ionicons name={session.icon as any} size={30} color={session.iconColor} />
                                        </View>
                                        <View style={[styles.graphicBlob, { backgroundColor: session.accentColor, opacity: 0.4 }]} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Group Meditation Section */}
                <Animated.View
                    entering={FadeInDown.delay(500).springify()}
                    style={styles.groupSection}
                >
                    <Text style={styles.groupTitle}>Group Meditation</Text>

                    <View style={styles.groupCard}>
                        <View style={styles.groupInfo}>
                            <Text style={styles.groupDescription}>
                                Join our live session to practice mindfulness together. Starts at 11:00 AM.
                            </Text>
                            <TouchableOpacity style={styles.remindButton} onPress={handleRemindPress}>
                                <Text style={styles.remindButtonText}>Remind me</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Group Graphic Placeholder */}
                        <View style={styles.groupGraphic}>
                            <View style={[styles.avatarBubble, { backgroundColor: '#FDBA74', bottom: 0, left: 0 }]}>
                                <Ionicons name="people-outline" size={24} color="#B45309" />
                            </View>
                            <View style={[styles.avatarBubble, { backgroundColor: '#A78BFA', top: 5, left: 30, zIndex: 10 }]}>
                                <Ionicons name="happy-outline" size={24} color="#4C51BF" />
                            </View>
                            <View style={[styles.avatarBubble, { backgroundColor: '#F472B6', bottom: 5, right: 0 }]}>
                                <Ionicons name="heart-outline" size={24} color="#BE185D" />
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Audio Option Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.alertContainer}>
                            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />

                            <View style={styles.alertContent}>
                                <Text style={styles.alertTitle}>Start Session</Text>
                                <Text style={styles.alertMessage}>Would you like to play background audio?</Text>
                            </View>

                            <View style={styles.alertButtons}>
                                <TouchableOpacity
                                    style={styles.alertButton}
                                    onPress={() => startSession(false)}
                                >
                                    <Text style={styles.alertButtonTextCancel}>No, Silent</Text>
                                </TouchableOpacity>

                                <View style={styles.alertButtonSeparator} />

                                <TouchableOpacity
                                    style={styles.alertButton}
                                    onPress={() => startSession(true)}
                                >
                                    <Text style={styles.alertButtonTextConfirm}>Play Audio</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    glassHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    headerContent: {
        height: 52, // Slightly taller
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)', // Subtle touch
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    largeTitle: {
        fontSize: 34,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 20,
        marginTop: 10,
        letterSpacing: 0.35,
    },
    cardList: {
        gap: 20, // Increased gap for breathability
        marginBottom: 32,
    },
    card: {
        borderRadius: 24, // Softer, more modern radius
        overflow: 'visible', // Must be visible for shadow to show properly
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden', // Keep content inside the rounded corners
        borderRadius: 24,
    },
    textContainer: {
        flex: 1,
        padding: 20,
        paddingRight: 8,
    },
    cardTitle: {
        fontSize: 20, // Slightly larger
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
        marginBottom: 16, // Increased space below description
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        backgroundColor: '#E5E7EB', // Light gray background
        alignSelf: 'flex-start', // Essential to wrap content
    },
    durationText: {
        fontSize: 13, // Slightly bigger text in badge
        color: '#4B5563',
        fontWeight: '600',
    },
    graphicContainer: {
        width: 100,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    graphicCircle: {
        width: 60, // Slightly larger
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    graphicBlob: {
        position: 'absolute',
        width: 90, // Slightly larger blob
        height: 90,
        borderRadius: 45,
        right: -25,
        bottom: -25,
        zIndex: 1,
    },
    groupSection: {
        marginTop: 8,
    },
    groupTitle: {
        fontSize: 24, // Bigger size for better section hierarchy
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 20, // More space below title
    },
    groupCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    groupInfo: {
        flex: 1,
        paddingRight: 16,
    },
    groupDescription: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 16,
        lineHeight: 24, // Better line height for readability
    },
    remindButton: {
        backgroundColor: '#4C51BF', // Deep Indigo/Purple
        paddingVertical: 14, // Taller button
        paddingHorizontal: 28, // Wider button
        borderRadius: 999, // Perfect pill shape
        alignSelf: 'flex-start',
    },
    remindButtonText: {
        color: '#fff',
        fontWeight: '700', // Bolder text
        fontSize: 16,
    },
    groupGraphic: {
        width: 110, // Wider graphic area
        height: 100,
        position: 'relative',
    },
    avatarBubble: {
        width: 48, // Slightly larger
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        borderWidth: 3, // Thicker white border
        borderColor: '#fff',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    alertContainer: {
        width: 270,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: 'rgba(245,245,245,0.85)', // Fallback if blur fails or enhances effect
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
        textAlign: 'center',
        marginBottom: 4,
    },
    alertMessage: {
        fontSize: 13,
        color: '#000',
        textAlign: 'center',
        lineHeight: 18,
    },
    alertButtons: {
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#3C3C4336', // Standard iOS separator color
    },
    alertButton: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertButtonSeparator: {
        width: StyleSheet.hairlineWidth,
        backgroundColor: '#3C3C4336',
        height: '100%',
    },
    alertButtonTextCancel: {
        fontSize: 17,
        color: '#007AFF', // iOS Blue
        fontWeight: '400',
    },
    alertButtonTextConfirm: {
        fontSize: 17,
        color: '#007AFF', // iOS Blue
        fontWeight: '600', // Bold for default action
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    }
});
