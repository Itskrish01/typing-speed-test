import { Hourglass, Gauge, Target } from "lucide-react";
import { formatTime } from "../../lib/typing-utils";
import { useWpm, useAccuracy, useTimeLeft } from "../../store/game-store";
import { memo } from "react";

// Isolated components to prevent unnecessary re-renders
const LiveWpm = memo(() => {
    const wpm = useWpm();
    return (
        <span className="text-4xl sm:text-5xl font-black text-primary leading-none tabular-nums drop-shadow-sm">
            {wpm}
        </span>
    );
});
LiveWpm.displayName = 'LiveWpm';

const LiveAccuracy = memo(() => {
    const accuracy = useAccuracy();
    return (
        <span className={`text-2xl sm:text-3xl font-bold leading-none tabular-nums transition-colors ${accuracy >= 95 ? 'text-chart-2' : accuracy >= 80 ? 'text-chart-3' : 'text-destructive'
            }`}>
            {accuracy}%
        </span>
    );
});
LiveAccuracy.displayName = 'LiveAccuracy';

const LiveTime = memo(() => {
    const timeLeft = useTimeLeft();
    return (
        <span className="text-2xl sm:text-3xl font-bold tabular-nums leading-none">
            {formatTime(timeLeft)}
        </span>
    );
});
LiveTime.displayName = 'LiveTime';

export const StatsBar = memo(() => {
    return (
        <div className="flex items-center gap-6 sm:gap-12 md:gap-16 lg:gap-24 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Time */}
            <div className="flex flex-col items-center gap-1 group">
                <div className="flex items-center gap-2 text-primary/80 group-hover:text-primary transition-colors">
                    <Hourglass className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Time</span>
                </div>
                <LiveTime />
            </div>

            {/* WPM */}
            <div className="flex flex-col items-center gap-1 group">
                <div className="flex items-center gap-2 text-primary/80 group-hover:text-primary transition-colors">
                    <Gauge className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">WPM</span>
                </div>
                <LiveWpm />
            </div>

            {/* Accuracy */}
            <div className="flex flex-col items-center gap-1 group">
                <div className="flex items-center gap-2 text-primary/80 group-hover:text-primary transition-colors">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Acc</span>
                </div>
                <LiveAccuracy />
            </div>
        </div>
    );
});
StatsBar.displayName = 'StatsBar';
