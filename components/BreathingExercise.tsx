import { colors } from '@/utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BLOB_SIZE = width * 1.5;

export default function BreathingExercise() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const progress = useSharedValue(0);
    const isInhaling = useSharedValue(true);
    const [instruction, setInstruction] = useState('Breathe in');

    useEffect(() => {
        const duration = 4000;
        progress.value = withRepeat(
            withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
            -1, // infinite
            true // reverse
        );
    }, []);

    useDerivedValue(() => {
        if (isInhaling.value && progress.value >= 0.95) {
            isInhaling.value = false;
            runOnJS(setInstruction)('Breathe out');
        } else if (!isInhaling.value && progress.value <= 0.05) {
            isInhaling.value = true;
            runOnJS(setInstruction)('Breathe in');
        }
    });

    const blobAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [50, -100]);
        const scale = interpolate(progress.value, [0, 1], [1, 1.15]);
        return {
            transform: [
                { translateY },
                { scale },
            ],
        };
    });

    const textAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 0.05, 0.95, 1], [0.5, 1, 1, 0.5]),
        };
    });

    // Face Animation - slightly look up/down or stretch
    const faceAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [0, -10]);
        const scaleY = interpolate(progress.value, [0, 1], [1, 1.05]);
        return {
            transform: [{ translateY }, { scaleY }]
        }
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 10 }]}
                onPress={() => router.back()}
                activeOpacity={0.7}
            >
                <BlurView intensity={100} tint="extraLight" style={styles.blurContent}>
                    <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
                </BlurView>
            </TouchableOpacity>

            <View style={styles.textContainer}>
                <Animated.Text style={[styles.instructionText, textAnimatedStyle]}>
                    {instruction}
                </Animated.Text>
            </View>

            <Animated.View style={[styles.blobContainer, blobAnimatedStyle]}>
                <View style={styles.blob} />
                <Animated.View style={[styles.faceContainer, faceAnimatedStyle]}>
                    <Svg height="100" width="160" viewBox="0 0 160 100">
                        {/* Left Eye */}
                        <Path
                            d="M 30 50 Q 50 65 70 50"
                            fill="none"
                            stroke="#5C5C5C"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                        {/* Right Eye */}
                        <Path
                            d="M 90 50 Q 110 65 130 50"
                            fill="none"
                            stroke="#5C5C5C"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                        {/* Mouth */}
                        <Path
                            d="M 40 80 Q 80 100 120 80"
                            fill="none"
                            stroke="#5C5C5C"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                    </Svg>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    textContainer: {
        marginTop: 100,
        alignItems: 'center',
        zIndex: 10,
    },
    instructionText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#4a4a4a',
        letterSpacing: 0.5,
    },
    blobContainer: {
        width: BLOB_SIZE,
        height: BLOB_SIZE,
        position: 'absolute',
        bottom: -BLOB_SIZE * 0.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    blob: {
        width: '100%',
        height: '100%',
        borderRadius: BLOB_SIZE / 2,
        backgroundColor: colors.teal,
    },
    faceContainer: {
        position: 'absolute',
        top: 50, // Adjust to place face on top of the blob
    },
    backButton: {
        position: 'absolute',
        left: 20,
        zIndex: 50,
        borderRadius: 50,
        overflow: 'hidden',
    },
    blurContent: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle fill
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
});
