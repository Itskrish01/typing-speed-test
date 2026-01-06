import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    className?: string;
}

export const Checkbox = ({ checked, onChange, label, className }: CheckboxProps) => (
    <label
        className={cn(
            "flex items-center gap-2 cursor-pointer select-none text-sm text-muted-foreground",
            className
        )}
    >
        <div
            role="checkbox"
            aria-checked={checked}
            tabIndex={0}
            onClick={() => onChange(!checked)}
            onKeyDown={(e) => e.key === "Enter" && onChange(!checked)}
            className={cn(
                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                checked ? "bg-primary border-primary" : "border-border bg-input"
            )}
        >
            {checked && <Check size={12} className="text-primary-foreground" />}
        </div>
        <span onClick={() => onChange(!checked)}>{label}</span>
    </label>
);
