/**
 * Custom hook for song search with debouncing
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { searchSongs, getSongLyrics, isSongApiError } from '@/api/song';
import type { Song, SongLyrics } from '@/api/song';

interface UseSongSearchOptions {
    debounceMs?: number;
    minQueryLength?: number;
    maxResults?: number;
}

interface UseSongSearchReturn {
    query: string;
    setQuery: (query: string) => void;
    results: Song[];
    isLoading: boolean;
    error: string | null;
    selectSong: (song: Song) => Promise<SongLyrics | null>;
    isSelectingLyrics: boolean;
    clearResults: () => void;
}

export function useSongSearch(options: UseSongSearchOptions = {}): UseSongSearchReturn {
    const {
        debounceMs = 300,
        minQueryLength = 2,
        maxResults = 8
    } = options;

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelectingLyrics, setIsSelectingLyrics] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounced search effect
    useEffect(() => {
        // Clear previous timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Clear previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Reset if query too short
        if (query.trim().length < minQueryLength) {
            setResults([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Debounce the search
        debounceRef.current = setTimeout(async () => {
            abortControllerRef.current = new AbortController();

            try {
                const result = await searchSongs(query, maxResults);
                setResults(result.songs);
                setError(null);
            } catch (err) {
                if (isSongApiError(err)) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred');
                }
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, debounceMs);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, debounceMs, minQueryLength, maxResults]);

    const selectSong = useCallback(async (song: Song): Promise<SongLyrics | null> => {
        setIsSelectingLyrics(true);
        setError(null);

        try {
            const lyrics = await getSongLyrics(song.id);
            return lyrics;
        } catch (err) {
            // Handle specific error messages
            const errorMessage = err instanceof Error 
                ? err.message 
                : isSongApiError(err) 
                    ? err.message 
                    : 'Failed to load lyrics. Try another song.';
            setError(errorMessage);
            return null;
        } finally {
            setIsSelectingLyrics(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setQuery('');
        setResults([]);
        setError(null);
    }, []);

    return {
        query,
        setQuery,
        results,
        isLoading,
        error,
        selectSong,
        isSelectingLyrics,
        clearResults
    };
}
