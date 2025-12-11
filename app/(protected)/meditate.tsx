import BreathingExercise from '@/components/BreathingExercise';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function MeditateScreen() {
    return (
        <View style={styles.container}>
            <BreathingExercise />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
