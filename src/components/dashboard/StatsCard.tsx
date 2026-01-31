import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: React.ReactNode;
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
    // Map trendColor to a soft bg color for the glow
    const glowColor = {
        "text-green-500": "bg-green-500/5",
        "text-red-500": "bg-red-500/5",
        "text-blue-500": "bg-blue-500/5",
        "text-orange-500": "bg-orange-500/5",
        "text-purple-500": "bg-purple-500/5",
    }[trendColor] || "bg-primary/5";

    return (
        <Card className={cn("relative border-border/50 hover:border-primary/30 transition-all group overflow-hidden bg-card/50 backdrop-blur-sm", className)}>
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500", glowColor)} />

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300 shadow-inner")}>
                    <Icon className={cn("h-4 w-4 text-muted-foreground/80 group-hover:text-primary transition-colors")} />
                </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-2">
                <div className="text-3xl font-black tracking-tighter tabular-nums">{value}</div>
                {(trend || description) && (
                    <div className="flex flex-col gap-0.5 mt-2">
                        {trend && (
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", trendColor)}>
                                {trend}
                            </span>
                        )}
                        {description && (
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
