/**
 * Firebase Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    User,
    Auth,
    GoogleAuthProvider,
    signInWithCredential,
    OAuthProvider,
} from 'firebase/auth';
import { getApp } from '@/utils/firebase';

// Initialize Firebase Auth
let auth: Auth | null = null;

function getFirebaseAuth(): Auth {
    if (!auth) {
        auth = getAuth(getApp());
    }
    return auth;
}

// User type that mirrors the properties we need (similar to Clerk's user)
export interface AuthUser {
    id: string;
    email: string | null;
    emailVerified: boolean;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    primaryEmailAddress: {
        emailAddress: string | null;
    };
}

interface AuthContextType {
    user: AuthUser | null;
    firebaseUser: User | null;
    isLoaded: boolean;
    isSignedIn: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
    signInWithGoogle: (idToken: string) => Promise<void>;
    signInWithApple: (idToken: string, nonce: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Firebase User to our AuthUser format
function convertFirebaseUser(firebaseUser: User | null): AuthUser | null {
    if (!firebaseUser) return null;

    const displayName = firebaseUser.displayName || '';
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;

    return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        firstName,
        lastName,
        imageUrl: firebaseUser.photoURL,
        primaryEmailAddress: {
            emailAddress: firebaseUser.email,
        },
    };
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const authInstance = getFirebaseAuth();
        const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
            setFirebaseUser(firebaseUser);
            setUser(convertFirebaseUser(firebaseUser));
            setIsLoaded(true);
        });

        return () => unsubscribe();
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const authInstance = getFirebaseAuth();
        await signInWithEmailAndPassword(authInstance, email, password);
    }, []);

    const signUp = useCallback(async (email: string, password: string, firstName?: string, lastName?: string) => {
        const authInstance = getFirebaseAuth();
        const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);

        // Update profile with name if provided
        if (firstName || lastName) {
            const displayName = [firstName, lastName].filter(Boolean).join(' ');
            await updateProfile(userCredential.user, { displayName });
        }

        // Send email verification
        await sendEmailVerification(userCredential.user);
    }, []);

    const signOut = useCallback(async () => {
        const authInstance = getFirebaseAuth();
        await firebaseSignOut(authInstance);
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        const authInstance = getFirebaseAuth();
        await sendPasswordResetEmail(authInstance, email);
    }, []);

    const sendVerificationEmail = useCallback(async () => {
        const authInstance = getFirebaseAuth();
        if (authInstance.currentUser) {
            await sendEmailVerification(authInstance.currentUser);
        }
    }, []);

    const signInWithGoogle = useCallback(async (idToken: string) => {
        const authInstance = getFirebaseAuth();
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(authInstance, credential);
    }, []);

    const signInWithApple = useCallback(async (idToken: string, nonce: string) => {
        const authInstance = getFirebaseAuth();
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({
            idToken,
            rawNonce: nonce,
        });
        await signInWithCredential(authInstance, credential);
    }, []);

    const value: AuthContextType = {
        user,
        firebaseUser,
        isLoaded,
        isSignedIn: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        sendVerificationEmail,
        signInWithGoogle,
        signInWithApple,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Hook that mimics Clerk's useUser hook
export function useUser() {
    const { user, isLoaded } = useAuth();
    return { user, isLoaded };
}

// Hook that mimics Clerk's useSignIn hook
export function useSignIn() {
    const { signIn, resetPassword, isLoaded } = useAuth();
    return {
        isLoaded,
        signIn,
        resetPassword,
    };
}

// Hook that mimics Clerk's useSignUp hook
export function useSignUp() {
    const { signUp, isLoaded } = useAuth();
    return {
        isLoaded,
        signUp,
    };
}
