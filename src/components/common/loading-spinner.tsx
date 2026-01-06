interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
};

export const LoadingSpinner = ({ size = "md", fullScreen = false }: LoadingSpinnerProps) => {
    const spinner = (
        <div
            className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`}
        />
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                {spinner}
            </div>
        );
    }

    return spinner;
};
