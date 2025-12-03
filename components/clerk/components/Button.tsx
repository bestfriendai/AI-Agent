import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface Props extends TouchableOpacityProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode | string;
}

export function Button({ children, variant = "primary", ...props }: Props) {
  return (
    <TouchableOpacity
      style={props.style || styles.buttonContainer}
      activeOpacity={0.9}
      {...props}
    >
      {variant === "secondary" ? (
        <LinearGradient
          colors={['#5ac8fa', '#007aff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.secondaryWrapper}
        >
          {typeof (children) === 'string' ? <Text style={styles.secondaryText}>{children}</Text> : children}
        </LinearGradient>
      ) : (
        typeof (children) === 'string' ? <Text>{children}</Text> : children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 50,
    marginTop: 8,
    overflow: 'hidden',
  },
  secondaryWrapper: {
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  },
  secondaryText: {
    color: '#fbfaff'
  }
});

export default Button;
