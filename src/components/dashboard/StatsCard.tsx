import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: string;
    trendColor?: "text-green-500" | "text-red-500" | "text-blue-500" | "text-orange-500" | "text-purple-500";
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendColor = "text-green-500",
    className,
}: StatsCardProps) {
    return (
        <Card className={cn("border-border/50 hover:border-primary/20 transition-all group shadow-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary/10 transition-colors")}>
                    <Icon className={cn("h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors")} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {(trend || description) && (
                    <p className="text-xs mt-1.5 font-medium flex items-center gap-1.5">
                        {trend && <span className={trendColor}>{trend}</span>}
                        {description && <span className="text-muted-foreground">{description}</span>}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
