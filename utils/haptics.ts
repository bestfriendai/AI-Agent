/**
 * Haptic Feedback Utilities
 * Consistent haptic feedback patterns across the app
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Check if haptics are available
const isHapticsAvailable = Platform.OS !== 'web';

/**
 * Light impact - for subtle interactions like selections
 */
export function lightImpact(): void {
  if (!isHapticsAvailable) return;
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics failed silently
  }
}

/**
 * Medium impact - for standard button presses
 */
export function mediumImpact(): void {
  if (!isHapticsAvailable) return;
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics failed silently
  }
}

/**
 * Heavy impact - for significant actions
 */
export function heavyImpact(): void {
  if (!isHapticsAvailable) return;
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // Haptics failed silently
  }
}

/**
 * Selection feedback - for picker/selection changes
 */
export function selection(): void {
  if (!isHapticsAvailable) return;
  try {
    Haptics.selectionAsync();
  } catch {
    // Haptics failed silently
  }
}

/**
 * Success notification - for successful operations
 */
export function success(): void {
  if (!isHapticsAvailable) return;
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics failed silently
  }
}

/**
 * Warning notification - for warnings
 */
export function warning(): void {
  if (!isHapticsAvailable) return;
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Haptics failed silently
  }
}

/**
 * Error notification - for errors
 */
export function error(): void {
  if (!isHapticsAvailable) return;
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Haptics failed silently
  }
}

// Export as namespace for cleaner usage: haptics.light(), haptics.success()
export const haptics = {
  light: lightImpact,
  medium: mediumImpact,
  heavy: heavyImpact,
  selection,
  success,
  warning,
  error,
};

export default haptics;
