import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../../lib/utils";

interface ActivityHeatmapProps {
    history: any[];
}

export const ActivityHeatmap = ({ history }: ActivityHeatmapProps) => {
    const calendarData = useMemo(() => {
        // Generate last 365 days
        const today = new Date();
        const days = [];
        const activityMap = new Map();

        // Populate activity map
        history.forEach(test => {
            const dateStr = test.timestamp?.toDate?.()?.toISOString().split('T')[0];
            if (dateStr) {
                activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
            }
        });

        // Generate grid (52 weeks x 7 days)
        // We want to end on today.
        // Start date = today - 364 days
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);

        // Adjust start date to be a Sunday/Monday to align grid? 
        // GitHub aligns columns by week.
        // Let's just generate weeks.

        const weeks = [];
        let currentWeek = [];
        let iterDate = new Date(startDate);

        // Align iterDate to the previous Sunday
        iterDate.setDate(iterDate.getDate() - iterDate.getDay());

        // Generate ~53 weeks to cover the full year view
        for (let w = 0; w < 53; w++) {
            currentWeek = [];
            for (let d = 0; d < 7; d++) {
                const dateStr = iterDate.toISOString().split('T')[0];
                const count = activityMap.get(dateStr) || 0;

                // Only show if date is not in future
                const isFuture = iterDate > today;

                currentWeek.push({
                    date: dateStr,
                    count,
                    level: Math.min(Math.ceil(count / 2), 4), // 0-4 scale
                    isFuture
                });
                iterDate.setDate(iterDate.getDate() + 1);
            }
            weeks.push(currentWeek);
        }
        return weeks;
    }, [history]);

    return (
        <div className="w-full overflow-x-auto">
            <div className="flex flex-col gap-2 min-w-[600px]">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>last 12 months (approx)</span>
                    <div className="flex items-center gap-2">
                        <span>less</span>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map(l => (
                                <div key={l} className={cn(
                                    "w-3 h-3 rounded-sm",
                                    l === 0 ? "bg-muted/20" : "bg-primary",
                                    l === 1 && "opacity-40",
                                    l === 2 && "opacity-60",
                                    l === 3 && "opacity-80",
                                    l === 4 && "opacity-100",
                                )} />
                            ))}
                        </div>
                        <span>more</span>
                    </div>
                </div>

                <div className="flex gap-2 px-1 py-1 justify-center sm:justify-start">
                    {/* Week Columns */}
                    {calendarData.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-2">
                            {week.map((day, dIndex) => (
                                day.isFuture ? null : (
                                    <TooltipProvider key={`${wIndex}-${dIndex}`}>
                                        <Tooltip delayDuration={50}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "w-4 h-4 rounded-[2px] transition-colors hover:ring-1 hover:ring-foreground/50",
                                                        day.count === 0 ? "bg-muted" : "bg-primary",
                                                        day.count > 0 && day.level === 1 && "opacity-40",
                                                        day.count > 0 && day.level === 2 && "opacity-60",
                                                        day.count > 0 && day.level === 3 && "opacity-80",
                                                        day.count > 0 && day.level === 4 && "opacity-100",
                                                    )}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent className="text-xs bg-popover text-popover-foreground">
                                                {day.count} tests on {day.date}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
