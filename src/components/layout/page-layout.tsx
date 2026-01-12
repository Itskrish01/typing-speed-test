import { cn } from "@/lib/utils";

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

import { Header } from "@/components/ui-blocks/header";
import { ThemeFooter } from "@/components/ui-blocks/theme-footer";

export const PageLayout = ({ children, className }: PageLayoutProps) => {
    return (
        <div className="min-h-screen w-full bg-background flex flex-col items-center transition-colors duration-300">
            <div className={cn(
                "w-full max-w-350 px-4 md:px-6 lg:px-8 flex flex-col flex-1",
                className
            )}>
                <Header />
                <main className="flex-1 w-full flex flex-col">
                    {children}
                </main>
                <ThemeFooter />
            </div>
        </div>
    );
};

interface ContentContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const ContentContainer = ({ children, className }: ContentContainerProps) => {
    return (
        <div className={cn("w-full", className)}>
            {children}
        </div>
    );
};
