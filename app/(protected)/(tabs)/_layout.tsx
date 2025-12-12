import { CustomTabBar } from '@/components/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Library',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                }}
            />
        </Tabs>
    );
}
