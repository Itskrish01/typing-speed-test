import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { Settings, Check, X } from "lucide-react";
import { useGameConfig, useGameActions, useGameStatus } from "../../store/game-store";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { SongSearch } from "./song-search";
import { useAuth } from "../../context/auth-context";


export const ConfigBar = () => {
    const { difficulty, setDifficulty, mode, setMode, setCustomText, timedDuration, setTimedDuration, category, setCategory, language, setLanguage } = useGameConfig();
    const { resetGame } = useGameActions();
    const { isActive } = useGameStatus();
    const { user } = useAuth();
    const navigate = useNavigate();
    const difficulties = ['easy', 'medium', 'hard', 'custom'] as const;
    const categories = ['words', 'quotes', 'lyrics', 'code'] as const;
    const languages = ['javascript', 'python', 'java', 'c++', 'c#', 'sql', 'html', 'css'] as const;
    const durations = [15, 30, 60, 120];
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [customInput, setCustomInput] = useState("");
    const dialogRef = useRef<HTMLDivElement>(null);

    const handleCategoryClick = (cat: typeof categories[number]) => {
        // Require login for lyrics mode
        if (cat === 'lyrics' && !user) {
            toast.warning('Login required', {
                description: 'Please login to use the lyrics mode'
            });
            navigate('/login');
            return;
        }
        setCategory(cat);
    };

    const handleCustomClick = () => {
        setIsCustomOpen(true);
        resetGame(); // Stop any active race
    };

    const handleCustomSubmit = () => {
        if (customInput.trim().length > 0) {
            setCustomText(customInput.trim());
            setIsCustomOpen(false);
            setCustomInput("");
        }
    };

    const handleSongSelect = (lyrics: string, songTitle: string, artist: string) => {
        // Set the lyrics as custom text for typing
        setCustomText(lyrics);
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full relative z-50">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full">
                {/* Category Selector */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-secondary/30 rounded-lg p-0.5 sm:p-1 gap-0.5 sm:gap-1">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={category === cat ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleCategoryClick(cat)}
                                className={cn(
                                    "capitalize h-7 sm:h-8 px-2 sm:px-4 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0",
                                    category === cat
                                        ? "shadow-md bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                )}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    {category === 'code' && (
                        <>
                            <div className="h-6 w-px bg-border hidden sm:block" />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 sm:h-8 gap-1 transition-all">
                                        <span className="capitalize">{language}</span>
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuRadioGroup value={language} onValueChange={(val: any) => setLanguage(val)}>
                                        {languages.map((lang) => (
                                            <DropdownMenuRadioItem key={lang} value={lang} className="capitalize">
                                                {lang}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>

                <div className="h-6 w-px bg-border hidden sm:block" />

                {/* Difficulty Selector - Hidden for lyrics, show Song Search instead */}
                {category === 'lyrics' ? (
                    <div className="flex items-center gap-2">
                        <SongSearch 
                            onSongSelect={handleSongSelect} 
                            disabled={isActive}
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="flex bg-secondary/30 rounded-lg p-0.5 sm:p-1 gap-0.5 sm:gap-1">
                            {difficulties.map((diff) => (
                                <Button
                                    key={diff}
                                    variant={difficulty === diff ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => {
                                        if (diff === 'custom') {
                                            handleCustomClick();
                                        } else {
                                            setDifficulty(diff);
                                        }
                                    }}
                                    className={cn(
                                        "capitalize h-7 sm:h-8 px-2 sm:px-4 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0",
                                        difficulty === diff
                                            ? "shadow-md bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                    )}
                                >
                                    {diff}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="h-6 w-px bg-border hidden sm:block" />

                {/* Mode Selector */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-secondary/30 rounded-lg p-0.5 sm:p-1 gap-0.5 sm:gap-1">
                        <Button
                            variant={mode === 'timed' ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setMode('timed')}
                            disabled={difficulty === 'custom'}
                            className={cn(
                                "h-7 sm:h-8 px-2 sm:px-4 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0",
                                mode === 'timed'
                                    ? "shadow-md bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                        >
                            <span className="hidden sm:inline">Timed</span>
                            <span className="sm:hidden">60s</span>
                        </Button>
                        <Button
                            variant={mode === 'passage' ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setMode('passage')}
                            className={cn(
                                "h-7 sm:h-8 px-2 sm:px-4 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0",
                                mode === 'passage'
                                    ? "shadow-md bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                        >
                            Words
                        </Button>
                    </div>

                    {mode === 'timed' && (
                        <>
                            <div className="h-6 w-px bg-border hidden sm:block" />
                            <div className="flex bg-secondary/30 rounded-lg p-0.5 sm:p-1 gap-0.5 sm:gap-1">
                                {durations.map((duration) => (
                                    <Button
                                        key={duration}
                                        variant={timedDuration === duration ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setTimedDuration(duration)}
                                        className={cn(
                                            "h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0 min-w-[3rem]",
                                            timedDuration === duration
                                                ? "shadow-md bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        )}
                                    >
                                        {duration}s
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Custom Text Dialog */}
            {isCustomOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div
                        ref={dialogRef}
                        className="w-full max-w-2xl bg-card rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Custom Text
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsCustomOpen(false)} aria-label="Close custom text dialog">
                                <X className="w-5 h-5" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </div>

                        <Textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Paste your text here (max 1000 words)..."
                            className="w-full h-48 p-4 rounded-lg bg-secondary border-none"
                            autoFocus
                        />

                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsCustomOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCustomSubmit} disabled={customInput.trim().length === 0}>
                                <Check className="w-4 h-4 mr-2" />
                                Use Text
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
