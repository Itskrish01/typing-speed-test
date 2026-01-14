import { Trophy, ChevronDown, Settings as SettingsIcon } from "lucide-react";
// import { ModeToggle } from "../mode-toggle";
import { UserMenu } from "../layout/user-menu";
import { useAuth } from "@/context/auth-context";
import { usePersonalBests, useGameConfig } from "../../store/game-store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { useTypingSound } from "@/hooks/use-sound";
import { Volume2, VolumeX } from "lucide-react";

const MuteButton = () => {
    const { muted, toggleMute } = useTypingSound();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={toggleMute}
        >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="sr-only">{muted ? 'Unmute' : 'Mute'}</span>
        </Button>
    );
};

export const Header = () => {
    const { difficulty, setDifficulty } = useGameConfig();
    const personalBests = usePersonalBests();
    const { user } = useAuth();

    const currentBest = difficulty !== 'custom' ? personalBests[difficulty]?.wpm || 0 : 0;

    return (
        <header className="w-full flex items-center justify-between pb-4 sm:pb-8 pt-4">
            {/* Title Area */}
            <Link to="/" className="flex flex-col gap-1 items-start text-left">
                <div className="flex items-center gap-3">


                    {/* Title - Hidden on mobile, visible on sm+ */}
                    <span className="hidden sm:block text-2xl font-bold tracking-tight text-foreground">
                        Tapixo
                    </span>
                    {/* Mobile Title */}
                    <span className="sm:hidden text-2xl font-bold tracking-tight text-foreground">
                        TP
                    </span>
                </div>
                {/* Subtitle - Hidden on mobile */}
                <p className="text-sm text-muted-foreground hidden sm:block">
                    Check your typing skills in a minute
                </p>
            </Link>



            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-2">

                {user && (
                    <>
                        <MuteButton />
                    </>
                )}
                {/* Personal Best Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 group h-10 hover:bg-transparent cursor-pointer" aria-label="View personal bests">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-foreground transition-colors shrink-0">
                                <Trophy className="w-4 h-4" />
                            </span>
                            <span className="hidden sm:flex flex-col items-start gap-0.5 text-right">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none whitespace-nowrap">Personal Best</span>
                                <span className="flex items-center gap-1">
                                    <span className="text-base font-bold tabular-nums leading-none">
                                        {currentBest} wpm
                                    </span>
                                    <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50" />
                                </span>
                            </span>
                            {/* Mobile only WPM display */}
                            <span className="sm:hidden text-sm font-bold tabular-nums leading-none">
                                {currentBest}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="flex justify-between cursor-pointer" onClick={() => setDifficulty('easy')}>
                            <span className="font-medium text-chart-2">Easy</span>
                            <span className="font-bold">{personalBests.easy?.wpm || 0} wpm</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex justify-between cursor-pointer" onClick={() => setDifficulty('medium')}>
                            <span className="font-medium text-chart-3">Medium</span>
                            <span className="font-bold">{personalBests.medium?.wpm || 0} wpm</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex justify-between cursor-pointer" onClick={() => setDifficulty('hard')}>
                            <span className="font-medium text-destructive">Hard</span>
                            <span className="font-bold">{personalBests.hard?.wpm || 0} wpm</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="w-px h-8 bg-border hidden sm:block" />

                {user && (
                    <Button variant="ghost" size="icon" asChild className="h-9 w-9 text-muted-foreground hover:text-foreground">
                        <Link to="/settings">
                            <SettingsIcon className="w-5 h-5" />
                            <span className="sr-only">Settings</span>
                        </Link>
                    </Button>
                )}


                <UserMenu />
            </div>
        </header>
    );
};