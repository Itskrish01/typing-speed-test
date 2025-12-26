export interface StoredBest {
    wpm: number;
    accuracy: number;
    date: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

// Key prefix
const STORAGE_KEY_PREFIX = "typing_speed_best_";

export const getStoredBest = (difficulty: Difficulty): StoredBest | null => {
    try {
        const item = localStorage.getItem(`${STORAGE_KEY_PREFIX}${difficulty}`);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return null;
    }
};

export const getAllStoredBests = (): Record<Difficulty, StoredBest | null> => {
    return {
        easy: getStoredBest('easy'),
        medium: getStoredBest('medium'),
        hard: getStoredBest('hard'),
        custom: null // We don't track bests for custom text generally
    };
};

export const setStoredBest = (difficulty: Difficulty, best: StoredBest): void => {
    if (difficulty === 'custom') return; // Don't save custom tests
    try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${difficulty}`, JSON.stringify(best));
    } catch (error) {
        console.error("Error writing to localStorage", error);
    }
};

export const isNewHighScore = (wpm: number, currentBest: StoredBest | null): boolean => {
    if (!currentBest) return true;
    return wpm > currentBest.wpm;
};

export const isFirstTest = (currentBest: StoredBest | null): boolean => {
    return currentBest === null;
};
