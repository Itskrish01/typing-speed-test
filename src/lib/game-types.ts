export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

export interface StoredBest {
    wpm: number;
    accuracy: number;
    date: string;
}
