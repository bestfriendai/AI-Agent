/**
 * RevenueCat Service
 * Handles subscription management and in-app purchases
 */

import { Platform } from 'react-native';
import Purchases, {
    CustomerInfo,
    PurchasesOfferings,
    PurchasesPackage,
    LOG_LEVEL,
} from 'react-native-purchases';
import { logError } from '@/utils/errors';

// Environment variables for RevenueCat API keys
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? '';
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? '';

// Entitlement identifier for premium access
export const PREMIUM_ENTITLEMENT_ID = 'premium';

// Singleton state
let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Should be called early in the app lifecycle (e.g., root layout)
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
    if (isInitialized) {
        return;
    }

    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
        if (__DEV__) {
            console.warn('[RevenueCat] Missing API key. Subscriptions will not work.');
        }
        return;
    }

    try {
        // Configure RevenueCat
        Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

        await Purchases.configure({
            apiKey,
            appUserID: userId ?? null,
        });

        isInitialized = true;

        if (__DEV__) {
            console.log('[RevenueCat] Initialized successfully');
        }
    } catch (e) {
        logError('RevenueCat:initialize', e);
    }
}

/**
 * Update the RevenueCat user ID (call after login/logout)
 */
export async function setRevenueCatUserId(userId: string | null): Promise<void> {
    if (!isInitialized) {
        return;
    }

    try {
        if (userId) {
            await Purchases.logIn(userId);
        } else {
            await Purchases.logOut();
        }
    } catch (e) {
        logError('RevenueCat:setUserId', e);
    }
}

/**
 * Get the current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!isInitialized) {
        return null;
    }

    try {
        return await Purchases.getCustomerInfo();
    } catch (e) {
        logError('RevenueCat:getCustomerInfo', e);
        return null;
    }
}

/**
 * Check if user has active premium subscription
 */
export async function hasPremiumAccess(): Promise<boolean> {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) {
        return false;
    }

    return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]?.isActive ?? false;
}

/**
 * Get available subscription offerings
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
    if (!isInitialized) {
        return null;
    }

    try {
        return await Purchases.getOfferings();
    } catch (e) {
        logError('RevenueCat:getOfferings', e);
        return null;
    }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(
    pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
    if (!isInitialized) {
        return { success: false, error: 'RevenueCat not initialized' };
    }

    try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);

        const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]?.isActive ?? false;

        return {
            success: isPremium,
            customerInfo,
            error: isPremium ? undefined : 'Purchase completed but entitlement not active',
        };
    } catch (e: any) {
        // Handle user cancellation separately
        if (e.userCancelled) {
            return { success: false, error: 'cancelled' };
        }

        logError('RevenueCat:purchasePackage', e);
        return { success: false, error: e.message || 'Purchase failed' };
    }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
}> {
    if (!isInitialized) {
        return { success: false, error: 'RevenueCat not initialized' };
    }

    try {
        const customerInfo = await Purchases.restorePurchases();
        const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]?.isActive ?? false;

        return {
            success: isPremium,
            customerInfo,
            error: isPremium ? undefined : 'No active subscriptions found',
        };
    } catch (e: any) {
        logError('RevenueCat:restorePurchases', e);
        return { success: false, error: e.message || 'Restore failed' };
    }
}

/**
 * Get subscription expiration date
 */
export async function getSubscriptionExpiration(): Promise<Date | null> {
    const customerInfo = await getCustomerInfo();
    if (!customerInfo) {
        return null;
    }

    const entitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    if (!entitlement?.expirationDate) {
        return null;
    }

    return new Date(entitlement.expirationDate);
}

/**
 * Check if RevenueCat is initialized
 */
export function isRevenueCatInitialized(): boolean {
    return isInitialized;
}
