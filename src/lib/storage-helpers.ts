// ====== Theme Storage ======

const THEME_STORAGE_KEY = 'theme';

import { type Theme, ALL_THEMES } from '@/lib/themes';

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
