import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface GlassViewProps extends ViewProps {
    intensity?: number;
}

export function GlassBlur({ style, children, intensity = 80, ...props }: GlassViewProps) {
    return (
        <View style={[styles.container, style]} {...props}>
            <BlurView
                style={StyleSheet.absoluteFill}
                intensity={intensity}
                tint="light"
                pointerEvents="none"
            />
            <LinearGradient
                colors={[
                    'rgba(255,255,255,0.35)',
                    'rgba(255,255,255,0.15)',
                    'rgba(255,255,255,0.05)',
                ]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                pointerEvents="none"
            />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
});
