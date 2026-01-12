import { createContext, useContext, useEffect, useState } from "react"
import { loadTheme } from "@/lib/storage-helpers"
import { type Theme, THEMES, ALL_THEMES, isDarkTheme } from "@/lib/themes"

export type { Theme };

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => {
            const storedTheme = loadTheme();
            // Validate stored theme
            const isValidTheme = ALL_THEMES.some(t => t.id === storedTheme);
            return isValidTheme && storedTheme !== 'system' ? storedTheme : defaultTheme;
        }
    )

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")
        root.removeAttribute("data-theme")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            root.setAttribute("data-theme", systemTheme)
            return
        }

        root.setAttribute("data-theme", theme)

        if (isDarkTheme(theme)) {
            root.classList.add("dark")
        } else {
            root.classList.add("light")
        }
    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
