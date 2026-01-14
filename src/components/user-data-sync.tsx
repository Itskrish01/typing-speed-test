import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import { getUserProfile } from "../lib/firestore-helpers";
import { useGameActions } from "../store/game-store";
import { useTheme } from "./theme-provider";
import { EMPTY_PERSONAL_BESTS } from "../lib/game-types";
import { mapFirestoreBestsToStore } from "../lib/game-helpers";
import { Loader2 } from "lucide-react";

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
                    const profile = await getUserProfile(user.uid);
                    if (profile) {
                        if (profile.bestWpm) {
                            const mappedBests = mapFirestoreBestsToStore(profile.bestWpm as Record<string, number>);
                            setPersonalBests(mappedBests);
                        }
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

            // Done syncing (or determined no sync needed)
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
