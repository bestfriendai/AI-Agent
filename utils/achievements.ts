import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';

export interface Achievement {
    id?: string;
    user_id: string;
    achievement_type: string;
    title: string;
    description: string;
    earned_at: Timestamp;
}

export async function addAchievement(
    userId: string,
    achievementType: string,
    title: string,
    description: string
): Promise<void> {
    try {
        await addDoc(collection(db, 'achievements'), {
            user_id: userId,
            achievement_type: achievementType,
            title,
            description,
            earned_at: Timestamp.now(),
        });
        console.log('Achievement added:', title);
    } catch (error) {
        console.error('Error adding achievement:', error);
        throw error;
    }
}

export async function hasAchievement(
    userId: string,
    achievementType: string
): Promise<boolean> {
    try {
        const achievementsRef = collection(db, 'achievements');
        const q = query(
            achievementsRef,
            where('user_id', '==', userId),
            where('achievement_type', '==', achievementType)
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking achievement:', error);
        return false;
    }
}

export async function addBreathingExerciseAchievement(userId: string): Promise<void> {
    const achievementType = 'breathing_exercise_completed';
    const hasIt = await hasAchievement(userId, achievementType);

    if (!hasIt) {
        await addAchievement(
            userId,
            achievementType,
            'First Breath',
            'Completed your first breathing exercise'
        );
    }
}
