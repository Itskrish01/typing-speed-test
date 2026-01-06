import { cn } from "@/lib/utils";

interface AuthInputProps {
    id: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoComplete?: string;
    className?: string;
}

export const AuthInput = ({
    id,
    type,
    placeholder,
    value,
    onChange,
    autoComplete,
    className,
}: AuthInputProps) => (
    <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={cn(
            "w-full h-9 px-2 rounded-md bg-input/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
            className
        )}
    />
);
