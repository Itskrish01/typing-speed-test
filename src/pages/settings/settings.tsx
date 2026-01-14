import { PageLayout } from "@/components/layout/page-layout";
import { Header } from "@/components/ui-blocks/header";
import { useTheme, type Theme } from "@/components/theme-provider";
import { useAuth } from "@/context/auth-context";
import { updateUserTheme } from "@/lib/firestore-helpers";
import { saveTheme } from "@/lib/storage-helpers";
import { useTypingSound, type SoundType } from "@/hooks/use-sound";
import {
    Check,
    Volume2,
    Palette,
    VolumeX,
    Keyboard,
    MousePointerClick,
    Crosshair,
    Eraser,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

import { THEMES, type ThemeDefinition } from "@/lib/themes";

const SOUND_ICONS: Record<SoundType, React.ElementType> = {
    off: VolumeX,
    click: MousePointerClick,
    typewriter: Keyboard,
    hitmarker: Crosshair,
    rubber: Eraser,
    pop: Zap,
    error: VolumeX // Should not be selectable usually, but good fallback
};

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
                        {sounds.map((sound) => {
                            const isSelected = currentSound === sound;
                            const Icon = SOUND_ICONS[sound] || Volume2;

                            return (
                                <button
                                    key={sound}
                                    onClick={() => {
                                        setSound(sound);
                                        previewSound(sound);
                                    }}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 outline-none",
                                        "hover:scale-[1.02] active:scale-95",
                                        isSelected
                                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                                            : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "mb-3 p-3 rounded-full transition-colors",
                                        isSelected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="capitalize font-semibold text-sm tracking-wide">
                                        {sound === 'rubber' ? 'Rubber Key' : sound}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 text-primary">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>
        </PageLayout>
    );
};
