import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/context/auth-context";
import { updateUserTheme } from "@/lib/firestore-helpers";
import { saveTheme } from "@/lib/storage-helpers";
import { Palette, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { THEMES, ALL_THEMES, type ThemeDefinition, type Theme } from "@/lib/themes";

export const ThemeFooter = () => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Toggle with Cmd+K or CP shortcut? User didn't request shortcut but it's standard.
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        if (user) {
            updateUserTheme(user.uid, newTheme);
        } else {
            saveTheme(newTheme);
        }
    };

    const currentTheme = ALL_THEMES.find(t => t.id === theme) || ALL_THEMES[0];

    const renderThemeItems = (themes: readonly ThemeDefinition[]) => (
        <>
            {themes.map((t) => (
                <CommandItem
                    key={t.id}
                    value={t.name}
                    onSelect={() => {
                        handleThemeChange(t.id as Theme);
                        setOpen(false);
                    }}
                    className={cn(
                        "cursor-pointer",
                        theme === t.id && "bg-accent/50"
                    )}
                >
                    <div className="flex items-center flex-1 gap-3">
                        <div className={cn("h-4 w-4 rounded-full border border-border/20", t.bg)} />
                        <span>{t.name}</span>
                    </div>
                    {theme === t.id && <Check className="ml-auto h-4 w-4 duration-200" />}
                </CommandItem>
            ))}
        </>
    );

    return (
        <>
            <div className="w-full py-6 flex justify-between items-end">
                {/* Left Side: Inspiration Link */}
                <div className="pointer-events-auto flex items-center gap-1.5 text-xs text-muted-foreground/50">
                    <span>inspired by</span>
                    <a
                        href="https://monkeytype.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                    >
                        monkeytype
                    </a>
                </div>

                {/* Right Side: Theme Selector */}
                <button
                    onClick={() => setOpen(true)}
                    className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-muted/50"
                >
                    <Palette className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{currentTheme.name}</span>
                </button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 overflow-hidden max-w-xl bg-popover/95 backdrop-blur-xl border-none shadow-2xl">
                    <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                        <CommandInput
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search theme..."
                        />
                        <CommandList>
                            <CommandEmpty>No theme found.</CommandEmpty>
                            <CommandGroup heading="Base">
                                {renderThemeItems(THEMES.base)}
                            </CommandGroup>
                            <CommandGroup heading="Dark">
                                {renderThemeItems(THEMES.dark)}
                            </CommandGroup>
                            <CommandGroup heading="Light">
                                {renderThemeItems(THEMES.light)}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
};
