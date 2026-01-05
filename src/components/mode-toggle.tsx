import { Palette } from "lucide-react"
import { Button } from "./ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useTheme, type Theme } from "./theme-provider"
import { cn } from "../lib/utils"
import { useAuth } from "../context/auth-context"
import { updateUserTheme } from "../lib/firestore-helpers"
import { saveTheme } from "../lib/storage-helpers"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const { user } = useAuth()

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme)
        if (user) {
            updateUserTheme(user.uid, newTheme)
        } else {
            saveTheme(newTheme)
        }
    }

    const activeCheck = (t: Theme) => theme === t ? "opacity-100 font-bold" : "opacity-70"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[500px] overflow-y-auto">
                <DropdownMenuItem onClick={() => handleThemeChange("light")} className={cn("flex justify-between", activeCheck("light"))}>
                    Light
                    <div className="w-3 h-3 rounded-full bg-white border border-gray-200 ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("dark")} className={cn("flex justify-between", activeCheck("dark"))}>
                    Dark
                    <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700 ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("system")} className={cn("flex justify-between", activeCheck("system"))}>
                    System
                    <div className="w-3 h-3 rounded-full bg-linear-to-tr from-white to-slate-900 border border-slate-200 ml-2" />
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem onClick={() => handleThemeChange("espresso")} className={cn("flex justify-between", activeCheck("espresso"))}>
                    Espresso
                    <div className="w-3 h-3 rounded-full bg-[#5d4037] border border-[#3e2723] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("midnight")} className={cn("flex justify-between", activeCheck("midnight"))}>
                    Midnight
                    <div className="w-3 h-3 rounded-full bg-[#1a237e] border border-[#0d47a1] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("forest")} className={cn("flex justify-between", activeCheck("forest"))}>
                    Forest
                    <div className="w-3 h-3 rounded-full bg-[#1b5e20] border border-[#2e7d32] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("ruby")} className={cn("flex justify-between", activeCheck("ruby"))}>
                    Ruby
                    <div className="w-3 h-3 rounded-full bg-[#b71c1c] border border-[#c62828] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("vscode")} className={cn("flex justify-between", activeCheck("vscode"))}>
                    VS Code
                    <div className="w-3 h-3 rounded-full bg-[#1e1e1e] border border-[#007acc] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("monochrome")} className={cn("flex justify-between", activeCheck("monochrome"))}>
                    Monochrome
                    <div className="w-3 h-3 rounded-full bg-black border border-white ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("matrix")} className={cn("flex justify-between", activeCheck("matrix"))}>
                    Matrix
                    <div className="w-3 h-3 rounded-full bg-black border border-[#00ff00] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("synthwave")} className={cn("flex justify-between", activeCheck("synthwave"))}>
                    Synthwave
                    <div className="w-3 h-3 rounded-full bg-[#240046] border border-[#f72585] ml-2" />
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem onClick={() => handleThemeChange("pastel-rose")} className={cn("flex justify-between", activeCheck("pastel-rose"))}>
                    Pastel Rose
                    <div className="w-3 h-3 rounded-full bg-[#ffe4ec] border border-[#ffb3c6] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("pastel-sky")} className={cn("flex justify-between", activeCheck("pastel-sky"))}>
                    Pastel Sky
                    <div className="w-3 h-3 rounded-full bg-[#e0f2fe] border border-[#7dd3fc] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("pastel-mint")} className={cn("flex justify-between", activeCheck("pastel-mint"))}>
                    Pastel Mint
                    <div className="w-3 h-3 rounded-full bg-[#dcfce7] border border-[#86efac] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("pastel-lavender")} className={cn("flex justify-between", activeCheck("pastel-lavender"))}>
                    Pastel Lavender
                    <div className="w-3 h-3 rounded-full bg-[#ede9fe] border border-[#c4b5fd] ml-2" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("pastel-peach")} className={cn("flex justify-between", activeCheck("pastel-peach"))}>
                    Pastel Peach
                    <div className="w-3 h-3 rounded-full bg-[#ffedd5] border border-[#fdba74] ml-2" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
