import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getUserProfile,
    getUserHistory,
    getUserProfileByUsername,
    getUserRank,
    type UserProfile,
    type HistoryEntry,
} from "@/lib/firestore-helpers";
import { Trophy } from "lucide-react";
import { ProfileBanner } from "@/components/ui-blocks/profile-banner";
import { StatsOverview } from "@/components/ui-blocks/stats-overview";
import { LoadingSpinner, NotFound } from "@/components/common";

import { THEMES, isDarkTheme } from "@/lib/themes";

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
    const [globalRank, setGlobalRank] = useState<number | null>(null);
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
                    const [historyData, rank] = await Promise.all([
                        getUserHistory(profileData.uid, 500),
                        getUserRank(profileData.uid)
                    ]);
                    setHistory(historyData);
                    setGlobalRank(rank);
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
    const isDark = isDarkTheme(userTheme);

    return (
        <div className={isDark ? "dark" : ""} data-theme={userTheme}>
            <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 selection:bg-primary/30 selection:text-primary-foreground">
                <div className="max-w-7xl mx-auto space-y-6">
                    <ProfileBanner
                        displayName={displayName}
                        joinedDate={joinDate}
                        testsCount={history.length}
                    />

                    {globalRank && (
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-4 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-foreground">Ranked Mode Standing</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Currently ranked <span className="text-primary font-bold text-lg">#{globalRank}</span> globally in the ranked leaderboard.
                                </p>
                            </div>
                            <div className="sm:ml-auto">
                                <div className="text-3xl font-bold text-primary tabular-nums">#{globalRank}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Global Rank</div>
                            </div>
                        </div>
                    )}
                    <StatsOverview history={history} personalBests={profile?.bestWpm} />
                </div>
            </div>
        </div>
    );
};
