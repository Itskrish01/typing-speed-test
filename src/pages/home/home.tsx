import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { saveTestResult } from "../../lib/firestore-helpers";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
    useGameStatus,
    useGameText,
    useGameResultData,
    useGameActions,
    useGameConfig,
} from "../../store/game-store";
import { useTypingSound } from "../../hooks/use-sound";
import { PageLayout } from "@/components/layout/page-layout";
import { StatsBar } from "@/components/ui-blocks/stats-bar";
import { ConfigBar } from "@/components/ui-blocks/config-bar";
import { TypingArea } from "@/components/ui-blocks/typing-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Home = () => {
    const { isReady, isActive, isFinished, isFocused } = useGameStatus();
    const { text, userInput } = useGameText();
    const navigate = useNavigate();

    const results = useGameResultData();
    const { initGame, resetGame, handleInput, tick, setFocused } = useGameActions();
    const { play, playError } = useTypingSound();

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
            // Prevent Tab from moving focus away during active game only
            if (e.key === 'Tab' && isActive) {
                e.preventDefault();
                handleRestart();
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
                inputRef.current?.focus({ preventScroll: true });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFinished, isReady, isActive, isFocused, resetGame]);

    // Save result when game finishes and navigate to result page
    const hasSavedRef = useRef(false);
    const { user } = useAuth();
    const { difficulty, mode, category } = useGameConfig();

    useEffect(() => {
        if (!isFinished) {
            hasSavedRef.current = false;
        } else if (isFinished && !hasSavedRef.current) {
            hasSavedRef.current = true;

            const characters = {
                correct: results.userInput.split('').filter((c, i) => c === results.text[i]).length,
                incorrect: results.errorCount,
                extra: Math.max(0, results.userInput.length - results.text.length),
                missed: Math.max(0, results.text.length - results.userInput.length)
            };

            // Calculate mistakes (max 10 to keep data small)
            const mistakes: { expected: string; typed: string }[] = [];
            const minLen = Math.min(results.text.length, results.userInput.length);
            for (let i = 0; i < minLen && mistakes.length < 10; i++) {
                if (results.text[i] !== results.userInput[i]) {
                    mistakes.push({ expected: results.text[i], typed: results.userInput[i] });
                }
            }

            if (user) {
                // Save to Firestore with verification
                const handleSaveAndNavigate = async () => {
                    try {
                        await saveTestResult(user.uid, {
                            wpm: results.wpm,
                            accuracy: results.accuracy,
                            errors: results.errorCount,
                            difficulty,
                            mode,
                            category,
                            characters,
                            mistakes,
                            time: results.timerCount
                        });

                        // Success - Navigate with verified status
                        navigate('/result', {
                            state: {
                                justFinished: true,
                                result: {
                                    wpm: results.wpm,
                                    accuracy: results.accuracy,
                                    time: results.timerCount,
                                    difficulty,
                                    category,
                                    characters,
                                    mistakes,
                                    isNewHighScore: results.wasNewHighScore,
                                    isVerified: true
                                }
                            }
                        });
                    } catch (error: any) {
                        console.error("Failed to save result:", error);

                        const isCheat = error?.code === 'permission-denied' ||
                            (error?.message && error.message.includes('Missing or insufficient permissions'));

                        const validationError = isCheat
                            ? 'Anti-Cheat: Result Rejected (Suspected Automation)'
                            : 'Verification Failed: Could not save result';

                        // Failure - Navigate with error status
                        navigate('/result', {
                            state: {
                                justFinished: true,
                                result: {
                                    wpm: results.wpm,
                                    accuracy: results.accuracy,
                                    time: results.timerCount,
                                    difficulty,
                                    category,
                                    characters,
                                    mistakes,
                                    isNewHighScore: false, // Invalidate high score
                                    isVerified: false,
                                    validationError
                                }
                            }
                        });

                        // Show toast too
                        if (isCheat) {
                            toast.error("Result Rejected: Anti-Cheat Triggered");
                        } else {
                            toast.error("Failed to save result");
                        }
                    }
                };

                handleSaveAndNavigate();
            } else {
                // Guest - Navigate with prompt
                navigate('/result', {
                    state: {
                        justFinished: true,
                        showLoginPrompt: true,
                        result: {
                            wpm: results.wpm,
                            accuracy: results.accuracy,
                            time: results.timerCount,
                            difficulty,
                            category,
                            characters,
                            mistakes,
                            isNewHighScore: false // No sessions for guests
                        }
                    }
                });
            }
        }
    }, [isFinished, user, results, difficulty, mode, category, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const oldLength = userInput.length;
        const newLength = val.length;

        // Only play sound on character addition (not backspace)
        if (newLength > oldLength) {
            const charIndex = newLength - 1;
            const typedChar = val[charIndex];
            const expectedChar = text[charIndex];

            // If we have a mismatch
            if (typedChar !== expectedChar) {
                playError();
            } else {
                play();
            }
        } else {
            // For backspace or other, strictly we might want a sound or no sound.
            // Original code had `play()` on every change.
            // Let's keep `play()` for backspace as well to be consistent with "typing sound",
            // or we could suppress it. Let's play regular sound for backspace for feedback.
            play();
        }

        handleInput(e.target.value);
    };

    const focusInput = () => {
        inputRef.current?.focus({ preventScroll: true });
    };

    const handleRestart = () => {
        resetGame();
        setTimeout(focusInput, 50);
    };

    return (
        <PageLayout>
            <div className="flex flex-col flex-1">

                <main className={cn(
                    "flex flex-col flex-1 relative",
                    isFinished ? "items-center justify-center" : "items-center gap-6 md:gap-8 mt-8 md:mt-12"
                )}>
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
                </main>
            </div>
        </PageLayout>
    );
};