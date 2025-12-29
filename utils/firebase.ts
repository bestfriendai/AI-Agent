/**
 * Firebase Configuration
 * Initializes Firebase with proper validation and error handling
 */

import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Required environment variables for Firebase to work
const REQUIRED_ENV_VARS = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
] as const;

/**
 * Validate that required environment variables are present
 */
function validateEnvVars(): void {
    const missing = REQUIRED_ENV_VARS.filter(
        (key) => !process.env[key]
    );

    if (missing.length > 0) {
        const message = `Missing required Firebase environment variables: ${missing.join(', ')}`;

        if (__DEV__) {
            console.error(`[Firebase] ${message}`);
            console.error('[Firebase] Please add these to your .env file:');
            missing.forEach((key) => {
                console.error(`  ${key}=your_value_here`);
            });
        }

        throw new Error(message);
    }
}

/**
 * Get Firebase configuration from environment variables
 */
function getFirebaseConfig() {
    return {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };
}

// Singleton instances
let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let firebaseAuth: Auth | null = null;
let initializationError: Error | null = null;

/**
 * Initialize Firebase with validation
 */
function initializeFirebase(): void {
    if (app && firestore && firebaseAuth) {
        return;
    }

    if (initializationError) {
        throw initializationError;
    }

    try {
        validateEnvVars();

        const config = getFirebaseConfig();

        // Check if app already exists
        const existingApps = getApps();
        app = existingApps.length > 0 ? existingApps[0] : initializeApp(config);

        firestore = getFirestore(app);
        firebaseAuth = getAuth(app);

        if (__DEV__) {
            console.log('[Firebase] Initialized successfully');
        }
    } catch (error) {
        initializationError = error instanceof Error ? error : new Error(String(error));

        if (__DEV__) {
            console.error('[Firebase] Initialization failed:', error);
        }

        throw initializationError;
    }
}

/**
 * Get Firestore instance (lazy initialization)
 */
export function getDb(): Firestore {
    if (!firestore) {
        initializeFirebase();
    }
    return firestore!;
}

/**
 * Get Firebase App instance (lazy initialization)
 */
export function getApp(): FirebaseApp {
    if (!app) {
        initializeFirebase();
    }
    return app!;
}

/**
 * Get Firebase Auth instance (lazy initialization)
 */
export function getFirebaseAuth(): Auth {
    if (!firebaseAuth) {
        initializeFirebase();
    }
    return firebaseAuth!;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
    return app !== null && firestore !== null && firebaseAuth !== null;
}

/**
 * Check if Firebase initialization failed
 */
export function getFirebaseError(): Error | null {
    return initializationError;
}

// Initialize on import for backward compatibility
// This will throw an error if env vars are missing
try {
    initializeFirebase();
} catch {
    // Error will be thrown when db is accessed
}

// Export Firestore instance (will throw if not initialized)
export const db = (() => {
    if (!firestore) {
        // During build time, env vars might not be available
        // Return a proxy that throws on access
        return new Proxy({} as Firestore, {
            get() {
                if (!firestore) {
                    initializeFirebase();
                }
                return firestore;
            },
        });
    }
    return firestore;
})();

// Export Auth instance (will throw if not initialized)
export const auth = (() => {
    if (!firebaseAuth) {
        // During build time, env vars might not be available
        // Return a proxy that throws on access
        return new Proxy({} as Auth, {
            get() {
                if (!firebaseAuth) {
                    initializeFirebase();
                }
                return firebaseAuth;
            },
        });
    }
    return firebaseAuth;
})();
