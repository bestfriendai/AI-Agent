import { addDoc, collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';

export interface StreakEntry {
    id?: string;
    user_id: string;
    session_type: string;
    session_title: string;
    session_details?: {
        duration_minutes?: number;
        accent_color?: string;
        audio_enabled?: boolean;
        [key: string]: any;
    };
    completion_time: Timestamp;
    total_session_duration_seconds: number;
}

export async function saveStreakEntry(data: {
    userId: string;
    sessionType: string;
    sessionTitle: string;
    sessionDetails?: Record<string, any>;
    totalDurationSeconds: number;
}): Promise<void> {
    try {
        await addDoc(collection(db, 'streak'), {
            user_id: data.userId,
            session_type: data.sessionType,
            session_title: data.sessionTitle,
            session_details: data.sessionDetails || {},
            completion_time: Timestamp.now(),
            total_session_duration_seconds: data.totalDurationSeconds,
        });
        console.log('Streak entry saved for user:', data.userId);
    } catch (error) {
        console.error('Error saving streak entry:', error);
        throw error;
    }
}

export async function getStreakEntries(userId: string): Promise<StreakEntry[]> {
    try {
        const streakRef = collection(db, 'streak');
        const q = query(
            streakRef,
            where('user_id', '==', userId),
            orderBy('completion_time', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const entries: StreakEntry[] = [];
        querySnapshot.forEach((doc) => {
            entries.push({ id: doc.id, ...doc.data() } as StreakEntry);
        });

        return entries;
    } catch (error) {
        console.error('Error fetching streak entries:', error);
        return [];
    }
}

export async function getTotalFocusedTime(userId: string): Promise<number> {
    try {
        const entries = await getStreakEntries(userId);
        const totalSeconds = entries.reduce(
            (acc, entry) => acc + (entry.total_session_duration_seconds || 0),
            0
        );
        return Math.floor(totalSeconds / 60);
    } catch (error) {
        console.error('Error calculating focused time:', error);
        return 0;
    }
}

export async function getWeeklyStreakActivity(userId: string): Promise<number[]> {
    try {
        const entries = await getStreakEntries(userId);
        const activity = [0, 0, 0, 0, 0, 0, 0];

        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        entries.forEach((entry) => {
            const entryDate = entry.completion_time.toDate();
            if (entryDate >= monday) {
                let dayIndex = entryDate.getDay() - 1;
                if (dayIndex === -1) dayIndex = 6;

                const durationMins = entry.total_session_duration_seconds / 60;
                activity[dayIndex] += durationMins;
            }
        });

        const maxVal = Math.max(...activity, 1);
        return activity.map(v => (v / maxVal) * 80);
    } catch (error) {
        console.error('Error calculating weekly activity:', error);
        return [0, 0, 0, 0, 0, 0, 0];
    }
}
