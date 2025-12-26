import { type StoredBest, type Difficulty, EMPTY_PERSONAL_BESTS } from './game-types';

/**
 * Counts the number of correctly typed characters by comparing input against target.
 */
export const countCorrectChars = (input: string, target: string): number => {
    return input.split('').filter((char, i) => char === target[i]).length;
};

/**
 * Returns a random item from an array.
 */
export const getRandomItem = <T>(array: T[]): T => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
};

/**
 * Returns multiple random items from an array.
 */
export const getRandomItems = <T>(array: T[], count: number): T[] => {
    const items: T[] = [];
    for (let i = 0; i < count; i++) {
        items.push(getRandomItem(array));
    }
    return items;
};

/**
 * Maps Firestore bestWpm object to the app's StoredBest record format.
 */
export const mapFirestoreBestsToStore = (
    firestoreBests: Record<string, number> | undefined
): Record<Difficulty, StoredBest | null> => {
    if (!firestoreBests) {
        return { ...EMPTY_PERSONAL_BESTS };
    }

    const now = new Date().toISOString();

    return {
        easy: firestoreBests.easy ? { wpm: firestoreBests.easy, accuracy: 0, date: now } : null,
        medium: firestoreBests.medium ? { wpm: firestoreBests.medium, accuracy: 0, date: now } : null,
        hard: firestoreBests.hard ? { wpm: firestoreBests.hard, accuracy: 0, date: now } : null,
        custom: null
    };
};
