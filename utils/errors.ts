/**
 * Error Handling Utilities
 * Centralized error handling for consistent error management across the app
 */

import * as Haptics from 'expo-haptics';

// Error types for different scenarios
export type ErrorType =
  | 'network'
  | 'auth'
  | 'validation'
  | 'server'
  | 'unknown'
  | 'timeout'
  | 'cancelled';

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  originalError?: unknown;
}

// User-friendly error messages
const ERROR_MESSAGES: Record<ErrorType, string> = {
  network: 'Unable to connect. Please check your internet connection.',
  auth: 'Authentication failed. Please try again.',
  validation: 'Please check your input and try again.',
  server: 'Something went wrong on our end. Please try again later.',
  unknown: 'An unexpected error occurred. Please try again.',
  timeout: 'Request timed out. Please try again.',
  cancelled: 'Operation was cancelled.',
};

/**
 * Parse and normalize errors from various sources
 */
export function parseError(error: unknown): AppError {
  // Handle Clerk errors
  if (isClerkError(error)) {
    const clerkError = error as ClerkErrorType;
    const firstError = clerkError.errors?.[0];

    if (firstError?.code === 'session_exists') {
      return {
        type: 'auth',
        message: 'You are already signed in.',
        code: firstError.code,
        originalError: error,
      };
    }

    return {
      type: 'auth',
      message: firstError?.message || ERROR_MESSAGES.auth,
      code: firstError?.code,
      originalError: error,
    };
  }

  // Handle Firebase errors
  if (isFirebaseError(error)) {
    const firebaseError = error as FirebaseErrorType;
    return {
      type: 'server',
      message: getFirebaseErrorMessage(firebaseError.code),
      code: firebaseError.code,
      originalError: error,
    };
  }

  // Handle network errors
  if (isNetworkError(error)) {
    return {
      type: 'network',
      message: ERROR_MESSAGES.network,
      originalError: error,
    };
  }

  // Handle timeout errors
  if (isTimeoutError(error)) {
    return {
      type: 'timeout',
      message: ERROR_MESSAGES.timeout,
      originalError: error,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message || ERROR_MESSAGES.unknown,
      originalError: error,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
      originalError: error,
    };
  }

  // Default unknown error
  return {
    type: 'unknown',
    message: ERROR_MESSAGES.unknown,
    originalError: error,
  };
}

/**
 * Get user-friendly message for error type
 */
export function getErrorMessage(type: ErrorType): string {
  return ERROR_MESSAGES[type];
}

/**
 * Trigger haptic feedback for error
 */
export function triggerErrorHaptic(): void {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // Haptics not available
  }
}

/**
 * Trigger haptic feedback for success
 */
export function triggerSuccessHaptic(): void {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Haptics not available
  }
}

/**
 * Trigger haptic feedback for warning
 */
export function triggerWarningHaptic(): void {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Haptics not available
  }
}

/**
 * Log error for debugging (replace with proper logging service in production)
 */
export function logError(context: string, error: unknown): void {
  if (__DEV__) {
    console.error(`[${context}]`, error);
  }
  // TODO: Send to Sentry/Crashlytics in production
  // Sentry.captureException(error, { extra: { context } });
}

// Type guards
interface ClerkErrorType {
  errors?: Array<{
    code?: string;
    message?: string;
    meta?: { paramName?: string };
  }>;
}

interface FirebaseErrorType {
  code: string;
  message: string;
}

function isClerkError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errors' in error &&
    Array.isArray((error as ClerkErrorType).errors)
  );
}

function isFirebaseError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as FirebaseErrorType).code === 'string' &&
    (error as FirebaseErrorType).code.includes('/')
  );
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('Network request failed');
  }
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('Network') ||
      error.message.includes('fetch')
    );
  }
  return false;
}

function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('timeout') ||
      error.message.includes('Timeout') ||
      error.name === 'AbortError'
    );
  }
  return false;
}

function getFirebaseErrorMessage(code: string): string {
  const errorMap: Record<string, string> = {
    'permission-denied': 'You don\'t have permission to perform this action.',
    'not-found': 'The requested data was not found.',
    'already-exists': 'This data already exists.',
    'resource-exhausted': 'Too many requests. Please try again later.',
    'failed-precondition': 'Operation failed. Please try again.',
    'aborted': 'Operation was aborted. Please try again.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'unauthenticated': 'Please sign in to continue.',
  };

  // Extract the error type from code like "firestore/permission-denied"
  const errorType = code.split('/').pop() || '';
  return errorMap[errorType] || ERROR_MESSAGES.server;
}

/**
 * Retry function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      onRetry?.(attempt, error);

      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Create a timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}
