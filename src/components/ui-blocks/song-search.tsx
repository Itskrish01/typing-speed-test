/**
 * Song Search Component
 * 
 * A searchable dropdown for finding and selecting songs.
 * Uses shadcn Command component for accessible search experience.
 */

import { useState } from 'react';
import { Search, Music2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSongSearch } from '@/lib/hooks/use-song-search';
import { useAuth } from '@/context/auth-context';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { Song } from '@/api/song';

interface SongSearchProps {
    onSongSelect: (lyrics: string, songTitle: string, artist: string) => void;
    className?: string;
    disabled?: boolean;
}

export function SongSearch({ onSongSelect, className, disabled }: SongSearchProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const {
        query,
        setQuery,
        results,
        isLoading,
        error,
        selectSong,
        isSelectingLyrics,
        clearResults
    } = useSongSearch({ debounceMs: 300, maxResults: 8, enabled: !!user });

    // Don't render if user is not authenticated
    if (!user) {
        return null;
    }

    const handleSelect = async (song: Song) => {
        const lyrics = await selectSong(song);
        if (lyrics) {
            onSongSelect(lyrics.lyrics, lyrics.title, lyrics.artist);
            setOpen(false);
            clearResults();
            toast.success(`Loaded "${lyrics.title}" by ${lyrics.artist}`);
        } else if (error) {
            // Show toast for lyrics fetch errors
            toast.error(error, {
                description: 'Try searching for a different song'
            });
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            // Clear search when closing
            setTimeout(() => {
                setQuery('');
                clearResults();
            }, 150);
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled || isSelectingLyrics}
                    className={cn(
                        "h-7 sm:h-8 gap-2 px-3 sm:px-4 text-xs sm:text-sm transition-all",
                        "hover:bg-secondary/50 border-secondary/50",
                        className
                    )}
                >
                    {isSelectingLyrics ? (
                        <>
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            <span className="hidden sm:inline">Loading...</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Search Song</span>
                            <span className="sm:hidden">Song</span>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[300px] sm:w-[350px] p-0" 
                align="start"
                sideOffset={8}
            >
                <Command shouldFilter={false} className="border-none">
                    <CommandInput
                        placeholder="Search by song or artist..."
                        value={query}
                        onValueChange={setQuery}
                        className="h-10"
                    />
                    <CommandList className="max-h-[250px]">
                        {/* Error State */}
                        {error && (
                            <div className="flex items-center gap-2 p-4 text-sm text-destructive">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && !error && (
                            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Searching...</span>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && query.length >= 2 && results.length === 0 && (
                            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                No songs found for "{query}"
                            </CommandEmpty>
                        )}

                        {/* Initial State */}
                        {!isLoading && !error && query.length < 2 && (
                            <div className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground">
                                <Music2 className="w-8 h-8 opacity-50" />
                                <span>Type to search for a song</span>
                            </div>
                        )}

                        {/* Results */}
                        {!isLoading && !error && results.length > 0 && (
                            <CommandGroup heading="Songs">
                                {results.map((song) => (
                                    <CommandItem
                                        key={song.id}
                                        value={song.id}
                                        onSelect={() => handleSelect(song)}
                                        className="flex items-center gap-3 cursor-pointer py-3"
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary/50">
                                            <Music2 className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="font-medium truncate">
                                                {song.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {song.artist}
                                                {song.album && ` • ${song.album}`}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
