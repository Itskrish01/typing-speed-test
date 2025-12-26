import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserProfile, getUserHistory, getUserProfileByUsername, type UserProfile } from "../../lib/firestore-helpers";
import { ProfileBanner } from "../../components/ui-blocks/profile-banner";
import { StatsOverview } from "../../components/ui-blocks/stats-overview";

// ==================== Reusable Components ====================

const LoadingSpinner = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
);

const NotFoundMessage = () => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-muted-foreground">User not found</p>
        </div>
    </div>
);

// ==================== Helper ====================

const getDisplayName = (profile: UserProfile): string => {
    return profile.username || profile.displayName || profile.email?.split('@')[0] || 'User';
};

const formatJoinDate = (profile: UserProfile): string => {
    try {
        return profile.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) || 'Unknown';
    } catch {
        return 'Unknown';
    }
};

// ==================== Main Component ====================

export const PublicProfileCard = () => {
    const { userId } = useParams(); // This acts as 'identifier' (username OR uid)
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (userId) {
                setLoading(true);
                try {
                    // 1. Try finding by username
                    let profileData = await getUserProfileByUsername(userId);

                    // 2. If not found, try by UID (backward compatibility)
                    if (!profileData) {
                        profileData = await getUserProfile(userId);
                    }

                    if (profileData) {
                        setProfile(profileData);
                        // Fetch history using the resolved UID
                        const historyData = await getUserHistory(profileData.uid, 500);
                        setHistory(historyData);
                    } else {
                        setProfile(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch public profile:", error);
                    setProfile(null);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [userId]);

    if (loading) return <LoadingSpinner />;
    if (!profile) return <NotFoundMessage />;

    const displayName = getDisplayName(profile);
    const joinDate = formatJoinDate(profile);

    return (
        <div className={profile.themePreference === 'dark' ? 'dark' : ''}>
            <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 selection:bg-primary/30 selection:text-primary-foreground">

                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Profile Banner */}
                    <ProfileBanner
                        displayName={displayName}
                        joinedDate={joinDate}
                        testsCount={history.length}
                    />

                    {/* Stats Overview (without Heatmap) */}
                    <StatsOverview history={history} personalBests={profile?.bestWpm} />

                </div>

            </div>
        </div>
    );
};
