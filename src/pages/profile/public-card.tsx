import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserProfile, type UserProfile } from "../../lib/firestore-helpers";
import { Trophy, Calendar } from "lucide-react";

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

interface StatCardProps {
    label: string;
    value: number | string;
    highlight?: boolean;
    delay: number;
}

const StatCard = ({ label, value, highlight, delay }: StatCardProps) => (
    <div
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 hover:scale-105 animate-in fade-in zoom-in slide-in-from-bottom-4 fill-mode-backwards
            ${highlight
                ? 'bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]'
                : 'bg-card border-border shadow-sm'
            }`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">{label}</span>
        <span className={`text-3xl font-bold font-mono ${highlight ? 'text-primary' : 'text-foreground'}`}>
            {value || '-'}
        </span>
        <span className="text-[10px] text-muted-foreground/60 mt-1">WPM</span>
    </div>
);

// ==================== Helper ====================

const getDisplayName = (profile: UserProfile): string => {
    return profile.username || profile.displayName || profile.email?.split('@')[0] || 'User';
};

const getInitial = (profile: UserProfile): string => {
    const name = getDisplayName(profile);
    return name.charAt(0).toUpperCase();
};

const formatJoinDate = (profile: UserProfile): string => {
    try {
        return profile.createdAt?.toDate?.()?.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) || 'Unknown';
    } catch {
        return 'Unknown';
    }
};

// ==================== Main Component ====================

export const PublicProfileCard = () => {
    const { userId } = useParams();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (userId) {
                const data = await getUserProfile(userId);
                setProfile(data);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) return <LoadingSpinner />;
    if (!profile) return <NotFoundMessage />;

    const displayName = getDisplayName(profile);
    const initial = getInitial(profile);
    const joinDate = formatJoinDate(profile);

    return (
        <div className={profile.themePreference === 'dark' ? 'dark' : ''}>
            <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 selection:bg-primary/30 selection:text-primary-foreground">

                <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500">
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col items-center gap-8 relative overflow-hidden">

                        {/* Subtle background glow */}
                        <div className="absolute top-0 inset-x-0 h-40 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4 relative z-10">
                            <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary via-primary/80 to-primary/50 p-[2px] shadow-lg">
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-4xl font-bold text-primary select-none">
                                    {initial}
                                </div>
                            </div>

                            <div className="text-center space-y-1">
                                <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
                                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm bg-secondary/50 px-3 py-1 rounded-full">
                                    <Calendar className="w-3 h-3" />
                                    <span>Joined {joinDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground justify-center">
                                <Trophy className="w-4 h-4 text-primary" />
                                <span>Personal Bests</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full">
                                <StatCard label="Easy" value={profile.bestWpm?.easy || 0} delay={100} />
                                <StatCard label="Medium" value={profile.bestWpm?.medium || 0} highlight delay={200} />
                                <StatCard label="Hard" value={profile.bestWpm?.hard || 0} delay={300} />
                            </div>
                        </div>



                    </div>
                </div>

            </div>
        </div>
    );
};
