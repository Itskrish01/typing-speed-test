import { createContext, useContext, useEffect, useState } from "react"

export type Theme =
    | "dark"
    | "light"
    | "system"
    | "espresso"
    | "midnight"
    | "forest"
    | "ruby"
    | "vscode"
    | "monochrome"
    | "matrix"
    | "synthwave";

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

// Themes that count as "dark mode" for Tailwind
const DARK_THEMES = ["dark", "espresso", "midnight", "forest", "ruby", "vscode", "monochrome", "matrix", "synthwave"];

export function ThemeProvider({
    children,
    defaultTheme = "system",
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => {
            // Try to read from localStorage for non-logged-in users
            const storedTheme = localStorage.getItem("theme") as Theme | null
            return storedTheme || defaultTheme
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

        if (DARK_THEMES.includes(theme)) {
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
