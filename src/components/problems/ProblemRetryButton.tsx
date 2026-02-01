"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemRetryButtonProps {
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    label?: string;
}

export function ProblemRetryButton({
    className,
    variant = "outline",
    size = "default",
    label = "Retry Fetch"
}: ProblemRetryButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRetry = () => {
        startTransition(() => {
            // Add retry=true to URL and a timestamp to bust any browser/Next.js client cache
            const url = new URL(window.location.href);
            url.searchParams.set("retry", "true");
            url.searchParams.set("_t", Date.now().toString());
            router.push(url.toString());
        });
    };

    return (
        <Button
            onClick={handleRetry}
            disabled={isPending}
            variant={variant}
            size={size}
            className={cn("gap-2 font-bold", className)}
        >
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
            {isPending ? "Retrying..." : label}
        </Button>
    );
}
