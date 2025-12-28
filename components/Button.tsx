/**
 * Button Component
 * Basic button with press state, haptic feedback, and animations
 */

import { colors } from "@/utils/colors";
import haptics from "@/utils/haptics";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps extends PressableProps {
    children: React.ReactNode;
    variant?: "primary" | "secondary";
    hapticFeedback?: boolean;
}

export default function Button({
    children,
    variant = "primary",
    hapticFeedback = true,
    onPressIn,
    onPressOut,
    onPress,
    disabled,
    ...props
}: ButtonProps): JSX.Element {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (e: any): void => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
        if (hapticFeedback) {
            haptics.light();
        }
        onPressIn?.(e);
    };

    const handlePressOut = (e: any): void => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        onPressOut?.(e);
    };

    const buttonStyles = [
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
    ];

    const textStyles = [
        styles.text,
        variant === "secondary" && styles.textSecondary,
    ];

    return (
        <AnimatedPressable
            style={[buttonStyles, animatedStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!disabled }}
            {...props}
        >
            {typeof children === "string" ? (
                <Text style={textStyles}>{children}</Text>
            ) : (
                children
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    buttonSecondary: {
        backgroundColor: colors.gray6,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    text: {
        color: "white",
        fontSize: 15,
        fontWeight: "600",
    },
    textSecondary: {
        color: colors.primary,
    },
});
