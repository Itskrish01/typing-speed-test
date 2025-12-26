import { useEffect, useRef } from "react";
import { useAuth } from "../../context/auth-context";
import { saveTestResult } from "../../lib/firestore-helpers";

import { RotateCcw } from "lucide-react";
import {
    useGameStatus,
    useGameText,
    useGameResultData,
    useGameActions,
    useGameConfig,
} from "../../store/game-store";
import { PageLayout } from "@/components/layout/page-layout";
import { Header } from "@/components/ui-blocks/header";
import { StatsBar } from "@/components/ui-blocks/stats-bar";
import { ConfigBar } from "@/components/ui-blocks/config-bar";
import { TypingArea } from "@/components/ui-blocks/typing-area";
import { ResultsView } from "@/components/ui-blocks/results-view";
import { Button } from "@/components/ui/button";

export const Home = () => {
    const { isReady, isActive, isFinished, isFocused } = useGameStatus();
    const { text, userInput } = useGameText();

    const results = useGameResultData();
    const { initGame, resetGame, handleInput, tick, setFocused } = useGameActions();

    // Refs
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const restartButtonRef = useRef<HTMLButtonElement>(null);

    // Initialize on mount
    useEffect(() => {
        initGame();
    }, []);

    // Window Focus Handling
    useEffect(() => {
        const onFocus = () => setFocused(true);
        const onBlur = () => setFocused(false);

        window.addEventListener('focus', onFocus);
        window.addEventListener('blur', onBlur);
        setFocused(document.hasFocus());

        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('blur', onBlur);
        };
    }, [setFocused]);

    // Timer effect
    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                tick();
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isActive, tick]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent Tab from moving focus away during active game
            if (e.key === 'Tab') {
                if (!isFinished) {
                    e.preventDefault();
                    handleRestart();
                }
            }

            if (e.key === 'Enter' && isFinished) {
                if (document.activeElement === restartButtonRef.current) {
                    return;
                }
                handleRestart();
            }
            if (e.key === 'Escape') {
                handleRestart();
            }

            // Focus on key press if ready and focused - ONLY if not already in an input/textarea
            const target = e.target as HTMLElement;
            const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);

            if (isReady && isFocused && !isActive && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && !isInput) {
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFinished, isReady, isActive, isFocused, resetGame]);

    // Save result when game finishes
    const hasSavedRef = useRef(false);
    const { user } = useAuth();
    const { difficulty, mode, category } = useGameConfig();

    useEffect(() => {
        if (!isFinished) {
            hasSavedRef.current = false;
        } else if (isFinished && user && !hasSavedRef.current) {
            // Only save if we have valid results (avoid saving 0 wpm on quick skips if any)
            // But results.wpm should be valid here.
            hasSavedRef.current = true;
            saveTestResult(user.uid, {
                wpm: results.wpm,
                accuracy: results.accuracy,
                difficulty,
                mode,
                category
            });
        }
    }, [isFinished, user, results, difficulty, mode, category]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInput(e.target.value);
    };

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const handleRestart = () => {
        resetGame();
        setTimeout(focusInput, 50);
    };

    return (
        <PageLayout>
            <div className="flex flex-col flex-1">
                <Header />

                <main className="flex flex-col items-center gap-6 md:gap-8 mt-8 md:mt-12 flex-1 relative">
                    {/* Game Interface */}
                    {!isFinished && (
                        <div className="w-full flex flex-col items-center gap-6 md:gap-8 animate-in fade-in duration-300">
                            {/* Stats */}
                            {(isActive || userInput.length > 0) && (
                                <StatsBar />
                            )}

                            {/* Config */}
                            <ConfigBar />

                            {/* Typing Area Container */}
                            <div className="relative w-full mt-6 md:mt-10">
                                <TypingArea
                                    text={text}
                                    userInput={userInput}
                                    isFocused={isFocused}
                                    isReady={isReady}
                                    onFocus={focusInput}
                                />

                                {/* Hidden Input */}
                                <input
                                    ref={inputRef}
                                    id="typing-input"
                                    name="typing-input"
                                    type="text"
                                    value={userInput}
                                    onChange={handleInputChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    disabled={isFinished}
                                    aria-label="Type the passage here"
                                />
                            </div>

                            {/* Restart Button */}
                            <div className="mt-8 md:mt-12">
                                <Button
                                    ref={restartButtonRef}
                                    variant="ghost"
                                    size="icon"
                                    className="w-10 h-10 text-muted-foreground hover:text-primary opacity-50 hover:opacity-100 transition-all"
                                    onClick={handleRestart}
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Results Interface */}
                    {isFinished && (
                        <ResultsView
                            wpm={results.wpm}
                            accuracy={results.accuracy}
                            characters={{
                                correct: results.userInput.split('').filter((c, i) => c === results.text[i]).length,
                                incorrect: results.errorCount,
                                extra: Math.max(0, results.userInput.length - results.text.length),
                                missed: Math.max(0, results.text.length - results.userInput.length)
                            }}
                            time={results.timerCount}
                            onRestart={handleRestart}
                            testType={results.mode === 'timed' ? `time ${results.initialTime}s` : `words`}
                            isNewHighScore={results.wasNewHighScore}
                            isFirstTest={results.wasFirstTest}
                            previousBest={results.previousBestWpm}
                        />
                    )}
                </main>
            </div>
        </PageLayout>
    );
};