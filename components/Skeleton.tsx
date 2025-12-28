/**
 * Skeleton Loading Components
 * Provides shimmer loading placeholders for better perceived performance
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/utils/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Basic Skeleton element with shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps): JSX.Element {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.4, 0.7, 0.4]);

    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Skeleton for text lines
 */
export function TextSkeleton({
  lines = 1,
  lastLineWidth = '60%',
  spacing = 8,
}: {
  lines?: number;
  lastLineWidth?: number | string;
  spacing?: number;
}): JSX.Element {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={14}
          borderRadius={4}
        />
      ))}
    </View>
  );
}

/**
 * Skeleton for session cards on home screen
 */
export function SessionCardSkeleton(): JSX.Element {
  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionCardHeader}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.sessionCardHeaderText}>
          <Skeleton width="70%" height={18} borderRadius={6} />
          <Skeleton width="50%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
        </View>
      </View>
      <View style={styles.sessionCardStats}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

/**
 * Skeleton for horizontal session carousel
 */
export function HorizontalSessionSkeleton(): JSX.Element {
  return (
    <View style={styles.horizontalContainer}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          width={250}
          height={140}
          borderRadius={16}
          style={{ marginRight: 16 }}
        />
      ))}
    </View>
  );
}

/**
 * Skeleton for history cards
 */
export function HistoryCardSkeleton(): JSX.Element {
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyCardLeft}>
        <Skeleton width="40%" height={12} borderRadius={4} />
        <Skeleton width="100%" height={20} borderRadius={6} style={{ marginTop: 8 }} />
        <Skeleton width="80%" height={20} borderRadius={6} style={{ marginTop: 4 }} />
        <Skeleton width={60} height={28} borderRadius={14} style={{ marginTop: 12 }} />
      </View>
      <View style={styles.historyCardRight}>
        <Skeleton width={70} height={70} borderRadius={16} />
      </View>
    </View>
  );
}

/**
 * Skeleton for library session cards
 */
export function LibraryCardSkeleton(): JSX.Element {
  return (
    <View style={styles.libraryCard}>
      <View style={styles.libraryCardContent}>
        <Skeleton width="60%" height={18} borderRadius={6} />
        <Skeleton width="80%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
        <Skeleton width={70} height={28} borderRadius={14} style={{ marginTop: 12 }} />
      </View>
      <Skeleton width={48} height={48} borderRadius={24} />
    </View>
  );
}

/**
 * Skeleton for profile stats
 */
export function ProfileStatsSkeleton(): JSX.Element {
  return (
    <View style={styles.profileStats}>
      <View style={styles.profileStatCard}>
        <Skeleton width={50} height={50} borderRadius={25} />
        <Skeleton width={60} height={28} borderRadius={6} style={{ marginTop: 12 }} />
        <Skeleton width={80} height={14} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
      <View style={styles.profileStatCard}>
        <Skeleton width={50} height={50} borderRadius={25} />
        <Skeleton width={60} height={28} borderRadius={6} style={{ marginTop: 12 }} />
        <Skeleton width={80} height={14} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

/**
 * Full screen loading skeleton
 */
export function FullScreenSkeleton(): JSX.Element {
  return (
    <View style={styles.fullScreen}>
      <Skeleton width={120} height={120} borderRadius={60} />
      <Skeleton width="60%" height={24} borderRadius={8} style={{ marginTop: 24 }} />
      <Skeleton width="40%" height={16} borderRadius={6} style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray5,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray5,
    marginBottom: 16,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionCardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  sessionCardStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginLeft: 60,
  },
  horizontalContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  historyCard: {
    backgroundColor: '#F9F8F4',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    marginBottom: 16,
  },
  historyCardLeft: {
    flex: 1,
    paddingRight: 16,
  },
  historyCardRight: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  libraryCardContent: {
    flex: 1,
    paddingRight: 16,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  profileStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray5,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
});

export default Skeleton;
