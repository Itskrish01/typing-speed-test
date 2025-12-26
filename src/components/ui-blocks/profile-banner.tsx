interface ProfileBannerProps {
    displayName: string;
    joinedDate: string;
    testsCount: number;
}

export const ProfileBanner = ({ displayName, joinedDate, testsCount }: ProfileBannerProps) => {
    return (
        <div className="bg-secondary/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6 relative overflow-hidden group">

            {/* Background sheen effect */}
            <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 z-10 text-center md:text-left w-full md:w-auto">
                <div className="relative">
                    <div className="w-24 h-24 md:w-20 md:h-20 rounded-full bg-secondary/50 flex items-center justify-center text-4xl md:text-3xl font-bold border-2 border-border/5 text-muted-foreground overflow-hidden shadow-inner ring-4 ring-background/50 md:ring-0">
                        <div className="font-bold text-primary opacity-80">{displayName.charAt(0).toUpperCase()}</div>
                    </div>
                </div>
                <div className="flex flex-col gap-1 items-center md:items-start">
                    <h1 className="text-3xl md:text-3xl font-bold tracking-tight">{displayName}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm md:text-xs text-muted-foreground bg-secondary/30 md:bg-transparent px-3 py-1 md:p-0 rounded-full md:rounded-none">
                        <span className="opacity-70">Joined {joinedDate}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center w-full md:w-auto gap-8 md:gap-12 z-10 border-t border-border/10 pt-6 md:pt-0 md:border-t-0 my-2 md:my-0">
                <div className="flex flex-col gap-1 items-center md:items-end">
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tests Started</span>
                    <span className="text-2xl md:text-3xl font-mono font-bold leading-none">{testsCount}</span>
                </div>
                <div className="w-px h-8 bg-border/20 md:hidden" /> {/* Mobile divider */}
                <div className="flex flex-col gap-1 items-center md:items-end">
                    <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tests Completed</span>
                    <span className="text-2xl md:text-3xl font-mono font-bold leading-none">{testsCount}</span>
                </div>
            </div>
        </div>
    );
};
