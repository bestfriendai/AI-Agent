import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ExerciseCompletionScreenProps {
    sessionTitle?: string;
    durationMinutes: number;
    accentColor?: string;
    achievement?: {
        title: string;
        description: string;
        icon: keyof typeof Ionicons.glyphMap;
    };
    onComplete: () => void;
}

export default function ExerciseCompletionScreen({
    sessionTitle = 'Breathing Exercise',
    durationMinutes,
    onComplete,
}: ExerciseCompletionScreenProps) {

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.95}
            onPress={onComplete}
        >
            {/* 1. Subtle Background Pattern */}
            <View style={styles.bgDecoration}>
                <LinearGradient
                    colors={['#F0F9FF', '#FFFFFF']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.blob1} />
                <View style={styles.blob2} />
                <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="light" />
            </View>

            {/* 2. Content */}
            <View style={styles.content}>

                {/* Trophy Section (Animated) */}
                <Animated.View
                    entering={ZoomIn.duration(700).springify()}
                    style={styles.trophyContainer}
                >
                    <View style={styles.trophyGlow} />
                    <Image
                        source={require('@/assets/images/gold_trophy.png')}
                        style={styles.trophyImage}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Text Content */}
                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    style={styles.header}
                >
                    <Text style={styles.title}>Session Complete</Text>
                    <Text style={styles.subtitle}>
                        You focused for <Text style={styles.highlightText}>{durationMinutes} minutes</Text>.
                        {"\n"}Well done taking this time.
                    </Text>
                </Animated.View>

                {/* Stats Section (Minimalist) */}
                {/* Stats Section (Premium Glass Pill) */}
                <Animated.View
                    entering={FadeInDown.delay(600).springify()}
                    style={styles.statsGlassPill}
                >
                    {/* Focus Time */}
                    <View style={styles.statGroup}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="time" size={20} color="#0EA5E9" />
                        </View>
                        <View>
                            <Text style={styles.statValueNew}>{durationMinutes}m</Text>
                            <Text style={styles.statLabelNew}>Focus</Text>
                        </View>
                    </View>

                    {/* Vertical Divider */}
                    <View style={styles.glassDivider} />

                    {/* Breaths */}
                    <View style={styles.statGroup}>
                        <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="leaf" size={20} color="#10B981" />
                        </View>
                        <View>
                            <Text style={styles.statValueNew}>~{durationMinutes * 6}</Text>
                            <Text style={styles.statLabelNew}>Breaths</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Footer Hint */}
                <View style={styles.footer}>
                    <Text style={styles.tapText}>Tap anywhere to continue</Text>
                </View>

            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    bgDecoration: {
        ...StyleSheet.absoluteFillObject,
    },
    blob1: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#E0F2FE',
    },
    blob2: {
        position: 'absolute',
        top: 200,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#F0FDF4',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingBottom: 100, // Significantly lift content up
    },

    // Trophy
    trophyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        zIndex: 10,
        position: 'relative', // Ensure layering
    },
    trophyImage: {
        width: 200,
        height: 200,
        zIndex: 10,
    },
    trophyGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FCD34D',
        opacity: 0.2, // increased slightly
        transform: [{ scale: 2 }], // larger soft glow
        zIndex: 0,
        // Add blurring for softness
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 26,
    },
    highlightText: {
        fontWeight: '700',
        color: '#0EA5E9',
    },

    // Stats (Premium Glass Pill)
    statsGlassPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 32,
        width: '100%',
        maxWidth: 340,
        // Soft Premium Shadow
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    statGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValueNew: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        fontVariant: ['tabular-nums'],
    },
    statLabelNew: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 2,
    },
    glassDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 16,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
    },
    tapText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 1,
        opacity: 0.8,
    },
});
