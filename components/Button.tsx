import { colors } from "@/utils/colors";
import { useState } from "react";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

export default function Button({ children, ...props }: PressableProps) {
    const [isPressed, setIsPressed] = useState(false);
    return (
        <Pressable
            style={[styles.button, isPressed && styles.buttonPressed]}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            {...props}
        >
            {typeof children === "string" ? (
                <Text style={styles.text}>{children}</Text>
            ) : (
                children
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    buttonPressed: {
        backgroundColor: colors.blue,
        opacity: 0.8,
    },
    text: {
        color: "white",
    }
})