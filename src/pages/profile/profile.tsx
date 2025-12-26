import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth-context";
import { getUserHistory, ensureUserProfile, type UserProfile } from "../../lib/firestore-helpers";
import { PageLayout } from "../../components/layout/page-layout";
import { Header } from "../../components/ui-blocks/header";
import { Share2, ExternalLink } from "lucide-react";
import { ActivityHeatmap } from "../../components/ui-blocks/activity-heatmap";
import { StatsOverview } from "../../components/ui-blocks/stats-overview";
import { ProfileBanner } from "../../components/ui-blocks/profile-banner";

export const Profile = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const [historyData, profileData] = await Promise.all([
                    getUserHistory(user.uid, 500),
                    ensureUserProfile(user)
                ]);
                setHistory(historyData);
                setProfile(profileData);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const displayName = profile?.username || profile?.displayName || 'User';
    const joinedDate = profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';
    const totalTests = history.length;

    return (
        <PageLayout>
            <Header />
            <main className="flex-1 py-8 w-full space-y-8">

                {/* --- Profile Banner --- */}
                <ProfileBanner
                    displayName={displayName}
                    joinedDate={joinedDate}
                    testsCount={totalTests}
                />

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

                {/* Public Link Footer */}
                <div className="flex justify-center pt-8 pb-4 opacity-50 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/10 px-3 py-1.5 rounded-full select-all border border-transparent hover:border-border/20 transition-colors">
                        <Share2 className="w-3 h-3" />
                        <span>{window.location.origin}/u/{user?.uid}</span>
                        <a href={`/u/${user?.uid}`} target="_blank" rel="noreferrer" className="hover:text-primary ml-1">
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>

            </main>
        </PageLayout>
    );
};
