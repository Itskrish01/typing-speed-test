import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getUserProfile,
    getUserHistory,
    getUserProfileByUsername,
    type UserProfile,
    type HistoryEntry,
} from "@/lib/firestore-helpers";
import { ProfileBanner } from "@/components/ui-blocks/profile-banner";
import { StatsOverview } from "@/components/ui-blocks/stats-overview";
import { LoadingSpinner, NotFound } from "@/components/common";

const DARK_THEMES = [
    "dark",
    "espresso",
    "midnight",
    "forest",
    "ruby",
    "vscode",
    "monochrome",
    "matrix",
    "synthwave",
];

const getDisplayName = (profile: UserProfile): string => {
    return profile.username || profile.displayName || profile.email?.split("@")[0] || "User";
};

const formatJoinDate = (profile: UserProfile): string => {
    try {
        return (
            profile.createdAt?.toDate?.()?.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }) || "Unknown"
        );
    } catch {
        return "Unknown";
    }
};

export const PublicProfileCard = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            setLoading(true);
            try {
                let profileData = await getUserProfileByUsername(userId);

                if (!profileData) {
                    profileData = await getUserProfile(userId);
                }

                if (profileData) {
                    setProfile(profileData);
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
        };

        fetchData();
    }, [userId]);

    if (loading) return <LoadingSpinner fullScreen />;
    if (!profile) return <NotFound message="User not found" />;

    const displayName = getDisplayName(profile);
    const joinDate = formatJoinDate(profile);
    const userTheme = profile.themePreference || "dark";
    const isDark = DARK_THEMES.includes(userTheme);

    return (
        <div className={isDark ? "dark" : ""} data-theme={userTheme}>
            <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 selection:bg-primary/30 selection:text-primary-foreground">
                <div className="max-w-7xl mx-auto space-y-6">
                    <ProfileBanner
                        displayName={displayName}
                        joinedDate={joinDate}
                        testsCount={history.length}
                    />
                    <StatsOverview history={history} personalBests={profile?.bestWpm} />
                </div>
            </div>
        </div>
    );
};
