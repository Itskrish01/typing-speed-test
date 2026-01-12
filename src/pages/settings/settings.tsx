import { PageLayout } from "@/components/layout/page-layout";
import { Header } from "@/components/ui-blocks/header";
import { useTheme, type Theme } from "@/components/theme-provider";
import { useAuth } from "@/context/auth-context";
import { updateUserTheme } from "@/lib/firestore-helpers";
import { saveTheme } from "@/lib/storage-helpers";
import { useTypingSound, type SoundType } from "@/hooks/use-sound";
import { Check, Volume2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES: { id: Theme; name: string; bg: string; text: string }[] = [
    { id: "light", name: "Light", bg: "bg-white", text: "text-slate-900" },
    { id: "dark", name: "Dark", bg: "bg-slate-900", text: "text-white" },
    { id: "system", name: "System", bg: "bg-slate-200", text: "text-slate-900" },
    { id: "espresso", name: "Espresso", bg: "bg-[#3e2723]", text: "text-[#d7ccc8]" },
    { id: "midnight", name: "Midnight", bg: "bg-[#0d47a1]", text: "text-[#e3f2fd]" },
    { id: "forest", name: "Forest", bg: "bg-[#1b5e20]", text: "text-[#e8f5e9]" },
    { id: "ruby", name: "Ruby", bg: "bg-[#b71c1c]", text: "text-[#ffebee]" },
    { id: "vscode", name: "VS Code", bg: "bg-[#1e1e1e]", text: "text-[#007acc]" },
    { id: "monochrome", name: "Monochrome", bg: "bg-black", text: "text-white" },
    { id: "matrix", name: "Matrix", bg: "bg-black", text: "text-[#00ff00]" },
    { id: "synthwave", name: "Synthwave", bg: "bg-[#240046]", text: "text-[#f72585]" },
    { id: "pastel-rose", name: "Pastel Rose", bg: "bg-[#ffe4ec]", text: "text-[#ffb3c6]" },
    { id: "pastel-sky", name: "Pastel Sky", bg: "bg-[#e0f2fe]", text: "text-[#7dd3fc]" },
    { id: "pastel-mint", name: "Pastel Mint", bg: "bg-[#dcfce7]", text: "text-[#86efac]" },
    { id: "pastel-lavender", name: "Pastel Lavender", bg: "bg-[#ede9fe]", text: "text-[#c4b5fd]" },
    { id: "pastel-peach", name: "Pastel Peach", bg: "bg-[#ffedd5]", text: "text-[#fdba74]" },
];

export const Settings = () => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const { currentSound, setSound, sounds } = useTypingSound();

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        if (user) {
            updateUserTheme(user.uid, newTheme);
        } else {
            saveTheme(newTheme);
        }
    };

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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {THEMES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => handleThemeChange(t.id)}
                                className={cn(
                                    "relative h-10 w-full rounded-md flex items-center justify-center text-xs font-semibold tracking-wide uppercase transition-all hover:scale-[1.02] active:scale-95",
                                    t.bg,
                                    t.text,
                                    theme === t.id && "ring-2 ring-primary ring-offset-2 ring-offset-background z-10"
                                )}
                            >
                                {t.name}
                            </button>
                        ))}
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

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {sounds.map((sound) => (
                            <button
                                key={sound}
                                onClick={() => setSound(sound)}
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
