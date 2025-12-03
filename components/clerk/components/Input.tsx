// @ts-ignore - Ignoring missing type declarations for @expo/vector-icons
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface AlternateAction {
  text: string;
  onPress: () => void;
}

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  paramName?: string;
  alternateAction?: AlternateAction
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Input({ label, error, paramName, alternateAction, icon, secureTextEntry, ...props }: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry === true;

  return (
    <View style={styles.container}>
      {(label || alternateAction) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {alternateAction && <Text onPress={alternateAction.onPress} style={styles.alternateActionText}>{alternateAction.text}</Text>}
        </View>
      )}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        {icon && <Ionicons name={icon} size={20} color="#A0A0A0" style={styles.inputIcon} />}
        <TextInput
          style={styles.input}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#A0A0A0" />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  inputIcon: {
    marginRight: 4,
  },
  inputError: {
    borderColor: '#d34742',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginLeft: 4,
  },
  alternateActionText: {
    color: '#5e41f7',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default Input;
