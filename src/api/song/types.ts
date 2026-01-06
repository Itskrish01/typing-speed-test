/**
 * Song API Types
 * Defines the contract for song search functionality
 */

export interface Song {
    id: string;
    title: string;
    artist: string;
    album?: string;
    thumbnailUrl?: string;
}

export interface SongLyrics {
    songId: string;
    title: string;
    artist: string;
    lyrics: string;
}

export interface SongSearchResult {
    songs: Song[];
    total: number;
}

export interface SongApiError {
    code: string;
    message: string;
    details?: unknown;
}

/**
 * Song API Provider Interface
 * Implement this interface to add new song API providers
 */
export interface SongApiProvider {
    /** Unique identifier for this provider */
    readonly name: string;
    
    /** Search for songs by query */
    searchSongs(query: string, limit?: number): Promise<SongSearchResult>;
    
    /** Get lyrics for a specific song */
    getLyrics(songId: string): Promise<SongLyrics>;
}
