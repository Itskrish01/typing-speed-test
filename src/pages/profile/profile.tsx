import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth-context";
import { getUserHistory, ensureUserProfile, type UserProfile } from "../../lib/firestore-helpers";
import { PageLayout } from "../../components/layout/page-layout";
import { Header } from "../../components/ui-blocks/header";
import { Button } from "../../components/ui/button";
import { Copy, ExternalLink, PenTool, Share2 } from "lucide-react";
import { ActivityHeatmap } from "../../components/ui-blocks/activity-heatmap";
import { StatsOverview } from "../../components/ui-blocks/stats-overview";

export const Profile = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<any[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const [historyData, profileData] = await Promise.all([
                    getUserHistory(user.uid, 500), // Get more history for heatmap
                    ensureUserProfile(user)
                ]);
                setHistory(historyData);
                setProfile(profileData);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const copyProfileLink = () => {
        const url = `${window.location.origin}/u/${user?.uid}`;
        navigator.clipboard.writeText(url);
    };

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
    // Calculate total time if possible? (Simulate for now based on mode)
    // We can iterate history and sum up strict durations if we had them.
    // For now we just show count.

    return (
        <PageLayout>
            <Header />
            <main className="flex-1 py-8 w-full space-y-8">

                {/* --- Profile Header (Banner Style) --- */}
                <div className="bg-secondary/20 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">

                    {/* Background sheen effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                    <div className="flex items-center gap-6 z-10">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center text-3xl font-bold border-2 border-border/5 text-muted-foreground overflow-hidden shadow-inner">
                                {/* SVG Avatar placeholder or Initials */}
                                <div className="text-2xl font-bold text-primary opacity-80">{displayName.charAt(0).toUpperCase()}</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground">
                                <span className="opacity-70">Joined {joinedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-12 text-center md:text-right z-10">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Tests Started</span>
                            <span className="text-3xl font-mono font-bold leading-none">{totalTests}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Tests Completed</span>
                            <span className="text-3xl font-mono font-bold leading-none">{totalTests}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-2 pl-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/20" onClick={copyProfileLink}>
                                <LinkIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

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

function LinkIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    )
}
