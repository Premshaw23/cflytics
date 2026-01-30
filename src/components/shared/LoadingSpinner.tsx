import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: number;
    label?: string;
}

export function LoadingSpinner({
    className,
    size = 24,
    label
}: LoadingSpinnerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 p-4", className)}>
            <Loader2 className="animate-spin text-primary" size={size} />
            {label && <p className="text-sm font-medium text-muted-foreground animate-pulse">{label}</p>}
        </div>
    );
}

export function SkeletonLoader({ className }: { className?: string }) {
    return (
        <div className={cn("animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800", className)} />
    );
}
