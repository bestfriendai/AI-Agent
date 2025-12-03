import { Ionicons } from '@expo/vector-icons'
import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

interface Props {
  message: string
  center?: boolean
}

function ErrorText({ message, center }: Props) {
  const errorContainerHeight = useSharedValue(0)

  // Define animated styles using Reanimated
  const errorOpacity = useSharedValue(0)
  const errorAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: errorOpacity.value,
      height: errorContainerHeight.value
    };
  });

  useEffect(() => {
    function calculateErrorContainerHeight() {
      if (message) {
        // Estimate characters per line (assuming container width ~300px and average char width ~8px)
        const charsPerLine = 38;
        // Calculate number of lines needed (add 1 to account for partial lines)
        const numLines = Math.min(3, Math.ceil(message.length / charsPerLine));
        // Return height based on line count (30px per line plus padding)
        return numLines * 20;
      } else {
        return 0
      }
    }

    if (message) {
      errorOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      })
      errorContainerHeight.value = withTiming(calculateErrorContainerHeight(), {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      })
    } else {
      errorOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      })
      errorContainerHeight.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      })
    }
  }, [message, errorOpacity, errorContainerHeight])

  if (!message) return null

  return (
    <Animated.View style={[styles.errorContainer, errorAnimatedStyle, center && { justifyContent: 'center' }]}>
      <Ionicons name="alert-circle" size={16} color="#D32F2F" style={{ marginTop: 2 }} />
      <Animated.Text style={[styles.errorText, center && { textAlign: 'center' }]} numberOfLines={3}>
        {message}
      </Animated.Text>
    </Animated.View>
  )
}

export default ErrorText

const styles = StyleSheet.create({
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    flexShrink: 1,
  },
  errorContainer: {
    width: '100%',
    paddingRight: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
})