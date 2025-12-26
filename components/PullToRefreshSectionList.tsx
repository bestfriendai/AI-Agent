import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    SectionList,
    SectionListProps,
    StyleSheet,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    type SharedValue
} from "react-native-reanimated";

// ----------------------------------------------------------------------
// Reusable Types & Interfaces
// ----------------------------------------------------------------------

interface PullToRefreshSectionListProps<ItemT, SectionT>
    extends SectionListProps<ItemT, SectionT> {
    onRefresh: () => Promise<void>;
    topOffset?: number;
    refreshColor?: string;
}

// ----------------------------------------------------------------------
// Constants / Config
// ----------------------------------------------------------------------

const PULL_THRESHOLD = 90;
const REFRESH_HEIGHT = 70;
const SPRING_CONFIG = {
    damping: 30, // Higher damping = less oscillation
    stiffness: 100,
    mass: 1,
    overshootClamping: true, // No bouncing past the target
};

// ----------------------------------------------------------------------
// Internal Components
// ----------------------------------------------------------------------

const RefreshIndicator = ({
    pullY,
    state,
    topOffset,
    refreshColor,
}: {
    pullY: SharedValue<number>;
    state: "idle" | "pulling" | "refreshing" | "done";
    topOffset: number;
    refreshColor: string;
}) => {
    // 1. Container Style (Position & Opacity)
    const containerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            pullY.value,
            [15, 50], // Start appearing later
            [0, 1],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            pullY.value,
            [0, PULL_THRESHOLD],
            [-60, 20], // Move much further up when idle (-60) to hide behind header
            Extrapolation.EXTEND
        );

        return {
            opacity,
            transform: [{ translateY }],
            top: topOffset, // Align using the passed offset
        };
    });

    // 2. Icon Rotation (Arrow)
    const arrowStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            pullY.value,
            [0, PULL_THRESHOLD],
            [0, 180],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ rotate: `${rotate}deg` }],
            opacity: state === "refreshing" || state === "done" ? 0 : 1,
        };
    });

    // 3. Spinner / Done Scale
    const statusIconStyle = useAnimatedStyle(() => {
        const scale = state === "refreshing" || state === "done" ? 1 : 0;
        return {
            transform: [{ scale: withSpring(scale) }],
            opacity: state === "refreshing" || state === "done" ? 1 : 0,
            position: "absolute",
        };
    });

    return (
        <Animated.View style={[styles.indicatorContainer, containerStyle]}>
            <View style={styles.indicatorCircle}>
                {/* Dragging Arrow */}
                <Animated.View style={arrowStyle}>
                    <Ionicons name="arrow-down" size={20} color={refreshColor} />
                </Animated.View>

                {/* Refreshing Spinner or Check */}
                <Animated.View style={statusIconStyle}>
                    {state === "done" ? (
                        <Ionicons
                            name="checkmark"
                            size={22}
                            color={refreshColor}
                        />
                    ) : (
                        <ActivityIndicator size="small" color={refreshColor} />
                    )}
                </Animated.View>
            </View>
        </Animated.View>
    );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

export function PullToRefreshSectionList<ItemT, SectionT>({
    onRefresh,
    topOffset = 0,
    refreshColor = "#111827",
    contentContainerStyle,
    style,
    ...props
}: PullToRefreshSectionListProps<ItemT, SectionT>) {
    const [refreshState, setRefreshState] = useState<
        "idle" | "pulling" | "refreshing" | "done"
    >("idle");

    // Shared Values
    const pullY = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    // --------------------------------------------------
    // Logic
    // --------------------------------------------------

    const hapticImpact = (style: Haptics.ImpactFeedbackStyle) => {
        runOnJS(Haptics.impactAsync)(style);
    };

    const handleRefreshComplete = useCallback(() => {
        setRefreshState("done");
        // Hold the "done" state briefly, then spring back
        setTimeout(() => {
            pullY.value = withSpring(0, SPRING_CONFIG, (finished) => {
                if (finished) {
                    runOnJS(setRefreshState)("idle");
                }
            });
        }, 800);
    }, []);

    const triggerRefresh = useCallback(async () => {
        if (refreshState === "refreshing") return;

        setRefreshState("refreshing");
        hapticImpact(Haptics.ImpactFeedbackStyle.Medium);

        // Snap to refresh height
        pullY.value = withSpring(REFRESH_HEIGHT, SPRING_CONFIG);

        try {
            await onRefresh();
            handleRefreshComplete();
        } catch (e) {
            console.error(e);
            pullY.value = withSpring(0);
            setRefreshState("idle");
        }
    }, [onRefresh, refreshState]);

    // --------------------------------------------------
    // Gestures & scroll
    // --------------------------------------------------

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const panGesture = Gesture.Pan()
        // Determine whether to allow the pan
        .onStart(() => {
            // Do not eagerly capture. Wait for direction in onUpdate.
        })
        .onUpdate((e) => {
            if (!isDragging.value) {
                // Only start dragging if we are at top AND pulling down
                // Using 1 as threshold to handle minor bounce/precision issues
                if (scrollY.value <= 1 && e.translationY > 0) {
                    isDragging.value = true;
                }
            }

            if (isDragging.value) {
                if (e.translationY > 0) {
                    // Pulling down - apply resistance
                    const friction = 0.55;
                    pullY.value = e.translationY * friction;
                } else {
                    // Moving up into the list
                    pullY.value = 0;
                }
            }
        })
        .onEnd(() => {
            if (isDragging.value) {
                isDragging.value = false;
                if (pullY.value > PULL_THRESHOLD) {
                    runOnJS(triggerRefresh)();
                } else {
                    pullY.value = withSpring(0, SPRING_CONFIG);
                }
            }
        })
        // Combine with Native gesture (scrolling)
        // We let them recognize simultaneously, but our logic above determines behavior
        .simultaneousWithExternalGesture(Gesture.Native());

    // Haptic Trigger on Threshold Cross
    useAnimatedReaction(
        () => pullY.value,
        (current, previous) => {
            if (
                previous !== null &&
                current > PULL_THRESHOLD &&
                previous <= PULL_THRESHOLD &&
                isDragging.value
            ) {
                runOnJS(hapticImpact)(Haptics.ImpactFeedbackStyle.Light);
            }
        }
    );

    // --------------------------------------------------
    // Styles
    // --------------------------------------------------

    // The entire list moves down
    const listAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: pullY.value }],
    }));

    const AnimatedSectionListAny = AnimatedSectionList as any;

    return (
        <View style={styles.container}>
            <RefreshIndicator
                pullY={pullY}
                state={refreshState}
                topOffset={topOffset}
                refreshColor={refreshColor}
            />

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.flexOne, listAnimatedStyle]}>
                    <AnimatedSectionListAny
                        {...props}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        bounces={false}
                        contentContainerStyle={contentContainerStyle}
                    // Ensure we pass the ref-like props if needed, though usually not needed for basic P2R
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: "hidden",
    },
    flexOne: {
        flex: 1,
    },
    indicatorContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 0,
    },
    indicatorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
});
