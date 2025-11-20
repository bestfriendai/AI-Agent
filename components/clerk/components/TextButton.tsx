import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

function TextButton({ onPress, text }: { onPress: () => void, text: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.switchModeButton} >
      <Text style={styles.switchModeText}>{text}</Text>
    </TouchableOpacity>
  )
}

export default TextButton

const styles = StyleSheet.create({
  switchModeButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 8,
  },
  switchModeText: {
    fontSize: 16,
    color: "#007aff",
    fontWeight: "500",
  }
});