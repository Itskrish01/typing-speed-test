interface ErrorMessageProps {
    message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => (
    <div className="flex items-center gap-2 text-destructive text-sm">
        <span>{message}</span>
    </div>
);
