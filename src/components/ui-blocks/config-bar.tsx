import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { Settings, Check, X, Trophy } from "lucide-react";
import { useGameConfig, useGameActions, useGameStatus } from "../../store/game-store";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useAuth } from "../../context/auth-context";


export const ConfigBar = () => {
    const { difficulty, setDifficulty, mode, setMode, setCustomText, timedDuration, setTimedDuration, category, setCategory, language, setLanguage } = useGameConfig();
    const { resetGame } = useGameActions();
    const { isActive } = useGameStatus();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const difficulties = ['easy', 'medium', 'hard', 'custom'] as const;
    const categories = ['words', 'quotes', 'ranked', 'code'] as const;
    const languages = ['javascript', 'python', 'java', 'c++', 'c#', 'sql', 'html', 'css'] as const;
    const durations = [15, 30, 60, 120];
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [customInput, setCustomInput] = useState("");
    const dialogRef = useRef<HTMLDivElement>(null);

    // Initial sync from URL
    useEffect(() => {
        const diffParam = searchParams.get('difficulty');
        const modeParam = searchParams.get('mode');
        const catParam = searchParams.get('category');
        const durationParam = searchParams.get('duration');
        const langParam = searchParams.get('language');

        if (diffParam && difficulties.includes(diffParam as any)) setDifficulty(diffParam as any);
        if (modeParam && (modeParam === 'timed' || modeParam === 'passage')) setMode(modeParam);
        if (catParam && categories.includes(catParam as any)) setCategory(catParam as any);
        if (durationParam && !isNaN(Number(durationParam))) setTimedDuration(Number(durationParam));
        if (langParam && languages.includes(langParam as any)) setLanguage(langParam as any);

    }, []);

    // Sync to URL on changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        params.set('difficulty', difficulty);
        params.set('mode', mode);
        params.set('category', category);
        if (mode === 'timed') params.set('duration', timedDuration.toString());
        if (category === 'code') params.set('language', language);

        setSearchParams(params, { replace: true });
    }, [difficulty, mode, category, timedDuration, language]);

    // Reset category from ranked if user is not logged in
    useEffect(() => {
        if (category === 'ranked' && !user) {
            setCategory('words');
        }
    }, [user, category, setCategory]);

    const handleCategoryClick = (cat: typeof categories[number]) => {
        // Require login for ranked mode
        if (cat === 'ranked') {
            if (!user) {
                toast.warning('Login required', {
                    description: 'Please login to access ranked mode'
                });
                navigate('/login');
                return;
            }
            // Set specific config for ranked mode
            setCategory(cat);
            setMode('passage');
            setDifficulty('ranked');
            return;
        }

        // Reset difficulty if coming from ranked (optional, but good practice)
        if (category === 'ranked') {
            setDifficulty('easy');
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

    return (
        <nav
            className="flex flex-col items-center gap-4 w-full relative z-50"
            role="navigation"
            aria-label="Game configuration"
        >
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full">
                {/* Category Selector */}
                <fieldset className="flex items-center gap-2 border-none p-0 m-0">
                    <legend className="sr-only">Select category</legend>
                    <div className="flex bg-secondary/30 rounded-lg p-1 gap-0.5" role="radiogroup" aria-label="Category selection">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={category === cat ? "default" : "ghost"}
                                size="sm"
                                onClick={() => handleCategoryClick(cat)}
                                role="radio"
                                aria-checked={category === cat}
                                aria-label={cat === 'ranked' ? `${cat} mode (login required)` : `${cat} mode`}
                                className={cn(
                                    "capitalize h-7 sm:h-8 px-3 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0",
                                    category === cat
                                        ? "shadow-sm bg-background text-foreground hover:bg-background"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                                    // Special highlight for ranked mode
                                    cat === 'ranked' && category !== 'ranked' && "text-primary/70 hover:text-primary",
                                    cat === 'ranked' && category === 'ranked' && "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                            >
                                {cat === 'ranked' && <Trophy className="w-3 h-3 mr-1" aria-hidden="true" />}
                                {cat}
                            </Button>
                        ))}
                    </div>

                    {category === 'code' && (
                        <>
                            <div className="h-6 w-px bg-border hidden sm:block" aria-hidden="true" />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 transition-all"
                                        aria-label={`Select programming language, currently ${language}`}
                                    >
                                        <span className="capitalize">{language}</span>
                                        <ChevronDown className="w-3 h-3 opacity-50" aria-hidden="true" />
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
                </fieldset>

                {/* Only show difficulty/mode/duration when NOT in ranked mode */}
                {category !== 'ranked' && (
                    <>
                        <div className="h-6 w-px bg-border hidden sm:block" aria-hidden="true" />

                        {/* Difficulty Selector */}
                        <fieldset className="flex items-center gap-2 border-none p-0 m-0">
                            <legend className="sr-only">Select difficulty</legend>
                            <div className="flex bg-secondary/30 rounded-lg p-1 gap-0.5" role="radiogroup" aria-label="Difficulty selection">
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
                                        role="radio"
                                        aria-checked={difficulty === diff}
                                        aria-label={`${diff} difficulty`}
                                        className={cn(
                                            "capitalize h-7 sm:h-8 px-3 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0",
                                            difficulty === diff
                                                ? "shadow-sm bg-background text-foreground hover:bg-background"
                                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                        )}
                                    >
                                        {diff}
                                    </Button>
                                ))}
                            </div>
                        </fieldset>

                        <div className="h-6 w-px bg-border hidden sm:block" aria-hidden="true" />

                        {/* Mode Selector */}
                        <fieldset className="flex items-center gap-2 border-none p-0 m-0">
                            <legend className="sr-only">Select game mode</legend>
                            <div className="flex bg-secondary/30 rounded-lg p-1 gap-0.5" role="radiogroup" aria-label="Game mode selection">
                                <Button
                                    variant={mode === 'timed' ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setMode('timed')}
                                    disabled={difficulty === 'custom'}
                                    role="radio"
                                    aria-checked={mode === 'timed'}
                                    aria-label="Timed mode"
                                    className={cn(
                                        "h-7 sm:h-8 px-3 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0",
                                        mode === 'timed'
                                            ? "shadow-sm bg-background text-foreground hover:bg-background"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    <span className="hidden sm:inline">Timed</span>
                                    <span className="sm:hidden">60s</span>
                                </Button>
                                <Button
                                    variant={mode === 'passage' ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setMode('passage')}
                                    role="radio"
                                    aria-checked={mode === 'passage'}
                                    aria-label="Passage mode"
                                    className={cn(
                                        "h-7 sm:h-8 px-3 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0",
                                        mode === 'passage'
                                            ? "shadow-sm bg-background text-foreground hover:bg-background"
                                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    )}
                                >
                                    Words
                                </Button>
                            </div>

                            {mode === 'timed' && (
                                <>
                                    <div className="h-6 w-px bg-border hidden sm:block" aria-hidden="true" />
                                    <div className="flex bg-secondary/30 rounded-lg p-1 gap-0.5" role="radiogroup" aria-label="Timer duration selection">
                                        {durations.map((duration) => (
                                            <Button
                                                key={duration}
                                                variant={timedDuration === duration ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setTimedDuration(duration)}
                                                role="radio"
                                                aria-checked={timedDuration === duration}
                                                aria-label={`${duration} seconds`}
                                                className={cn(
                                                    "h-7 sm:h-8 px-3 text-xs sm:text-sm transition-all duration-200 focus-visible:ring-offset-0 min-w-12",
                                                    timedDuration === duration
                                                        ? "shadow-sm bg-background text-foreground hover:bg-background"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                                )}
                                            >
                                                {duration}s
                                            </Button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </fieldset>
                    </>
                )}
            </div>

            {/* Custom Text Dialog */}
            {isCustomOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="custom-text-title"
                >
                    <div
                        ref={dialogRef}
                        className="w-full max-w-2xl bg-card rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <h3 id="custom-text-title" className="text-lg font-semibold flex items-center gap-2">
                                <Settings className="w-5 h-5" aria-hidden="true" />
                                Custom Text
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsCustomOpen(false)}
                                aria-label="Close custom text dialog"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </Button>
                        </div>

                        <Textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Paste your text here (max 1000 words)..."
                            className="w-full h-48 p-4 rounded-lg bg-secondary border-none"
                            autoFocus
                            aria-label="Custom text input"
                        />

                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setIsCustomOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCustomSubmit} disabled={customInput.trim().length === 0}>
                                <Check className="w-4 h-4 mr-2" aria-hidden="true" />
                                Use Text
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
