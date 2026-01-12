import { PageLayout } from "@/components/layout/page-layout";
import { Header } from "@/components/ui-blocks/header";
import { useTheme, type Theme } from "@/components/theme-provider";
import { useAuth } from "@/context/auth-context";
import { updateUserTheme } from "@/lib/firestore-helpers";
import { saveTheme } from "@/lib/storage-helpers";
import { useTypingSound, type SoundType } from "@/hooks/use-sound";
import { Check, Volume2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

import { THEMES, type ThemeDefinition } from "@/lib/themes";

export const Settings = () => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const { currentSound, setSound, sounds, previewSound } = useTypingSound();

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        if (user) {
            updateUserTheme(user.uid, newTheme);
        } else {
            saveTheme(newTheme);
        }
    };

    const renderThemeGrid = (themes: readonly ThemeDefinition[]) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id as Theme)}
                    className={cn(
                        "relative h-14 w-full rounded-xl flex items-center justify-center text-xs font-semibold tracking-wide uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
                        t.bg,
                        t.text,
                        theme === t.id && "ring-2 ring-primary ring-offset-2 ring-offset-background z-10"
                    )}
                >
                    {t.name}
                </button>
            ))}
        </div>
    );

    return (
        <PageLayout>
            <main className="flex-1 py-8 w-full space-y-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
                            <p className="text-muted-foreground">Customize how the application looks.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Base</h3>
                            {renderThemeGrid(THEMES.base)}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dark Settings</h3>
                            {renderThemeGrid(THEMES.dark)}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Light Settings</h3>
                            {renderThemeGrid(THEMES.light)}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border/40">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Volume2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Sound</h2>
                            <p className="text-muted-foreground">Choose the sound effect played while typing.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {sounds.map((sound) => (
                            <button
                                key={sound}
                                onClick={() => {
                                    setSound(sound);
                                    previewSound(sound);
                                }}
                                className={cn(
                                    "group relative flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-border transition-all hover:bg-secondary/40",
                                    currentSound === sound && "ring-2 ring-primary border-primary bg-secondary/20"
                                )}
                            >
                                <span className="capitalize font-medium">
                                    {sound === 'rubber' ? 'Rubber Key' : sound}
                                </span>
                                {currentSound === sound && (
                                    <div className="p-0.5 rounded-full bg-primary text-primary-foreground">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </PageLayout>
    );
};
