/**
 * Song API Module
 * 
 * Public API for song search and lyrics functionality.
 * Import from this file for all song-related operations.
 * 
 * @example
 * import { searchSongs, getSongLyrics } from '@/api/song';
 * 
 * const results = await searchSongs('queen');
 * const lyrics = await getSongLyrics(results.songs[0].id);
 */

export {
    searchSongs,
    getSongLyrics,
    setSongProvider,
    getCurrentProviderName,
    isSongApiError,
} from './song-service';

export type {
    Song,
    SongSearchResult,
    SongLyrics,
    SongApiError,
    SongApiProvider,
} from './types';
