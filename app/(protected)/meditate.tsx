import BreathingExercise from '@/components/BreathingExercise';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function MeditateScreen() {
    const params = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <BreathingExercise session={params} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
