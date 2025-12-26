import { Button } from '../ui/button';
import { RotateCcw, Trophy, Sparkles, Target } from 'lucide-react';

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
}

export const ResultsView = ({
    wpm,
    accuracy,
    characters,
    time,
    onRestart,
    testType,
    isNewHighScore,
    isFirstTest,
    previousBest
}: ResultsViewProps) => {
    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">

            {/* Achievement Text - Clean, no background */}
            {(isNewHighScore || isFirstTest) && (
                <div className="mb-8 flex items-center gap-3 animate-in zoom-in duration-500">
                    {isFirstTest ? (
                        <>
                            <Target className="w-6 h-6 text-chart-2" />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-chart-2">Baseline Established!</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6 text-chart-3" />
                            <div className="flex flex-col items-start sm:items-center">
                                <span className="text-xl font-bold text-chart-3">High Score Smashed!</span>
                                <span className="text-sm text-muted-foreground">
                                    Previous: {previousBest} WPM (+{wpm - (previousBest || 0)})
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Main Results */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 mb-10">
                {/* WPM */}
                <div className="flex flex-col items-center">
                    <span className="text-lg md:text-xl text-muted-foreground font-medium mb-2">wpm</span>
                    <span className="text-6xl sm:text-7xl md:text-8xl font-black text-primary leading-none tracking-tight tabular-nums">
                        {wpm}
                    </span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-24 w-px bg-border" />
                <div className="sm:hidden w-24 h-px bg-border" />

                {/* Accuracy */}
                <div className="flex flex-col items-center">
                    <span className="text-lg md:text-xl text-muted-foreground font-medium mb-2">accuracy</span>
                    <span className={`text-6xl sm:text-7xl md:text-8xl font-black leading-none tracking-tight tabular-nums ${accuracy >= 95 ? 'text-chart-2' : accuracy >= 80 ? 'text-chart-3' : 'text-destructive'
                        }`}>
                        {accuracy}%
                    </span>
                </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 w-full max-w-2xl border-t border-border/40 pt-8 mb-10">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Test Type</span>
                    <span className="text-lg sm:text-xl font-semibold text-foreground">{testType}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Time</span>
                    <span className="text-lg sm:text-xl font-semibold text-foreground tabular-nums">{time}s</span>
                </div>

                <div className="flex flex-col items-center gap-1 col-span-2 sm:col-span-1">
                    <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Characters</span>
                    <div className="flex items-center gap-1.5 text-lg sm:text-xl font-semibold tabular-nums">
                        <span className="text-chart-2">{characters.correct}</span>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-destructive">{characters.incorrect}</span>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-chart-5">{characters.extra}</span>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-muted-foreground">{characters.missed}</span>
                    </div>
                </div>

                {!isFirstTest && (
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Best</span>
                        <div className="flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-chart-3" />
                            <span className="text-lg sm:text-xl font-semibold text-chart-3 tabular-nums">
                                {isNewHighScore ? wpm : previousBest}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Restart Button */}
            <div className="flex flex-col items-center gap-4">
                <Button
                    onClick={onRestart}
                    size="lg"
                    className="gap-2 px-8 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                </Button>

            </div>
        </div>
    );
};
