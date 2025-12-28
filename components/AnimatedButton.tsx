/**
 * AnimatedButton Component
 * A polished button with press animations, haptic feedback, and loading state
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  PressableProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/utils/colors';
import haptics from '@/utils/haptics';
import { animations } from '@/utils/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps extends Omit<PressableProps, 'style'> {
  title?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  hapticType?: 'light' | 'medium' | 'heavy' | 'none';
}

export function AnimatedButton({
  title,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  hapticType = 'light',
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any): void => {
    scale.value = withSpring(0.96, animations.spring.snappy);
    if (hapticType !== 'none') {
      haptics[hapticType]();
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any): void => {
    scale.value = withSpring(1, animations.spring.snappy);
    onPressOut?.(e);
  };

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;

  const renderContent = (): React.ReactNode => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
          accessibilityLabel="Loading"
        />
      );
    }

    if (children) {
      return children;
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={variantStyles.textColor}
            style={styles.iconLeft}
          />
        )}
        {title && (
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: variantStyles.textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
        {icon && iconPosition === 'right' && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={variantStyles.textColor}
            style={styles.iconRight}
          />
        )}
      </>
    );
  };

  return (
    <AnimatedPressable
      style={[
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={title}
      {...props}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

function getVariantStyles(variant: ButtonVariant): {
  button: ViewStyle;
  textColor: string;
} {
  switch (variant) {
    case 'primary':
      return {
        button: {
          backgroundColor: colors.primary,
        },
        textColor: '#fff',
      };
    case 'secondary':
      return {
        button: {
          backgroundColor: colors.gray6,
        },
        textColor: colors.primary,
      };
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        },
        textColor: colors.primary,
      };
    case 'ghost':
      return {
        button: {
          backgroundColor: 'transparent',
        },
        textColor: colors.primary,
      };
    case 'danger':
      return {
        button: {
          backgroundColor: colors.error,
        },
        textColor: '#fff',
      };
    default:
      return {
        button: {
          backgroundColor: colors.primary,
        },
        textColor: '#fff',
      };
  }
}

function getSizeStyles(size: ButtonSize): {
  button: ViewStyle;
  text: TextStyle;
} {
  switch (size) {
    case 'sm':
      return {
        button: {
          height: 36,
          paddingHorizontal: 16,
          borderRadius: 18,
        },
        text: {
          fontSize: 14,
        },
      };
    case 'md':
      return {
        button: {
          height: 50,
          paddingHorizontal: 24,
          borderRadius: 25,
        },
        text: {
          fontSize: 16,
        },
      };
    case 'lg':
      return {
        button: {
          height: 56,
          paddingHorizontal: 32,
          borderRadius: 28,
        },
        text: {
          fontSize: 17,
        },
      };
    default:
      return {
        button: {
          height: 50,
          paddingHorizontal: 24,
          borderRadius: 25,
        },
        text: {
          fontSize: 16,
        },
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default AnimatedButton;
