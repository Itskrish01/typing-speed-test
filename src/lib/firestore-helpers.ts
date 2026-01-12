import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs,
    limit,
    startAfter
} from "firebase/firestore";
import { db } from "../config/firebase";

// Types
export interface TestResult {
    userId: string;
    wpm: number;
    accuracy: number;
    difficulty: string;
    mode: string;
    category: string;
    timestamp: any; // ServerTimestamp
}

export interface HistoryEntry extends TestResult {
    id: string;
}

export interface UserProfile {
    uid: string;
    email: string | null;
    username: string;
    displayName?: string;
    createdAt: any;
    themePreference?: string;
    bestWpm?: {
        easy: number;
        medium: number;
        hard: number;
    };
    soundPreference?: string;
}

// ------ User Profile & Theme ------

export const createUserProfile = async (user: any, username: string) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            username: username,
            displayName: user.displayName || username,
            createdAt: serverTimestamp(),
            themePreference: "dark",
            bestWpm: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            soundPreference: "off"
        });
    }
};

export const getUserProfile = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
};

/**
 * Ensures a user profile exists. Creates one if missing.
 * Useful for users who signed up before profile creation was implemented.
 */
export const ensureUserProfile = async (user: any) => {
    if (!user) return null;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newProfile = {
            uid: user.uid,
            email: user.email,
            username: user.displayName || user.email?.split('@')[0] || 'user',
            displayName: user.displayName || user.email?.split('@')[0] || 'user',
            createdAt: serverTimestamp(),
            themePreference: "dark",
            bestWpm: { easy: 0, medium: 0, hard: 0 },
            soundPreference: "off"
        };
        await setDoc(userRef, newProfile);
        return newProfile as UserProfile;
    }
    return userSnap.data() as UserProfile;
};

export const updateUserTheme = async (userId: string, theme: string) => {
    const userRef = doc(db, "users", userId);
    // Use setDoc with merge to create doc if it doesn't exist
    await setDoc(userRef, { themePreference: theme }, { merge: true });
};

export const updateUserSoundPreference = async (userId: string, sound: string) => {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { soundPreference: sound }, { merge: true });
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const q = query(
        collection(db, "users"),
        where("username", "==", username),
        limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
};

export const getUserProfileByUsername = async (username: string): Promise<UserProfile | null> => {
    const q = query(
        collection(db, "users"),
        where("username", "==", username),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        return snapshot.docs[0].data() as UserProfile;
    }
    return null;
};

export const updateUsername = async (userId: string, newUsername: string) => {
    // 1. Check strict uniqueness again before writing
    const isAvailable = await checkUsernameAvailability(newUsername);
    if (!isAvailable) {
        throw new Error("Username is already taken");
    }

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { username: newUsername });
};

// ------ Test Results & History ------

export const saveTestResult = async (userId: string, result: Omit<TestResult, 'userId' | 'timestamp'>) => {
    try {
        // 1. Add to history collection
        await addDoc(collection(db, "history"), {
            userId,
            ...result,
            timestamp: serverTimestamp()
        });

        // 2. Update Personal Best if needed
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const currentBest = userData.bestWpm?.[result.difficulty] || 0;

            if (result.wpm > currentBest && result.mode === 'passage' && ['easy', 'medium', 'hard'].includes(result.difficulty)) {
                await updateDoc(userRef, {
                    [`bestWpm.${result.difficulty}`]: result.wpm
                });
            }
        }

    } catch (error) {
        console.error("Error saving test result:", error);
    }
};



export const getUserHistory = async (userId: string, limitCount = 50): Promise<HistoryEntry[]> => {
    // Keep original for backward compatibility if needed, or redirect to paginated
    const historyRef = collection(db, "history");
    const q = query(
        historyRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryEntry));
};

export const getPaginatedHistory = async (userId: string, limitCount: number, lastDoc: any = null): Promise<{ data: HistoryEntry[]; lastDoc: any }> => {
    const historyRef = collection(db, "history");
    let q = query(
        historyRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
    );

    if (lastDoc) {
        q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryEntry));
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { data, lastDoc: lastVisible };
};

export const getUserStatsHistory = async (userId: string): Promise<HistoryEntry[]> => {
    // Fetch a large batch for stats/heatmap (e.g., last 1000 tests)
    // This allows heatmap to show ~1 year of data for typical users (3 tests/day)
    // and stats to be statistically significant.
    const historyRef = collection(db, "history");
    const q = query(
        historyRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(1000)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryEntry));
};

// ------ Public Card Data ------
// Reuses getUserProfile to get theme and bests.
// Can be extended if we want specific card data separate from profile.
