import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { HistoryTable } from "@/components/ui-blocks/history-table";
import { getPaginatedHistory, ensureUserProfile, type UserProfile, type HistoryEntry } from "@/lib/firestore-helpers";
import { PageLayout } from "@/components/layout/page-layout";
import { Header } from "@/components/ui-blocks/header";
import { ShareProfile } from "@/components/ui-blocks/share-profile";
import { ActivityHeatmap } from "@/components/ui-blocks/activity-heatmap";
import { StatsOverview } from "@/components/ui-blocks/stats-overview";
import { UsernameEditDialog } from "@/components/ui-blocks/username-edit-dialog";
import { ProfileBanner } from "@/components/ui-blocks/profile-banner";
import { LoadingSpinner } from "@/components/common";
import type { DocumentSnapshot } from "firebase/firestore";

export const Profile = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Pagination state
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
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
        return <LoadingSpinner fullScreen />;
    }

    const displayName = profile?.username || profile?.displayName || 'User';
    const joinedDate = profile?.createdAt?.toDate
        ? profile.createdAt.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Unknown';
    const totalTests = history.length;

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

                <StatsOverview history={history} personalBests={profile?.bestWpm} />

                <div className="bg-secondary/20 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Activity History</span>
                        </div>
                        <span className="text-xs text-muted-foreground opacity-50">last 12 months</span>
                    </div>
                    <ActivityHeatmap history={history} />
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold px-1">Recent Tests</h2>
                    <HistoryTable data={history} />

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
