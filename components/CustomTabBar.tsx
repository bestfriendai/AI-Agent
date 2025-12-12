import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    // Separate 'explore' route (Search) from the others (Tab Group)
    const mainRoutes = state.routes.filter(r => r.name !== 'explore');
    const exploreRoute = state.routes.find(r => r.name === 'explore');

    return (
        <View style={[styles.container, { bottom: insets.bottom + 10 }]}>
            {/* Main Tabs Group */}
            <View style={styles.tabGroupContainer}>
                <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
                    <View style={styles.tabGroupInner}>
                        {mainRoutes.map((route) => {
                            const { options } = descriptors[route.key];
                            const label = options.title !== undefined ? options.title : route.name;
                            const isFocused = state.index === state.routes.indexOf(route);

                            const onPress = () => {
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name);
                                }
                            };

                            // Define icons based on route name
                            let iconName: keyof typeof Ionicons.glyphMap = "home";
                            if (route.name === 'index') {
                                iconName = isFocused ? "home" : "home-outline";
                            } else if (route.name === 'library') {
                                iconName = isFocused ? "musical-notes" : "musical-notes-outline";
                            } else if (route.name === 'profile') {
                                iconName = isFocused ? "person" : "person-outline";
                            }

                            return (
                                <TouchableOpacity
                                    key={route.key}
                                    onPress={onPress}
                                    style={styles.tabItem}
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                >
                                    <Ionicons
                                        name={iconName}
                                        size={22}
                                        color={isFocused ? "#FFFFFF" : "#8E8E93"}
                                    />
                                    <Text style={[
                                        styles.tabLabel,
                                        { color: isFocused ? "#FFFFFF" : "#8E8E93" }
                                    ]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </BlurView>
            </View>

            {/* Search/Explore Button */}
            {exploreRoute && (
                <TouchableOpacity
                    style={styles.searchButtonContainer}
                    onPress={() => navigation.navigate(exploreRoute.name)}
                    accessibilityRole="button"
                >
                    <BlurView intensity={60} tint="dark" style={styles.searchButtonBlur}>
                        <Ionicons name="search" size={24} color="#FFFFFF" />
                    </BlurView>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        flexDirection: 'row',
        left: 20,
        right: 20,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    tabGroupContainer: {
        flex: 1,
        marginRight: 15,
        borderRadius: 35,
        overflow: 'hidden',
        height: 65,
    },
    blurContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(10, 10, 10, 0.70)',
    },
    tabGroupInner: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '500',
    },
    searchButtonContainer: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        overflow: 'hidden',
    },
    searchButtonBlur: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(10, 10, 10, 0.70)',
    }
});
