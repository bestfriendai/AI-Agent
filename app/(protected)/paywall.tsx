/**
 * Paywall Screen
 * Premium subscription purchase flow
 */

import { colors } from '@/utils/colors';
import haptics from '@/utils/haptics';
import { useSubscription, getBestPackage, formatPrice, formatPeriod } from '@/hooks/useSubscription';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Premium features to display
const PREMIUM_FEATURES = [
    {
        icon: 'infinite-outline' as const,
        title: 'Unlimited Sessions',
        description: 'Access unlimited AI conversations',
    },
    {
        icon: 'sparkles-outline' as const,
        title: 'Premium Voice',
        description: 'Enhanced voice quality and responses',
    },
    {
        icon: 'analytics-outline' as const,
        title: 'Advanced Insights',
        description: 'Detailed session analytics and progress',
    },
    {
        icon: 'cloud-download-outline' as const,
        title: 'Offline Access',
        description: 'Download sessions for offline use',
    },
];

export default function PaywallScreen(): JSX.Element {
    const router = useRouter();
    const {
        isLoading,
        isPremium,
        offerings,
        error,
        purchase,
        restore,
    } = useSubscription();

    // Get the best package to display
    const bestPackage = useMemo(() => getBestPackage(offerings), [offerings]);

    // Handle purchase
    const handlePurchase = useCallback(async () => {
        if (!bestPackage) return;

        haptics.medium();
        const success = await purchase(bestPackage);

        if (success) {
            router.back();
        }
    }, [bestPackage, purchase, router]);

    // Handle restore
    const handleRestore = useCallback(async () => {
        haptics.light();
        const success = await restore();

        if (success) {
            router.back();
        }
    }, [restore, router]);

    // Handle close
    const handleClose = useCallback(() => {
        haptics.light();
        router.back();
    }, [router]);

    // Already premium - show success state
    if (isPremium) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.successContainer}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                        </View>
                        <Text style={styles.successTitle}>You're Premium!</Text>
                        <Text style={styles.successSubtitle}>
                            Enjoy unlimited access to all features
                        </Text>
                        <Pressable
                            style={styles.successButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.successButtonText}>Continue</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Background gradient */}
            <LinearGradient
                colors={['#F8FAFC', '#EFF6FF', '#DBEAFE']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.closeButton}
                        onPress={handleClose}
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </Pressable>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <Animated.View
                        entering={FadeInUp.delay(100).springify()}
                        style={styles.heroSection}
                    >
                        <View style={styles.iconContainer}>
                            <LinearGradient
                                colors={[colors.primary, '#60A5FA']}
                                style={styles.iconGradient}
                            >
                                <Ionicons name="diamond" size={40} color="white" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.heroTitle}>Upgrade to Premium</Text>
                        <Text style={styles.heroSubtitle}>
                            Unlock the full potential of your mindfulness journey
                        </Text>
                    </Animated.View>

                    {/* Features List */}
                    <View style={styles.featuresContainer}>
                        {PREMIUM_FEATURES.map((feature, index) => (
                            <Animated.View
                                key={feature.title}
                                entering={FadeInDown.delay(200 + index * 100).springify()}
                                style={styles.featureRow}
                            >
                                <View style={styles.featureIcon}>
                                    <Ionicons
                                        name={feature.icon}
                                        size={24}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDescription}>
                                        {feature.description}
                                    </Text>
                                </View>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Pricing Card */}
                    {bestPackage && (
                        <Animated.View
                            entering={FadeInDown.delay(600).springify()}
                            style={styles.pricingCard}
                        >
                            <View style={styles.pricingBadge}>
                                <Text style={styles.pricingBadgeText}>BEST VALUE</Text>
                            </View>
                            <Text style={styles.pricingAmount}>
                                {formatPrice(bestPackage)}
                            </Text>
                            <Text style={styles.pricingPeriod}>
                                {formatPeriod(bestPackage)}
                            </Text>
                            {bestPackage.packageType === 'ANNUAL' && (
                                <Text style={styles.pricingSavings}>
                                    Save 40% compared to monthly
                                </Text>
                            )}
                        </Animated.View>
                    )}

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning-outline" size={20} color={colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Footer Actions */}
                <View style={styles.footer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.purchaseButton,
                            pressed && styles.buttonPressed,
                            isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handlePurchase}
                        disabled={isLoading || !bestPackage}
                        accessibilityRole="button"
                        accessibilityLabel="Subscribe"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.purchaseButtonText}>
                                Start Premium
                            </Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={styles.restoreButton}
                        onPress={handleRestore}
                        disabled={isLoading}
                        accessibilityRole="button"
                        accessibilityLabel="Restore purchases"
                    >
                        <Text style={styles.restoreButtonText}>
                            Restore Purchases
                        </Text>
                    </Pressable>

                    <Text style={styles.termsText}>
                        By subscribing, you agree to our Terms of Service and Privacy Policy.
                        Subscription automatically renews unless cancelled.
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    heroSection: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 32,
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 12,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 17,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    featuresContainer: {
        gap: 16,
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
    },
    pricingCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
        marginBottom: 16,
    },
    pricingBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 16,
    },
    pricingBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    pricingAmount: {
        fontSize: 48,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    pricingPeriod: {
        fontSize: 17,
        color: '#666',
        marginTop: 4,
    },
    pricingSavings: {
        fontSize: 14,
        color: colors.success,
        fontWeight: '600',
        marginTop: 12,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    errorText: {
        flex: 1,
        fontSize: 14,
        color: colors.error,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 12,
    },
    purchaseButton: {
        height: 56,
        backgroundColor: colors.primary,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.9,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    purchaseButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
    restoreButton: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    restoreButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary,
    },
    termsText: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 20,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    successIcon: {
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    successSubtitle: {
        fontSize: 17,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    successButton: {
        paddingHorizontal: 40,
        paddingVertical: 16,
        backgroundColor: colors.primary,
        borderRadius: 28,
    },
    successButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: 'white',
    },
});
