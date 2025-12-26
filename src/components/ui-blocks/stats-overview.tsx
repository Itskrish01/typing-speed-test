import { useMemo } from 'react';
import { cn } from "../../lib/utils";

interface StatsOverviewProps {
    history: any[];
    personalBests: any; // Using existing structure
}

export const StatsOverview = ({ history, personalBests }: StatsOverviewProps) => { // eslint-disable-line

    const stats = useMemo(() => {
        // Helper to get max WPM and Avg Acc
        const getStats = (data: any[]) => {
            if (data.length === 0) return { count: 0, maxWpm: '-', avgAcc: '-' };
            const maxWpm = Math.max(...data.map(d => d.wpm));
            const avgAcc = Math.round(data.reduce((acc, curr) => acc + curr.accuracy, 0) / data.length);
            return { count: data.length, maxWpm: Math.round(maxWpm), avgAcc };
        };

        // Group by mode
        const timedData = history.filter(h => h.mode === 'timed');
        const wordsData = history.filter(h => h.mode === 'passage');

        // Group by difficulty (across all modes for now, or just passage?)
        // Let's do across all modes to show general proficiency
        const easyData = history.filter(h => h.difficulty === 'easy');
        const mediumData = history.filter(h => h.difficulty === 'medium');
        const hardData = history.filter(h => h.difficulty === 'hard');

        return {
            timed: getStats(timedData),
            words: getStats(wordsData),
            easy: getStats(easyData),
            medium: getStats(mediumData),
            hard: getStats(hardData),
        };
    }, [history]);

    const StatCard = ({ title, data }: { title: string, data: any }) => (
        <div className="bg-secondary/20 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center text-muted-foreground text-sm">
                <span className="font-medium">{title}</span>
                <span className="text-xs opacity-50 bg-background/50 px-2 py-0.5 rounded-full">{data.count} tests</span>
            </div>
            <div className="flex gap-8 sm:gap-12 items-end">
                <div className="flex flex-col gap-1">
                    <span className="text-3xl sm:text-4xl font-mono font-bold">{data.maxWpm}</span>
                    <div className="flex flex-col text-xs text-muted-foreground">
                        <span className="uppercase tracking-widest text-[10px]">Peak WPM</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-3xl sm:text-4xl font-mono font-bold">{data.avgAcc}<span className="text-xl align-top opacity-50">%</span></span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg Accuracy</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Mode Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard title="Timed Modes" data={stats.timed} />
                <StatCard title="Words Modes" data={stats.words} />
            </div>

            {/* Difficulty Breakdowns */}
            <h3 className="text-sm font-medium text-muted-foreground pl-1">Difficulty Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Easy" data={stats.easy} />
                <StatCard title="Medium" data={stats.medium} />
                <StatCard title="Hard" data={stats.hard} />
            </div>
        </div>
    );
};
