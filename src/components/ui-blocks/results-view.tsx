import { Button } from '../ui/button';
import { RotateCcw, Trophy, Clock, Keyboard, Zap, AlertTriangle, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useEffect } from 'react';
import { fireConfetti } from '@/lib/confetti';

interface ResultsViewProps {
    wpm: number;
    accuracy: number;
    characters: {
        correct: number;
        incorrect: number;
        extra: number;
        missed: number;
    };
    time: number;
    onRestart: () => void;
    testType: string;
    isNewHighScore: boolean;
    isFirstTest: boolean;
    previousBest: number | null;
    category: string;
    difficulty: string;
    text: string;
    userInput: string;
}

const getBestLabel = (category: string, difficulty: string): string => {
    if (category === 'ranked') return 'Ranked Best';
    if (category === 'code') return 'Code Best';
    if (category === 'quotes') return 'Quotes Best';
    if (['easy', 'medium', 'hard'].includes(difficulty)) {
        return `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Best`;
    }
    return 'Best';
};

export const ResultsView = ({
    wpm,
    accuracy,
    characters,
    time,
    onRestart,
    testType,
    isNewHighScore,
    isFirstTest,
    previousBest,
    category,
    difficulty,
    text,
    userInput
}: ResultsViewProps) => {
    const bestLabel = getBestLabel(category, difficulty);

    useEffect(() => {
        if (isNewHighScore) {
            fireConfetti();
        }
    }, [isNewHighScore]);

    const mistakes = useMemo(() => {
        const errors: { expected: string; typed: string }[] = [];
        const minLen = Math.min(text.length, userInput.length);
        for (let i = 0; i < minLen; i++) {
            if (text[i] !== userInput[i]) {
                errors.push({ expected: text[i], typed: userInput[i] });
            }
        }
        return errors.slice(0, 8);
    }, [text, userInput]);

    return (
        <section
            className="w-full flex-1 flex flex-col items-center justify-center gap-6 py-8 animate-in fade-in duration-300"
            role="region"
            aria-label="Test Results"
        >
            {/* New High Score Badge */}
            {isNewHighScore && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-sm font-medium">
                    <Crown className="w-4 h-4" />
                    New Personal Best!
                </div>
            )}

            {/* Main Stats */}
            <div className="flex items-center gap-8 sm:gap-12">
                <div className="flex flex-col items-center">
                    <span className="text-6xl sm:text-7xl font-black text-primary tabular-nums leading-none">
                        {wpm}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground mt-2">wpm</span>
                </div>

                <div className="h-14 w-px bg-border/50" />

                <div className="flex flex-col items-center">
                    <span className={cn(
                        "text-6xl sm:text-7xl font-black tabular-nums leading-none",
                        accuracy >= 98 ? 'text-green-500' : accuracy >= 90 ? 'text-yellow-500' : 'text-red-500'
                    )}>
                        {accuracy}%
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground mt-2">accuracy</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
                <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider">
                        <Trophy className="w-3.5 h-3.5" />
                        {bestLabel}
                    </div>
                    <span className="text-xl font-bold tabular-nums">{isNewHighScore ? wpm : (previousBest || '-')}</span>
                </div>

                <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5" />
                        Mode
                    </div>
                    <span className="text-lg font-bold capitalize">{testType.includes('time') ? 'Timed' : 'Words'}</span>
                </div>

                <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider">
                        <Keyboard className="w-3.5 h-3.5" />
                        Characters
                    </div>
                    <div className="flex items-center gap-1 text-lg font-bold tabular-nums">
                        <span className="text-green-500">{characters.correct}</span>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="text-red-500">{characters.incorrect}</span>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="text-yellow-500">{characters.extra}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        Time
                    </div>
                    <span className="text-xl font-bold tabular-nums">{time}s</span>
                </div>
            </div>

            {/* Mistakes */}
            {mistakes.length > 0 && (
                <div className="w-full max-w-xl">
                    <div className="flex items-center gap-2 text-destructive text-xs uppercase tracking-wider font-medium mb-3">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Mistakes
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {mistakes.map((m, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/50 bg-card/50 text-sm">
                                <span className="text-muted-foreground line-through">{m.expected === ' ' ? '␣' : m.expected}</span>
                                <span className="text-destructive font-medium">{m.typed === ' ' ? '␣' : m.typed}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Restart */}
            <Button onClick={onRestart} size="lg" className="mt-4 gap-2 px-8">
                <RotateCcw className="w-4 h-4" />
                Next Test
            </Button>

            <p className="text-xs text-muted-foreground/60">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Tab</kbd> to restart
            </p>
        </section>
    );
};
