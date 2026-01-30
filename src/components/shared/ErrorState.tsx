import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We encountered an error while fetching the data. Please try again.",
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <Card className={`border-destructive/20 bg-destructive/5 ${className}`}>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 rounded-full bg-destructive/10 p-3">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="mb-2 text-lg font-bold tracking-tight text-destructive">{title}</h3>
                <p className="mb-6 max-w-sm text-sm font-medium text-muted-foreground">
                    {message}
                </p>
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        variant="outline"
                        className="gap-2 font-bold border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                    >
                        <RefreshCw className="h-4 w-4" /> Try Again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
