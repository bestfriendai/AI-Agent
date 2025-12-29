/**
 * Firebase Sign Up Component
 * Handles email/password registration with email verification
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SignUpProps {
    signInUrl?: string;
    homeUrl?: string;
}

export function SignUp({ signInUrl = '/', homeUrl = '/(protected)' }: SignUpProps) {
    const router = useRouter();
    const { signUp, isLoaded } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showVerification, setShowVerification] = useState(false);

    if (!isLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        return null;
    };

    const handleSignUp = async () => {
        if (!email || !password) {
            setError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await signUp(email, password, firstName, lastName);
            setShowVerification(true);
        } catch (err: any) {
            const errorMessage = getFirebaseErrorMessage(err.code);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (showVerification) {
        return (
            <View style={styles.container}>
                <View style={styles.verificationContainer}>
                    <Ionicons name="mail-open-outline" size={80} color="#3B82F6" />
                    <Text style={styles.verificationTitle}>Verify Your Email</Text>
                    <Text style={styles.verificationText}>
                        We've sent a verification email to:
                    </Text>
                    <Text style={styles.emailText}>{email}</Text>
                    <Text style={styles.verificationSubtext}>
                        Please check your inbox and click the verification link to complete your registration.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace(homeUrl)}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>Continue to App</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.signInLink}
                        onPress={() => router.replace(signInUrl)}
                    >
                        <Text style={styles.signInLinkText}>Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>
                </View>

                <View style={styles.nameRow}>
                    <View style={[styles.inputContainer, styles.halfInput]}>
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            placeholderTextColor="#999"
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCapitalize="words"
                            autoComplete="given-name"
                        />
                    </View>
                    <View style={[styles.inputContainer, styles.halfInput]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            placeholderTextColor="#999"
                            value={lastName}
                            onChangeText={setLastName}
                            autoCapitalize="words"
                            autoComplete="family-name"
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        autoComplete="new-password"
                    />
                </View>

                <Text style={styles.passwordHint}>
                    Password must be at least 8 characters
                </Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push(signInUrl)}>
                        <Text style={styles.signInLinkText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'An account with this email already exists';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled';
        case 'auth/weak-password':
            return 'Password is too weak';
        default:
            return 'An error occurred. Please try again';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    nameRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    halfInput: {
        flex: 1,
        marginBottom: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1a1a1a',
    },
    eyeIcon: {
        padding: 4,
    },
    passwordHint: {
        color: '#888',
        fontSize: 12,
        marginBottom: 8,
        marginTop: -8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    button: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonGradient: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        color: '#666',
        fontSize: 14,
    },
    signInLinkText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
    },
    verificationContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    verificationTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
        marginTop: 24,
        marginBottom: 16,
    },
    verificationText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    emailText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B82F6',
        marginTop: 8,
        marginBottom: 16,
    },
    verificationSubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    signInLink: {
        marginTop: 16,
    },
});

export default SignUp;
