import { Trophy, ChevronDown } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { UserMenu } from "../layout/user-menu";
import { usePersonalBests, useGameConfig } from "../../store/game-store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
    const { difficulty } = useGameConfig();
    const personalBests = usePersonalBests();

    const currentBest = difficulty !== 'custom' ? personalBests[difficulty]?.wpm || 0 : 0;

    return (
        <header className="w-full flex items-center justify-between pb-4 sm:pb-8 pt-4">
            {/* Title Area */}
            <Link to="/" className="flex flex-col gap-1 items-start text-left">
                <div className="flex items-center gap-3">


                    {/* Title - Hidden on mobile, visible on sm+ */}
                    <h1 className="hidden sm:block text-2xl font-bold tracking-tight text-foreground">
                        Tapixo
                    </h1>
                </div>
                {/* Subtitle - Hidden on mobile */}
                <p className="text-sm text-muted-foreground hidden sm:block">
                    Check your typing skills in a minute
                </p>
            </Link>

            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-6">
                {/* Personal Best Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 group px-2 h-10 hover:bg-secondary/50">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                <Trophy className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5 text-right hidden sm:flex">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none whitespace-nowrap">Personal Best</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-base font-bold tabular-nums leading-none">
                                        {currentBest} wpm
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50" />
                                </div>
                            </div>
                            {/* Mobile only WPM display */}
                            <span className="sm:hidden text-sm font-bold tabular-nums leading-none">
                                {currentBest}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="flex justify-between cursor-default">
                            <span className="font-medium text-chart-2">Easy</span>
                            <span className="font-bold">{personalBests.easy?.wpm || 0} wpm</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex justify-between cursor-default">
                            <span className="font-medium text-chart-3">Medium</span>
                            <span className="font-bold">{personalBests.medium?.wpm || 0} wpm</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex justify-between cursor-default">
                            <span className="font-medium text-destructive">Hard</span>
                            <span className="font-bold">{personalBests.hard?.wpm || 0} wpm</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-8 bg-border hidden sm:block" />

                <ModeToggle />
                <UserMenu />
            </div>
        </header>
    );
};