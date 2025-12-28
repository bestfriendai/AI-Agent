/**
 * EmptyState Component
 * Displays a helpful message when there's no content to show
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { colors } from '@/utils/colors';
import haptics from '@/utils/haptics';

type EmptyStateType = 'no-data' | 'no-sessions' | 'no-history' | 'no-results' | 'error' | 'offline';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  iconColor: string;
  iconBgColor: string;
}> = {
  'no-data': {
    icon: 'folder-open-outline',
    title: 'No Data Yet',
    message: 'Start exploring to see content here.',
    iconColor: colors.gray,
    iconBgColor: colors.gray6,
  },
  'no-sessions': {
    icon: 'sparkles-outline',
    title: 'No Sessions Yet',
    message: 'Start your first mindfulness session to begin your journey.',
    iconColor: colors.primary,
    iconBgColor: `${colors.primary}15`,
  },
  'no-history': {
    icon: 'time-outline',
    title: 'No History Yet',
    message: 'Your completed sessions will appear here.',
    iconColor: colors.teal,
    iconBgColor: `${colors.teal}15`,
  },
  'no-results': {
    icon: 'search-outline',
    title: 'No Results Found',
    message: 'Try adjusting your search or filters.',
    iconColor: colors.orange,
    iconBgColor: `${colors.orange}15`,
  },
  'error': {
    icon: 'alert-circle-outline',
    title: 'Something Went Wrong',
    message: 'We couldn\'t load this content. Please try again.',
    iconColor: colors.error,
    iconBgColor: `${colors.error}15`,
  },
  'offline': {
    icon: 'cloud-offline-outline',
    title: 'You\'re Offline',
    message: 'Please check your internet connection and try again.',
    iconColor: colors.gray,
    iconBgColor: colors.gray6,
  },
};

export function EmptyState({
  type = 'no-data',
  title,
  message,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps): JSX.Element {
  const config = EMPTY_STATE_CONFIG[type];

  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  const handleAction = (): void => {
    haptics.light();
    onAction?.();
  };

  return (
    <Animated.View
      entering={FadeIn.delay(200)}
      style={styles.container}
    >
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={[
          styles.iconContainer,
          { backgroundColor: config.iconBgColor },
        ]}
      >
        <Ionicons
          name={displayIcon}
          size={48}
          color={config.iconColor}
        />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(400).springify()}
        style={styles.title}
        accessibilityRole="header"
      >
        {displayTitle}
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(500).springify()}
        style={styles.message}
      >
        {displayMessage}
      </Animated.Text>

      {actionLabel && onAction && (
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAction}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;
