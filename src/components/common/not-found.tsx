interface NotFoundProps {
    title?: string;
    message?: string;
}

export const NotFound = ({ title = "404", message = "Not found" }: NotFoundProps) => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{message}</p>
        </div>
    </div>
);
