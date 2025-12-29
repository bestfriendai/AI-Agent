/**
 * Firebase Sign Out Button
 * Simple sign out functionality using Firebase
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface SignOutButtonProps {
    onSignOut?: () => void;
    style?: object;
    showIcon?: boolean;
    showText?: boolean;
}

export function SignOutButton({
    onSignOut,
    style,
    showIcon = true,
    showText = true
}: SignOutButtonProps) {
    const { signOut } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            await signOut();
            onSignOut?.();
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={handleSignOut}
            disabled={isLoading}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#EF4444" />
            ) : (
                <View style={styles.content}>
                    {showIcon && (
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.icon} />
                    )}
                    {showText && (
                        <Text style={styles.text}>Sign Out</Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    text: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SignOutButton;
