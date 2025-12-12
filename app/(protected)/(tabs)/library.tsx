import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

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

    const handleSessionPress = (session: typeof SESSIONS[0]) => {
        router.push({
            pathname: '/meditate',
            params: { ...session },
        });
    };

    const handleRemindPress = () => {
        // console.log('Remind me pressed'); // Placeholder for reminder logic
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meditate</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    backButton: {
        padding: 4,
    },
    // Enhanced Header Title
    headerTitle: {
        fontSize: 28, // Bigger and bolder
        fontWeight: '800',
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    cardList: {
        gap: 20, // Increased gap for breathability
        marginBottom: 32,
    },
    card: {
        borderRadius: 24, // Softer, more modern radius
        overflow: 'visible', // Must be visible for shadow to show properly
        minHeight: 120,
        // Subtle Shadow for Depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 8,
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
    // Enhanced Card Title
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
    // Enhanced Duration Badge (Pill Shape)
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
    // Enhanced Group Title
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
    // Enhanced Remind Button (Pill shape, new primary color)
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
    // Enhanced Avatar Bubbles
    avatarBubble: {
        width: 48, // Slightly larger
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        borderWidth: 3, // Thicker white border
        borderColor: '#fff',
    }
});
