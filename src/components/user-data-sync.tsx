import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import { ensureUserProfile } from "../lib/firestore-helpers";
import { useGameActions } from "../store/game-store";
import { useTheme } from "./theme-provider";
import { EMPTY_PERSONAL_BESTS } from "../lib/game-types";
import { mapFirestoreBestsToStore } from "../lib/game-helpers";
import { Loader2 } from "lucide-react";

// Cache key for storing last sync timestamp
const SYNC_CACHE_KEY = 'tapixo_last_sync';
const SYNC_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const UserDataSync = ({ children }: { children: React.ReactNode }) => {
    const { user, loading: authLoading } = useAuth();
    const { setPersonalBests } = useGameActions();
    const { setTheme } = useTheme();
    const [isSyncing, setIsSyncing] = useState(true);

    useEffect(() => {
        const syncData = async () => {
            if (authLoading) return; // Wait for auth to be determined

            if (user) {
                try {
                    // Fetch fresh data from Firestore and ensure profile exists/is valid
                    const profile = await ensureUserProfile(user);
                    if (profile) {
                        // Map scores (including ranked)
                        if (profile.bestWpm || profile.bestRankedWpm) {
                            const scoresToMap = {
                                ...(profile.bestWpm || {}),
                                ranked: profile.bestRankedWpm || 0
                            };
                            const mappedBests = mapFirestoreBestsToStore(scoresToMap as Record<string, number>);
                            setPersonalBests(mappedBests);
                        }

                        // Set theme
                        if (profile.themePreference) {
                            setTheme(profile.themePreference as any);
                        }
                    }
                } catch (error) {
                    console.error("Failed to sync user data:", error);
                }
            } else {
                // Reset to empty/defaults on logout
                setPersonalBests({ ...EMPTY_PERSONAL_BESTS });
            }

            // Done syncing
            setIsSyncing(false);
        };

        syncData();
    }, [user, authLoading, setPersonalBests, setTheme]);

    if (authLoading || isSyncing) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
};

