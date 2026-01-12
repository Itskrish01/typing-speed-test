export interface ThemeDefinition {
    id: string;
    name: string;
    bg: string;
    text: string;
}

const BASE_THEMES = [
    { id: "light", name: "Light", bg: "bg-white", text: "text-slate-900" },
    { id: "dark", name: "Dark", bg: "bg-slate-900", text: "text-white" },
    { id: "system", name: "System", bg: "bg-slate-200", text: "text-slate-900" },
] as const;

const DARK_THEMES = [
    { id: "espresso", name: "Espresso", bg: "bg-[#3e2723]", text: "text-[#d7ccc8]" },
    { id: "midnight", name: "Midnight", bg: "bg-[#0d47a1]", text: "text-[#e3f2fd]" },
    { id: "forest", name: "Forest", bg: "bg-[#1b5e20]", text: "text-[#e8f5e9]" },
    { id: "ruby", name: "Ruby", bg: "bg-[#b71c1c]", text: "text-[#ffebee]" },
    { id: "vscode", name: "VS Code", bg: "bg-[#1e1e1e]", text: "text-[#007acc]" },
    { id: "monochrome", name: "Monochrome", bg: "bg-black", text: "text-white" },
    { id: "matrix", name: "Matrix", bg: "bg-black", text: "text-[#00ff00]" },
    { id: "synthwave", name: "Synthwave", bg: "bg-[#240046]", text: "text-[#f72585]" },
] as const;

const LIGHT_THEMES = [
    { id: "pastel-rose", name: "Pastel Rose", bg: "bg-[#ffe4ec]", text: "text-[#ffb3c6]" },
    { id: "pastel-sky", name: "Pastel Sky", bg: "bg-[#e0f2fe]", text: "text-[#7dd3fc]" },
    { id: "pastel-mint", name: "Pastel Mint", bg: "bg-[#dcfce7]", text: "text-[#86efac]" },
    { id: "pastel-lavender", name: "Pastel Lavender", bg: "bg-[#ede9fe]", text: "text-[#c4b5fd]" },
    { id: "pastel-peach", name: "Pastel Peach", bg: "bg-[#ffedd5]", text: "text-[#fdba74]" },
] as const;

export const THEMES = {
    base: BASE_THEMES,
    dark: DARK_THEMES,
    light: LIGHT_THEMES,
};

export const ALL_THEMES = [
    ...BASE_THEMES,
    ...DARK_THEMES,
    ...LIGHT_THEMES,
] as const;


export type Theme = typeof ALL_THEMES[number]['id'];

export const isDarkTheme = (theme: string): boolean => {
    if (theme === 'dark') return true;
    // Check if it's in the dark themes group
    if (DARK_THEMES.some(t => t.id === theme)) return true;
    // Check specific dark ones from base or other if any (none currently other than 'dark')
    return false;
};

