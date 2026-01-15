export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom' | 'ranked';

export interface StoredBest {
    wpm: number;
    accuracy: number;
    date: string;
}

/** Empty personal bests record - reusable constant */
export const EMPTY_PERSONAL_BESTS: Record<Difficulty, StoredBest | null> = {
    easy: null,
    medium: null,
    hard: null,
    custom: null,
    ranked: null
};
