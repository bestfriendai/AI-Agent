/**
 * useSubscription Hook
 * Provides subscription state and actions for the app
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import {
    getCustomerInfo,
    getOfferings,
    hasPremiumAccess,
    purchasePackage,
    restorePurchases,
    getSubscriptionExpiration,
    isRevenueCatInitialized,
    PREMIUM_ENTITLEMENT_ID,
} from '@/services/revenuecat';
import haptics from '@/utils/haptics';
import { logError } from '@/utils/errors';

interface SubscriptionState {
    isLoading: boolean;
    isPremium: boolean;
    offerings: PurchasesOfferings | null;
    customerInfo: CustomerInfo | null;
    expirationDate: Date | null;
    error: string | null;
}

interface SubscriptionActions {
    refresh: () => Promise<void>;
    purchase: (pkg: PurchasesPackage) => Promise<boolean>;
    restore: () => Promise<boolean>;
}

export function useSubscription(): SubscriptionState & SubscriptionActions {
    const isMounted = useRef(true);
    const [state, setState] = useState<SubscriptionState>({
        isLoading: true,
        isPremium: false,
        offerings: null,
        customerInfo: null,
        expirationDate: null,
        error: null,
    });

    // Cleanup on unmount
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    /**
     * Refresh subscription state
     */
    const refresh = useCallback(async (): Promise<void> => {
        if (!isRevenueCatInitialized()) {
            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: null,
                }));
            }
            return;
        }

        try {
            if (isMounted.current) {
                setState((prev) => ({ ...prev, isLoading: true, error: null }));
            }

            const [customerInfo, offerings, isPremium, expirationDate] = await Promise.all([
                getCustomerInfo(),
                getOfferings(),
                hasPremiumAccess(),
                getSubscriptionExpiration(),
            ]);

            if (isMounted.current) {
                setState({
                    isLoading: false,
                    isPremium,
                    offerings,
                    customerInfo,
                    expirationDate,
                    error: null,
                });
            }
        } catch (e) {
            logError('useSubscription:refresh', e);
            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: 'Failed to load subscription info',
                }));
            }
        }
    }, []);

    /**
     * Purchase a subscription package
     */
    const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
        try {
            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            const result = await purchasePackage(pkg);

            if (result.success) {
                haptics.success();

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        isPremium: true,
                        customerInfo: result.customerInfo ?? null,
                        error: null,
                    }));
                }

                return true;
            } else {
                // User cancelled - don't show error
                if (result.error === 'cancelled') {
                    if (isMounted.current) {
                        setState((prev) => ({ ...prev, isLoading: false }));
                    }
                    return false;
                }

                haptics.error();

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: result.error ?? 'Purchase failed',
                    }));
                }

                return false;
            }
        } catch (e) {
            logError('useSubscription:purchase', e);
            haptics.error();

            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: 'Purchase failed. Please try again.',
                }));
            }

            return false;
        }
    }, []);

    /**
     * Restore previous purchases
     */
    const restore = useCallback(async (): Promise<boolean> => {
        try {
            setState((prev) => ({ ...prev, isLoading: true, error: null }));

            const result = await restorePurchases();

            if (result.success) {
                haptics.success();

                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        isPremium: true,
                        customerInfo: result.customerInfo ?? null,
                        error: null,
                    }));
                }

                return true;
            } else {
                if (isMounted.current) {
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: result.error ?? 'No purchases to restore',
                    }));
                }

                return false;
            }
        } catch (e) {
            logError('useSubscription:restore', e);
            haptics.error();

            if (isMounted.current) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: 'Restore failed. Please try again.',
                }));
            }

            return false;
        }
    }, []);

    // Load subscription state on mount
    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        ...state,
        refresh,
        purchase,
        restore,
    };
}

/**
 * Get the best available package from offerings
 */
export function getBestPackage(offerings: PurchasesOfferings | null): PurchasesPackage | null {
    if (!offerings?.current) {
        return null;
    }

    // Prefer annual, then monthly
    const annual = offerings.current.annual;
    if (annual) {
        return annual;
    }

    const monthly = offerings.current.monthly;
    if (monthly) {
        return monthly;
    }

    // Fallback to first available package
    return offerings.current.availablePackages[0] ?? null;
}

/**
 * Format price for display
 */
export function formatPrice(pkg: PurchasesPackage): string {
    return pkg.product.priceString;
}

/**
 * Format subscription period for display
 */
export function formatPeriod(pkg: PurchasesPackage): string {
    const identifier = pkg.packageType;

    switch (identifier) {
        case 'ANNUAL':
            return 'per year';
        case 'MONTHLY':
            return 'per month';
        case 'WEEKLY':
            return 'per week';
        case 'LIFETIME':
            return 'lifetime';
        default:
            return '';
    }
}
