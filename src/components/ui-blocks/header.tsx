import { Trophy } from "lucide-react";

export const Header = () => {
    return (
        <header className="w-full py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <img
                        src="/logo/keyboard.png"
                        className="relative w-12 h-12 object-contain"
                        alt="Typing Speed Test Logo"
                    />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Typing Speed Test
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Type as fast as you can in 60 seconds
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-border/50 backdrop-blur-sm">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-secondary-foreground">
                    Personal Best: <span className="font-bold">0</span>
                </span>
            </div>
        </header>
    )
}