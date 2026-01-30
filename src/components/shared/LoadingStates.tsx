import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, size = 24 }: { className?: string; size?: number }) {
    return (
        <div className={cn("flex items-center justify-center p-4", className)}>
            <Loader2 className="animate-spin text-primary" size={size} />
        </div>
    );
}

export function LoadingPage() {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size={40} />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading amazing insights...</p>
            </div>
        </div>
    );
}
