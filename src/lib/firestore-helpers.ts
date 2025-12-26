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
    limit
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
            }
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
            bestWpm: { easy: 0, medium: 0, hard: 0 }
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

export const getUserHistory = async (userId: string, limitCount = 50) => {
    const historyRef = collection(db, "history");
    const q = query(
        historyRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ------ Public Card Data ------
// Reuses getUserProfile to get theme and bests.
// Can be extended if we want specific card data separate from profile.
