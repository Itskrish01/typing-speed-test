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
    startAfter,
    getCountFromServer
} from "firebase/firestore";
import { db } from "../config/firebase";

// Types
export interface CharacterStats {
    correct: number;
    incorrect: number;
    extra: number;
    missed: number;
}

export interface Mistake {
    expected: string;
    typed: string;
}

export interface TestResult {
    userId: string;
    wpm: number;
    accuracy: number;
    errors: number;
    difficulty: string;
    mode: string;
    category: string;
    characters?: CharacterStats;
    mistakes?: Mistake[];
    time?: number;
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
    bestRankedWpm?: number;
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
            bestRankedWpm: 0,
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
/**
 * Ensures a user profile exists. Creates one if missing.
 * Also patches incomplete profiles (missing required fields).
 */
export const ensureUserProfile = async (user: any) => {
    if (!user) return null;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const defaultProfile = {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email?.split('@')[0] || 'user',
        displayName: user.displayName || user.email?.split('@')[0] || 'user',
        createdAt: serverTimestamp(),
        themePreference: "dark",
        bestWpm: { easy: 0, medium: 0, hard: 0 },
        bestRankedWpm: 0,
        soundPreference: "off"
    };

    if (!userSnap.exists()) {
        await setDoc(userRef, defaultProfile);
        return defaultProfile as UserProfile;
    }

    // Patch incomplete profiles (e.g. if created by partial update)
    const data = userSnap.data();
    const patches: any = {};
    let needsPatch = false;

    if (!data.bestWpm) { patches.bestWpm = { easy: 0, medium: 0, hard: 0 }; needsPatch = true; }
    if (!data.createdAt) { patches.createdAt = serverTimestamp(); needsPatch = true; }
    if (data.bestRankedWpm === undefined) { patches.bestRankedWpm = 0; needsPatch = true; }
    if (!data.email && user.email) { patches.email = user.email; needsPatch = true; }

    if (needsPatch) {
        await setDoc(userRef, patches, { merge: true });
        return { ...data, ...patches } as UserProfile;
    }

    return data as UserProfile;
};

export const updateUserTheme = async (userId: string, theme: string) => {
    const userRef = doc(db, "users", userId);
    // Use updateDoc to avoid creating partial documents
    // UserDataSync guarantees profile existence
    try {
        await updateDoc(userRef, { themePreference: theme });
        invalidateProfileCache(userId);
    } catch {
        // If doc missing, we can't fix it here without user object
        // UserDataSync will fix it on next load
    }
};

export const updateUserSoundPreference = async (userId: string, sound: string) => {
    const userRef = doc(db, "users", userId);
    try {
        await updateDoc(userRef, { soundPreference: sound });
        invalidateProfileCache(userId);
    } catch {
        // Ignore if doc missing
    }
};

// Helper to invalidate profile cache
const invalidateProfileCache = (userId: string) => {
    localStorage.removeItem(`tapixo_profile_${userId}`);
    localStorage.removeItem(`tapixo_last_sync_${userId}`);
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

            // Handle ranked mode separately
            if (result.category === 'ranked') {
                const currentRankedBest = userData.bestRankedWpm || 0;
                if (result.wpm > currentRankedBest) {
                    await updateDoc(userRef, {
                        bestRankedWpm: result.wpm
                    });
                }
            } else {
                // Handle standard difficulty modes
                const currentBest = userData.bestWpm?.[result.difficulty] || 0;
                if (result.wpm > currentBest && result.mode === 'passage' && ['easy', 'medium', 'hard'].includes(result.difficulty)) {
                    await updateDoc(userRef, {
                        [`bestWpm.${result.difficulty}`]: result.wpm
                    });
                }
            }
        }

    } catch (error) {
        console.error("Error saving test result:", error);
        throw error;
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

export const getPaginatedHistory = async (
    userId: string,
    limitCount: number,
    lastDoc: any = null,
    sortBy: 'timestamp' | 'wpm' = 'timestamp',
    difficulty?: string
): Promise<{ data: HistoryEntry[]; lastDoc: any }> => {
    const historyRef = collection(db, "history");

    // Build constraints
    const constraints: any[] = [
        where("userId", "==", userId)
    ];

    if (difficulty && difficulty !== 'all') {
        constraints.push(where("difficulty", "==", difficulty));
    }

    if (sortBy === 'wpm') {
        constraints.push(orderBy("wpm", "desc"));
    } else {
        constraints.push(orderBy("timestamp", "desc"));
    }

    constraints.push(limit(limitCount));

    let q = query(historyRef, ...constraints);

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

// ------ Leaderboard ------

export interface LeaderboardEntry {
    rank: number;
    uid: string;
    username: string;
    bestRankedWpm: number;
}

/**
 * Get top 50 users by best ranked WPM for leaderboard
 */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const usersRef = collection(db, "users");
    const q = query(
        usersRef,
        where("bestRankedWpm", ">", 0),
        orderBy("bestRankedWpm", "desc"),
        limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc, index) => ({
        rank: index + 1,
        uid: doc.id,
        username: doc.data().username || 'Anonymous',
        bestRankedWpm: doc.data().bestRankedWpm || 0
    }));
};

/**
 * Get user's global rank based on their best ranked WPM
 */
export const getUserRank = async (userId: string): Promise<number | null> => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const userData = userSnap.data();
    const userWpm = userData.bestRankedWpm || 0;

    if (userWpm === 0) return null;

    // Count users with higher WPM using efficient server-side aggregation
    const usersRef = collection(db, "users");
    const q = query(
        usersRef,
        where("bestRankedWpm", ">", userWpm)
    );

    const snapshot = await getCountFromServer(q);
    return snapshot.data().count + 1;
};
