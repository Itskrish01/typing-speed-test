
import type { Difficulty } from './game-types';

export type Mode = 'timed' | 'passage';
export type Category = 'words' | 'quotes' | 'lyrics' | 'code';
export type Language = 'javascript' | 'python' | 'java' | 'c++' | 'c#' | 'sql' | 'html' | 'css';

export interface GameConfig {
    difficulty: Difficulty;
    mode: Mode;
    category: Category;
    language: Language;
    timedDuration: number;
}

const STORAGE_KEY = 'tapixo-game-config';

const DEFAULT_CONFIG: GameConfig = {
    difficulty: 'hard',
    mode: 'passage',
    category: 'words',
    language: 'javascript',
    timedDuration: 60,
};

/**
 * Saves game configuration to localStorage
 */
export const saveGameConfig = (config: Partial<GameConfig>): void => {
    try {
        const existing = loadGameConfig();
        const updated = { ...existing, ...config };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save game config:', error);
    }
};

/**
 * Loads game configuration from localStorage
 */
export const loadGameConfig = (): GameConfig => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to handle missing keys from older versions
            return { ...DEFAULT_CONFIG, ...parsed };
        }
    } catch (error) {
        console.error('Failed to load game config:', error);
    }
    return { ...DEFAULT_CONFIG };
};

/**
 * Clears game configuration from localStorage
 */
export const clearGameConfig = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear game config:', error);
    }
};

// ====== Theme Storage ======

const THEME_STORAGE_KEY = 'theme';

export type Theme =
    | "dark"
    | "light"
    | "system"
    | "espresso"
    | "midnight"
    | "forest"
    | "ruby"
    | "vscode"
    | "monochrome"
    | "matrix"
    | "synthwave";

const DEFAULT_THEME: Theme = 'system';

/**
 * Saves theme preference to localStorage
 */
export const saveTheme = (theme: Theme): void => {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.error('Failed to save theme:', error);
    }
};

/**
 * Loads theme preference from localStorage
 */
export const loadTheme = (): Theme => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
            return stored as Theme;
        }
    } catch (error) {
        console.error('Failed to load theme:', error);
    }
    return DEFAULT_THEME;
};

/**
 * Clears theme preference from localStorage
 */
export const clearTheme = (): void => {
    try {
        localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear theme:', error);
    }
};
