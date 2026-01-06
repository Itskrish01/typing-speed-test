/**
 * Song Service
 * 
 * Central service for song-related API operations.
 * Uses the Strategy pattern to allow swapping providers easily.
 * 
 * Current setup:
 * - Lyrics.ovh API for both search and lyrics (free, no key needed)
 * 
 * To switch providers:
 * 1. Import your new provider
 * 2. Change the defaultProvider instantiation
 */

import type { SongApiProvider, Song, SongSearchResult, SongLyrics, SongApiError } from './types';
import { LyricsOvhProvider } from './providers/lyrics-ovh-provider';

// Default provider - uses Lyrics.ovh for search and lyrics
const defaultProvider: SongApiProvider = new LyricsOvhProvider();

// Service state
let currentProvider: SongApiProvider = defaultProvider;

/**
 * Set a custom provider (useful for testing or runtime switching)
 */
export function setSongProvider(provider: SongApiProvider): void {
    currentProvider = provider;
}

/**
 * Get the current provider name
 */
export function getCurrentProviderName(): string {
    return currentProvider.name;
}

/**
 * Search for songs
 */
export async function searchSongs(query: string, limit?: number): Promise<SongSearchResult> {
    try {
        return await currentProvider.searchSongs(query, limit);
    } catch (error) {
        throw createApiError('SEARCH_FAILED', 'Failed to search for songs', error);
    }
}

/**
 * Get lyrics for a song
 */
export async function getSongLyrics(songId: string): Promise<SongLyrics> {
    try {
        return await currentProvider.getLyrics(songId);
    } catch (error) {
        throw createApiError('LYRICS_FETCH_FAILED', 'Failed to fetch lyrics', error);
    }
}

/**
 * Create a standardized API error
 */
function createApiError(code: string, message: string, details?: unknown): SongApiError {
    return {
        code,
        message,
        details: details instanceof Error ? details.message : details
    };
}

/**
 * Type guard for SongApiError
 */
export function isSongApiError(error: unknown): error is SongApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error
    );
}

// Re-export types for convenience
export type { Song, SongSearchResult, SongLyrics, SongApiError, SongApiProvider };
