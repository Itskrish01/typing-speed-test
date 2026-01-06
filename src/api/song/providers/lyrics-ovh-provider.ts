/**
 * Lyrics.ovh Unified Provider
 * 
 * Uses the Lyrics.ovh API for both song search and lyrics fetching.
 * - Search: https://api.lyrics.ovh/suggest/{query}
 * - Lyrics: https://api.lyrics.ovh/v1/{artist}/{title}
 * 
 * No API key required.
 */

import type { SongApiProvider, Song, SongSearchResult, SongLyrics } from '../types';

// API response types based on lyrics.ovh
interface LyricsOvhTrack {
    id: number;
    title: string;
    title_short: string;
    artist: {
        id: number;
        name: string;
        picture_medium?: string;
    };
    album: {
        id: number;
        title: string;
        cover_small?: string;
        cover_medium?: string;
    };
    duration: number;
}

interface LyricsOvhLyricsResponse {
    lyrics?: string;
    error?: string;
}

// Search response is wrapped in { data: [...], total: number }
interface LyricsOvhSearchResponse {
    data?: LyricsOvhTrack[];
    total?: number;
    next?: string;
}

// Store song metadata for lyrics lookup
const songCache = new Map<string, { artist: string; title: string }>();

/**
 * Clean up lyrics text for typing practice
 */
function cleanLyrics(lyrics: string): string {
    return lyrics
        // Remove common annotations
        .replace(/\[.*?\]/g, '') // [Verse 1], [Chorus], etc.
        .replace(/\(.*?\)/g, '') // (x2), (repeat), etc.
        // Normalize line breaks
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Replace multiple newlines with single space
        .replace(/\n+/g, ' ')
        // Trim each segment and clean up
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/**
 * Map lyrics.ovh track to our Song interface
 */
function mapTrackToSong(track: LyricsOvhTrack): Song {
    return {
        id: String(track.id),
        title: track.title_short || track.title,
        artist: track.artist.name,
        album: track.album.title,
        thumbnailUrl: track.album.cover_small || track.album.cover_medium
    };
}

export class LyricsOvhProvider implements SongApiProvider {
    readonly name = 'lyrics-ovh';
    
    private readonly baseUrl = 'https://api.lyrics.ovh';
    
    async searchSongs(query: string, limit: number = 10): Promise<SongSearchResult> {
        if (!query.trim()) {
            return { songs: [], total: 0 };
        }
        
        const searchUrl = `${this.baseUrl}/suggest/${encodeURIComponent(query)}`;
        
        try {
            const response = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Search failed with status ${response.status}`);
            }
            
            const data: LyricsOvhSearchResponse = await response.json();
            
            // API returns { data: [...], total: number }
            const tracks = data.data || [];
            const limitedTracks = tracks.slice(0, limit);
            
            // Map tracks and cache metadata for lyrics lookup
            const songs = limitedTracks.map(track => {
                const song = mapTrackToSong(track);
                // Cache artist and title for lyrics fetching
                songCache.set(song.id, {
                    artist: track.artist.name,
                    title: track.title_short || track.title
                });
                return song;
            });
            
            return {
                songs,
                total: data.total || songs.length
            };
        } catch (error) {
            console.error('Lyrics.ovh search error:', error);
            throw new Error('Failed to search songs. Please try again.');
        }
    }
    
    async getLyrics(songId: string): Promise<SongLyrics> {
        // Get cached song metadata
        const songMeta = songCache.get(songId);
        
        if (!songMeta) {
            throw new Error('Song not found. Please search again.');
        }
        
        const { artist, title } = songMeta;
        const lyricsUrl = `${this.baseUrl}/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
        
        try {
            const response = await fetch(lyricsUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Lyrics not found for "${title}" by ${artist}`);
                }
                throw new Error(`Failed to fetch lyrics (${response.status})`);
            }
            
            const data: LyricsOvhLyricsResponse = await response.json();
            
            if (data.error || !data.lyrics) {
                throw new Error(`Lyrics not available for "${title}" by ${artist}`);
            }
            
            const cleanedLyrics = cleanLyrics(data.lyrics);
            
            if (cleanedLyrics.length < 50) {
                throw new Error('Lyrics too short for typing practice');
            }
            
            // Limit lyrics length for typing practice (max ~500 chars)
            const truncatedLyrics = cleanedLyrics.length > 500 
                ? cleanedLyrics.substring(0, 500).replace(/\s\S*$/, '') // Cut at word boundary
                : cleanedLyrics;
            
            return {
                songId,
                title,
                artist,
                lyrics: truncatedLyrics
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch lyrics. Please try another song.');
        }
    }
}
