import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Medal, Award, Loader2, Crown, Users } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/firestore-helpers";
import { cn } from "@/lib/utils";

export const Leaderboard = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await getLeaderboard();
                setEntries(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankDisplay = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20">
                        <Crown className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                    </div>
                );
            case 2:
                return (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400/20">
                        <Medal className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    </div>
                );
            case 3:
                return (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600/20">
                        <Award className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center w-8 h-8">
                        <span className="text-sm font-mono font-medium text-muted-foreground">{rank}</span>
                    </div>
                );
        }
    };

    return (
        <PageLayout>
            <main className="flex-1 flex flex-col items-center py-6 sm:py-12 w-full">
                {/* Header */}
                <header className="text-center mb-6 sm:mb-12">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Trophy className="w-7 h-7 text-primary" aria-hidden="true" />
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold mb-2">Leaderboard</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Top 50 typists in Ranked Mode</p>
                </header>

                {/* Leaderboard Content */}
                <div className="w-full max-w-2xl px-0 sm:px-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 mb-4 text-primary" aria-hidden="true" />
                            <p className="text-muted-foreground">Loading rankings...</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-16 bg-card/50 border border-border/50 rounded-2xl mx-4 sm:mx-0">
                            <div className="p-4 rounded-xl bg-muted/30 w-fit mx-auto mb-4">
                                <Users className="w-10 h-10 text-muted-foreground/50" aria-hidden="true" />
                            </div>
                            <p className="text-lg font-medium text-foreground mb-1">No ranked scores yet</p>
                            <p className="text-sm text-muted-foreground">Be the first to complete a ranked test!</p>
                        </div>
                    ) : (
                        <div className="bg-card/50 border-y sm:border border-border/50 sm:rounded-2xl overflow-hidden">
                            {/* Table Header */}
                            <div
                                className="grid grid-cols-[48px_1fr_80px] sm:grid-cols-[72px_1fr_120px] gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 bg-muted/20 border-b border-border/50"
                                role="row"
                            >
                                <div className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-muted-foreground" role="columnheader">
                                    Rank
                                </div>
                                <div className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-muted-foreground" role="columnheader">
                                    Player
                                </div>
                                <div className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-muted-foreground text-right" role="columnheader">
                                    Best WPM
                                </div>
                            </div>

                            {/* Top 3 Highlight Section */}
                            {entries.slice(0, 3).length > 0 && (
                                <div className="border-b border-border/30">
                                    {entries.slice(0, 3).map((entry) => (
                                        <div
                                            key={entry.uid}
                                            className={cn(
                                                "grid grid-cols-[48px_1fr_80px] sm:grid-cols-[72px_1fr_120px] gap-2 sm:gap-4 px-3 sm:px-6 py-4 sm:py-5 items-center",
                                                entry.rank === 1 && "bg-yellow-500/5",
                                                entry.rank === 2 && "bg-gray-400/5",
                                                entry.rank === 3 && "bg-amber-600/5"
                                            )}
                                            role="row"
                                        >
                                            <div className="flex items-center" role="cell">
                                                {getRankDisplay(entry.rank)}
                                            </div>
                                            <div role="cell" className="truncate pr-2">
                                                <Link
                                                    to={`/u/${entry.username}`}
                                                    className={cn(
                                                        "font-semibold hover:underline transition-colors text-sm sm:text-base truncate",
                                                        entry.rank === 1 && "text-yellow-500",
                                                        entry.rank === 2 && "text-gray-400",
                                                        entry.rank === 3 && "text-amber-600"
                                                    )}
                                                >
                                                    {entry.username}
                                                </Link>
                                            </div>
                                            <div className="text-right whitespace-nowrap" role="cell">
                                                <span className={cn(
                                                    "font-mono text-base sm:text-lg font-bold",
                                                    entry.rank === 1 && "text-yellow-500",
                                                    entry.rank === 2 && "text-gray-400",
                                                    entry.rank === 3 && "text-amber-600"
                                                )}>
                                                    {entry.bestRankedWpm}
                                                </span>
                                                <span className="text-muted-foreground text-[10px] sm:text-xs ml-1">wpm</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Rest of the Leaderboard */}
                            {entries.slice(3).length > 0 && (
                                <div className="divide-y divide-border/30" role="rowgroup">
                                    {entries.slice(3).map((entry) => (
                                        <div
                                            key={entry.uid}
                                            className="grid grid-cols-[48px_1fr_80px] sm:grid-cols-[72px_1fr_120px] gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 items-center hover:bg-muted/10 transition-colors"
                                            role="row"
                                        >
                                            <div className="flex items-center" role="cell">
                                                {getRankDisplay(entry.rank)}
                                            </div>
                                            <div role="cell" className="truncate pr-2">
                                                <Link
                                                    to={`/u/${entry.username}`}
                                                    className="font-medium text-foreground hover:text-primary transition-colors text-sm sm:text-base truncate"
                                                >
                                                    {entry.username}
                                                </Link>
                                            </div>
                                            <div className="text-right whitespace-nowrap" role="cell">
                                                <span className="font-mono font-semibold text-primary text-sm sm:text-base">
                                                    {entry.bestRankedWpm}
                                                </span>
                                                <span className="text-muted-foreground text-[10px] sm:text-xs ml-1">wpm</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </PageLayout>
    );
};
