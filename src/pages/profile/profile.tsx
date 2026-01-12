import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { HistoryTable } from "@/components/ui-blocks/history-table";
import { getPaginatedHistory, getUserStatsHistory, ensureUserProfile, type UserProfile, type HistoryEntry } from "@/lib/firestore-helpers";
import { PageLayout } from "@/components/layout/page-layout";
import { Header } from "@/components/ui-blocks/header";
import { ShareProfile } from "@/components/ui-blocks/share-profile";
import { ActivityHeatmap } from "@/components/ui-blocks/activity-heatmap";
import { StatsOverview } from "@/components/ui-blocks/stats-overview";
import { UsernameEditDialog } from "@/components/ui-blocks/username-edit-dialog";
import { ProfileBanner } from "@/components/ui-blocks/profile-banner";
import { LoadingSpinner } from "@/components/common";
import type { DocumentSnapshot } from "firebase/firestore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ArrowUpDown, Check } from "lucide-react";

export const Profile = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [history, setHistory] = useState<HistoryEntry[]>([]); // For list
    const [statsHistory, setStatsHistory] = useState<HistoryEntry[]>([]); // For heatmap/stats
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Filter & Sort State derived from URL
    const sortBy = (searchParams.get('sort') as 'timestamp' | 'wpm') || 'timestamp';
    const filterDifficulty = searchParams.get('difficulty') || 'all';

    const [tableLoading, setTableLoading] = useState(false);

    // Pagination state
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const ITEMS_PER_PAGE = 10;

    // 1. Fetch Profile & Stats (Independent of filters)
    useEffect(() => {
        const fetchProfileData = async () => {
            if (user) {
                const [statsResult, profileData] = await Promise.all([
                    getUserStatsHistory(user.uid),
                    ensureUserProfile(user)
                ]);
                setStatsHistory(statsResult);
                setProfile(profileData);
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [user]);

    // 2. Fetch History List (Dependent on filters)
    useEffect(() => {
        const fetchHistory = async () => {
            if (user) {
                setTableLoading(true);
                // Reset list on filter change
                const result = await getPaginatedHistory(user.uid, ITEMS_PER_PAGE, null, sortBy, filterDifficulty);
                setHistory(result.data);
                setLastDoc(result.lastDoc);
                setHasMore(result.data.length === ITEMS_PER_PAGE);
                setTableLoading(false);
            }
        };
        fetchHistory();
    }, [user, sortBy, filterDifficulty]);

    const handleLoadMore = async () => {
        if (!user || !lastDoc) return;

        setLoadingMore(true);
        try {
            const nextBatch = await getPaginatedHistory(user.uid, ITEMS_PER_PAGE, lastDoc, sortBy, filterDifficulty);

            setHistory(prev => [...prev, ...nextBatch.data]);
            setLastDoc(nextBatch.lastDoc);
            setHasMore(nextBatch.data.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error("Error loading more history:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const updateParams = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(key, value);
        setSearchParams(newParams);
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }
    const displayName = profile?.username || profile?.displayName || 'User';
    const joinedDate = profile?.createdAt?.toDate
        ? profile.createdAt.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Unknown';
    const totalTests = statsHistory.length; // Use stats history count (capped at 1000)

    const publicUrl = profile?.username
        ? `${window.location.origin}/u/${profile.username}`
        : `${window.location.origin}/u/${user?.uid}`;

    return (
        <PageLayout>
            <main className="flex-1 py-8 w-full space-y-8">
                <ProfileBanner
                    displayName={displayName}
                    joinedDate={joinedDate}
                    testsCount={totalTests}
                    onEdit={() => setIsEditOpen(true)}
                />

                <ShareProfile url={publicUrl} />

                {user && profile && (
                    <UsernameEditDialog
                        open={isEditOpen}
                        onOpenChange={setIsEditOpen}
                        currentUsername={profile.username || ''}
                        userId={user.uid}
                        onSuccess={(newUsername) => {
                            setProfile((prev) => prev ? { ...prev, username: newUsername } : null);
                        }}
                    />
                )}

                <StatsOverview history={statsHistory} personalBests={profile?.bestWpm} />

                <div className="bg-secondary/20 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Activity History</span>
                        </div>
                        <span className="text-xs text-muted-foreground opacity-50">last 12 months</span>
                    </div>
                    <ActivityHeatmap history={statsHistory} />
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                        <h2 className="text-xl font-semibold">Recent Tests</h2>

                        <div className="flex items-center gap-2">
                            {/* Sort Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-2">
                                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="hidden sm:inline">Sort:</span>
                                        {sortBy === 'timestamp' ? 'Recent' : 'Best WPM'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => updateParams('sort', 'timestamp')}>
                                        Recent {sortBy === 'timestamp' && <Check className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateParams('sort', 'wpm')}>
                                        Best WPM {sortBy === 'wpm' && <Check className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Difficulty Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="capitalize">{filterDifficulty === 'all' ? 'All Difficulties' : filterDifficulty}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => updateParams('difficulty', 'all')}>
                                        All {filterDifficulty === 'all' && <Check className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateParams('difficulty', 'easy')}>
                                        Easy {filterDifficulty === 'easy' && <Check className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateParams('difficulty', 'medium')}>
                                        Medium {filterDifficulty === 'medium' && <Check className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateParams('difficulty', 'hard')}>
                                        Hard {filterDifficulty === 'hard' && <Check className="ml-auto h-4 w-4" />}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {tableLoading ? (
                        <div className="py-12 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <HistoryTable data={history} />
                    )}

                    {hasMore && (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="w-full md:w-auto min-w-50"
                            >
                                {loadingMore ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        <span>Loading...</span>
                                    </div>
                                ) : "Load More"}
                            </Button>
                        </div>
                    )}
                </div>

            </main>
        </PageLayout>
    );
};
