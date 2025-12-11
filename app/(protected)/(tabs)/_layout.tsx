import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#000000",
                tabBarInactiveTintColor: "#999999",
                tabBarStyle: {
                    ...Platform.select({
                        ios: {
                            position: 'absolute',
                        },
                        default: {},
                    }),
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons size={24} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color }) => <Ionicons size={24} name="compass-outline" color={color} />,
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Library',
                    tabBarIcon: ({ color }) => <Ionicons size={24} name="musical-notes-outline" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons size={24} name="person-outline" color={color} />,
                }}
            />
        </Tabs>
    );
}
