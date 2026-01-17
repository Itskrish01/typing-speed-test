import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { useAuth } from '@/context/auth-context';
import { getUserHistory, getUserRank, type HistoryEntry, type Mistake } from '@/lib/firestore-helpers';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trophy, Clock, Keyboard, Zap, Crown, ArrowLeft, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useGameActions } from '@/store/game-store';


interface LocationState {
    justFinished?: boolean;
    showLoginPrompt?: boolean;
    result?: {
        wpm: number;
        accuracy: number;
        time: number;
        difficulty: string;
        category: string;
        characters: {
            correct: number;
            incorrect: number;
            extra: number;
            missed: number;
        };
        mistakes?: Mistake[];
        isNewHighScore: boolean;
        isVerified?: boolean;
        validationError?: string;
        showLoginPrompt?: boolean;
    };
}


export const Result = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { resetGame } = useGameActions();
    const location = useLocation();
    const state = location.state as LocationState | null;

    const [recentTests, setRecentTests] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const nextTestButtonRef = useRef<HTMLButtonElement>(null);

    // Keyboard navigation focus
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                const active = document.activeElement;
                if ((active === document.body) && nextTestButtonRef.current) {
                    e.preventDefault();
                    nextTestButtonRef.current.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        resetGame();
    }, [resetGame]);


    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const history = await getUserHistory(user.uid, 5);
                setRecentTests(history);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    // Reset selection when coming from a new test
    useEffect(() => {
        if (state?.justFinished) {
            setSelectedIndex(0);
        }
    }, [state?.justFinished]);

    // Get the display result - either from navigation state (if index 0 and just finished) or from selected test
    const getDisplayResult = () => {
        // If we just finished and selected index is 0, use the state result
        if (state?.result && selectedIndex === 0 && state?.justFinished) {
            return {
                wpm: state.result.wpm,
                accuracy: state.result.accuracy,
                time: state.result.time,
                difficulty: state.result.difficulty,
                category: state.result.category,
                characters: state.result.characters,
                mistakes: state.result.mistakes || [],
                isNewHighScore: state.result.isNewHighScore,
                isVerified: state.result.isVerified,
                validationError: state.result.validationError
            };
        }

        // Otherwise use from recent tests
        if (recentTests.length > selectedIndex) {
            const test = recentTests[selectedIndex];
            return {
                wpm: test.wpm,
                accuracy: test.accuracy,
                time: test.time || 0,
                difficulty: test.difficulty,
                category: test.category,
                characters: test.characters || { correct: 0, incorrect: 0, extra: 0, missed: 0 },
                mistakes: test.mistakes || [],
                isNewHighScore: false,
                isVerified: true
            };
        }

        return null;
    };

    const displayResult = useMemo(() => getDisplayResult(), [state, selectedIndex, recentTests]);
    const [globalRank, setGlobalRank] = useState<number | null>(null);

    useEffect(() => {
        const fetchRank = async () => {
            if (user && displayResult?.category === 'ranked') {
                const rank = await getUserRank(user.uid);
                setGlobalRank(rank);
            } else {
                setGlobalRank(null);
            }
        };
        fetchRank();
    }, [user, displayResult?.category]);
    const isNewHighScore = displayResult?.isNewHighScore || false;

    if (!user && !displayResult) {
        return (
            <PageLayout>
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-muted-foreground">Please login to view your results</p>
                    <Button onClick={() => navigate('/login')}>Login</Button>
                </div>
            </PageLayout>
        );
    }

    if (loading) {
        return (
            <PageLayout>
                <div className="flex-1 flex items-center justify-center">
                    <div className=" text-muted-foreground">Loading...</div>
                </div>
            </PageLayout>
        );
    }

    if (!displayResult) {
        return (
            <PageLayout>
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-muted-foreground">No test results yet</p>
                    <Button onClick={() => { resetGame(); navigate('/'); }}>Take a Test</Button>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="flex-1 flex flex-col gap-8 py-8">
                {/* Back button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { resetGame(); navigate('/'); }}
                    className="self-start gap-2 text-muted-foreground"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to typing
                </Button>

                {/* Main Result Card */}
                <section className="flex flex-col items-center gap-6">
                    {displayResult.validationError && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium  mb-4">
                            <AlertTriangle className="w-4 h-4" />
                            {displayResult.validationError}
                        </div>
                    )}

                    {isNewHighScore && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-sm font-medium ">
                            <Crown className="w-4 h-4" />
                            New Personal Best!
                        </div>
                    )}

                    {/* Main Stats */}
                    <div className="flex items-center gap-8 sm:gap-12">
                        <div className="flex flex-col items-center">
                            <span className="text-6xl sm:text-7xl font-black text-primary tabular-nums leading-none">
                                {displayResult.wpm}
                            </span>
                            <span className="text-xs uppercase tracking-widest text-muted-foreground mt-2">wpm</span>
                        </div>

                        <div className="h-14 w-px bg-border/50" />

                        <div className="flex flex-col items-center">
                            <span className={cn(
                                "text-6xl sm:text-7xl font-black tabular-nums leading-none",
                                displayResult.accuracy >= 98 ? 'text-green-500' : displayResult.accuracy >= 90 ? 'text-yellow-500' : 'text-red-500'
                            )}>
                                {displayResult.accuracy}%
                            </span>
                            <span className="text-xs uppercase tracking-widest text-muted-foreground mt-2">accuracy</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
                        {displayResult.category === 'ranked' ? (
                            <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary col-span-2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-yellow-500/5" />
                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider z-10">
                                    <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                    Global Rank
                                </div>
                                <span className="text-xl font-bold text-yellow-500 z-10">
                                    {globalRank ? `#${globalRank}` : <span className="text-sm opacity-50">Calculating...</span>}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary">
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider">
                                        <Trophy className="w-3.5 h-3.5" />
                                        Difficulty
                                    </div>
                                    <span className="text-lg font-bold capitalize">{displayResult.difficulty}</span>
                                </div>

                                <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary">
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider">
                                        <Zap className="w-3.5 h-3.5" />
                                        Category
                                    </div>
                                    <span className="text-lg font-bold capitalize">{displayResult.category}</span>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider">
                                <Keyboard className="w-3.5 h-3.5" />
                                Characters
                            </div>
                            <div className="flex items-center gap-1 text-lg font-bold tabular-nums">
                                <span className="text-green-500">{displayResult.characters.correct}</span>
                                <span className="text-muted-foreground/40">/</span>
                                <span className="text-red-500">{displayResult.characters.incorrect}</span>
                                <span className="text-muted-foreground/40">/</span>
                                <span className="text-yellow-500">{displayResult.characters.extra}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-secondary">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5" />
                                Time
                            </div>
                            <span className="text-xl font-bold tabular-nums">{displayResult.time}s</span>
                        </div>
                    </div>

                    {/* Mistakes Section */}
                    {displayResult.mistakes && displayResult.mistakes.length > 0 && (
                        <div className="w-full max-w-xl mt-4">
                            <div className="flex items-center gap-2 text-destructive text-sm uppercase tracking-wider font-semibold mb-4">
                                <AlertTriangle className="w-4 h-4" />
                                Mistakes ({displayResult.mistakes.length})
                            </div>
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                                {displayResult.mistakes.map((m, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary border border-border/50 hover:border-destructive/30 transition-colors"
                                    >
                                        <span className="text-lg font-mono text-muted-foreground/70 line-through decoration-destructive/50">
                                            {m.expected === ' ' ? '␣' : m.expected}
                                        </span>
                                        <span className="text-xs text-muted-foreground my-1">↓</span>
                                        <span className="text-lg font-mono text-destructive font-bold">
                                            {m.typed === ' ' ? '␣' : m.typed}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button onClick={() => { resetGame(); navigate('/'); }} size="lg" className="mt-4 gap-2 px-8" ref={nextTestButtonRef}>
                        <RotateCcw className="w-4 h-4" />
                        New Test
                    </Button>
                </section>

                {/* Recent Tests */}
                {recentTests.length > 0 && (
                    <section className="mt-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            Recent Tests
                        </h2>
                        <div className="grid gap-3">
                            {recentTests.map((test, index) => (
                                <button
                                    key={test.id}
                                    onClick={() => setSelectedIndex(index)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl bg-secondary/50 text-left transition-all w-full",
                                        selectedIndex === index
                                            ? "ring-2 ring-primary bg-secondary"
                                            : "hover:bg-secondary/70"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold text-primary tabular-nums">{test.wpm}</span>
                                            <span className="text-xs text-muted-foreground">wpm</span>
                                        </div>
                                        <div className="h-8 w-px bg-border/30" />
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-xl font-bold tabular-nums",
                                                test.accuracy >= 98 ? 'text-green-500' : test.accuracy >= 90 ? 'text-yellow-500' : 'text-red-500'
                                            )}>{test.accuracy}%</span>
                                            <span className="text-xs text-muted-foreground">acc</span>
                                        </div>
                                        {test.characters && (
                                            <>
                                                <div className="h-8 w-px bg-border/30 hidden sm:block" />
                                                <div className="flex-col hidden sm:flex">
                                                    <div className="flex items-center gap-1 text-sm font-bold tabular-nums">
                                                        <span className="text-green-500">{test.characters.correct}</span>
                                                        <span className="text-muted-foreground/40">/</span>
                                                        <span className="text-red-500">{test.characters.incorrect}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">chars</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="capitalize hidden sm:inline">{test.difficulty}</span>
                                        <span className="capitalize">{test.category}</span>
                                        <span className="text-xs">
                                            {test.timestamp?.toDate ? formatDistanceToNow(test.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}
                {!user && (
                    <section className="mt-8">
                        <div className="rounded-xl p-8 flex flex-col items-center text-center gap-4">

                            <h2 className="text-2xl font-bold">Track Your Progress</h2>
                            <p className="text-muted-foreground max-w-md">
                                Sign in to save your results, view your history, and compete on the global leaderboard.
                            </p>
                            <div className="flex gap-4 mt-2">
                                <Button variant="outline" onClick={() => navigate('/login')}>Get Started</Button>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </PageLayout >
    );
};
