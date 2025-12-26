import { useEffect } from "react";
import { useAuth } from "../context/auth-context";
import { getUserProfile } from "../lib/firestore-helpers";
import { useGameActions } from "../store/game-store";
import { useTheme } from "./theme-provider";
import { EMPTY_PERSONAL_BESTS } from "../lib/game-types";
import { mapFirestoreBestsToStore } from "../lib/game-helpers";

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
                        const mappedBests = mapFirestoreBestsToStore(profile.bestWpm as Record<string, number>);
                        setPersonalBests(mappedBests);
                    }
                    if (profile.themePreference) {
                        setTheme(profile.themePreference as any);
                    }
                }
            } else {
                // Reset to empty/defaults on logout
                setPersonalBests({ ...EMPTY_PERSONAL_BESTS });
            }
        };

        syncData();
    }, [user, setPersonalBests, setTheme]);

    return null;
};
