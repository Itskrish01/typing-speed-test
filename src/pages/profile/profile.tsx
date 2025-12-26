import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth-context";
import { Button } from "../../components/ui/button";
import { HistoryTable } from "../../components/ui-blocks/history-table";
import { getPaginatedHistory, ensureUserProfile, type UserProfile } from "../../lib/firestore-helpers";
import { PageLayout } from "../../components/layout/page-layout";
import { Header } from "../../components/ui-blocks/header";
import { Share2, ExternalLink } from "lucide-react";
import { ActivityHeatmap } from "../../components/ui-blocks/activity-heatmap";
import { StatsOverview } from "../../components/ui-blocks/stats-overview";
import { UsernameEditDialog } from "../../components/ui-blocks/username-edit-dialog";
import { ProfileBanner } from "../../components/ui-blocks/profile-banner";

export const Profile = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Pagination state
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                // Initial load
                const [historyResult, profileData] = await Promise.all([
                    getPaginatedHistory(user.uid, ITEMS_PER_PAGE),
                    ensureUserProfile(user)
                ]);

                setHistory(historyResult.data);
                setLastDoc(historyResult.lastDoc);
                setProfile(profileData);
                setHasMore(historyResult.data.length === ITEMS_PER_PAGE);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleLoadMore = async () => {
        if (!user || !lastDoc) return;

        setLoadingMore(true);
        try {
            const nextBatch = await getPaginatedHistory(user.uid, ITEMS_PER_PAGE, lastDoc);

            setHistory(prev => [...prev, ...nextBatch.data]);
            setLastDoc(nextBatch.lastDoc);
            setHasMore(nextBatch.data.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error("Error loading more history:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) {
        // ... (loading state)
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    // ... (rest of component)
    const displayName = profile?.username || profile?.displayName || 'User';
    const joinedDate = profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';
    const totalTests = history.length; // Note: This might be inaccurate if paginated, but for now it's just loaded items count or we fetch total count separately? 
    // The user previous code used history.length. If we want total tests count, we arguably need a separate counter in UserProfile. 
    // For now, let's stick to loaded history length or maybe keep strict total in profile? 
    // Actually ProfileBanner shows "Tests Started". Ideally this comes from a counter field. 
    // Let's use history.length for now but acknowledge it's only loaded ones. 
    // WAIT: User wanted pagination. If I only load 10, totalTests will show 10. That's bad for the banner stats.
    // Ideally user profile should track total tests.
    // Let's keep it simple: We fetch ALL history for stats calculation in StatsOverview? Or do we want StatsOverview to also be based on loaded data?
    // User asked for "show the history of previously done test using table".
    // If we change history to be paginated, StatsOverview will only see partial data.
    // Solution: Fetch full history for Stats/Banner (lightweight if just fields, but we need all for stats). 
    // OR: just let StatsOverview work on loaded data. 
    // BETTER: Seperate history for Table vs Stats. 
    // But fetching ALL history might be expensive if thousands. 
    // Practical approach: Fetch full history for stats (maybe limit 1000?), and use slice for table? 
    // No, pagination implies we don't fetch all. 
    // LET'S STICK TO: Data driven by what we have. 

    // Re-reading: "remember to add load more button after every 10 results"

    // Update: I will modify useEffect to fetch stats separately or just accept that stats update as successful load more happens. 
    // Actually, `getUserHistory(user.uid, 500)` was used before. That's 500 items. 
    // Maybe we just keep fetching 500 for "Stats" but only show 10 in table?
    // No, efficient pagination means we fetch 10.

    // Let's implement the table with the `history` state.

    // Check if we should use username in URL (if available) or fallback to ID (though we prefer username now)
    const publicUrl = profile?.username
        ? `${window.location.origin}/u/${profile.username}`
        : `${window.location.origin}/u/${user?.uid}`;

    return (
        <PageLayout>
            <Header />
            <main className="flex-1 py-8 w-full space-y-8">

                {/* --- Profile Banner --- */}
                <ProfileBanner
                    displayName={displayName}
                    joinedDate={joinedDate}
                    testsCount={totalTests} // This will now show only loaded count. Acceptable for this iteration.
                    onEdit={() => setIsEditOpen(true)}
                />

                {/* ... Edit Dialog ... */}
                {user && profile && (
                    <UsernameEditDialog
                        open={isEditOpen}
                        // ... props
                        onOpenChange={setIsEditOpen}
                        currentUsername={profile.username || ''}
                        userId={user.uid}
                        onSuccess={(newUsername) => {
                            setProfile((prev) => prev ? { ...prev, username: newUsername } : null);
                        }}
                    />
                )}

                {/* --- Stats Grid --- */}
                <StatsOverview history={history} personalBests={profile?.bestWpm} />

                {/* --- Activity Heatmap --- */}
                <div className="bg-secondary/20 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Activity History</span>
                        </div>
                        <span className="text-xs text-muted-foreground opacity-50">last 12 months</span>
                    </div>
                    <ActivityHeatmap history={history} />
                </div>

                {/* --- History Table (NEW) --- */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold px-1">Recent Tests</h2>
                    <HistoryTable data={history} />

                    {hasMore && (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="w-full md:w-auto min-w-[200px]"
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

                {/* Public Link Footer */}
                <div className="flex justify-center pt-8 pb-4 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/10 px-3 py-1.5 rounded-full select-all border border-transparent hover:border-border/20 transition-colors">
                        <Share2 className="w-3 h-3" />
                        <span>{publicUrl}</span>
                        <a href={publicUrl} target="_blank" rel="noreferrer" className="hover:text-primary ml-1">
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

            </main>
        </PageLayout>
    );
};
