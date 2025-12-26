import { useEffect } from "react";
import { useAuth } from "../context/auth-context";
import { getUserProfile } from "../lib/firestore-helpers";
import { useGameActions } from "../store/game-store";
import { useTheme } from "./theme-provider";
import { type StoredBest, type Difficulty } from "../lib/game-types";

export const UserDataSync = () => {
    const { user } = useAuth();
    const { setPersonalBests } = useGameActions();
    const { setTheme } = useTheme();

    useEffect(() => {
        const syncData = async () => {
            if (user) {
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    if (profile.bestWpm) {
                        const firestoreBests = profile.bestWpm as Record<string, number>;
                        const mappedBests: Record<Difficulty, StoredBest | null> = {
                            easy: firestoreBests.easy ? { wpm: firestoreBests.easy, accuracy: 0, date: new Date().toISOString() } : null,
                            medium: firestoreBests.medium ? { wpm: firestoreBests.medium, accuracy: 0, date: new Date().toISOString() } : null,
                            hard: firestoreBests.hard ? { wpm: firestoreBests.hard, accuracy: 0, date: new Date().toISOString() } : null,
                            custom: null
                        };
                        setPersonalBests(mappedBests);
                    }
                    if (profile.themePreference) {
                        setTheme(profile.themePreference as any);
                    }
                }
            } else {
                // Reset to empty/defaults on logout if desired
                // For now we can keep bests in memory or clear them. 
                // Clearing them ensures next user doesn't see previous user's bests.
                setPersonalBests({
                    easy: null,
                    medium: null,
                    hard: null,
                    custom: null
                });
            }
        };

        syncData();
    }, [user, setPersonalBests, setTheme]);

    return null;
};
