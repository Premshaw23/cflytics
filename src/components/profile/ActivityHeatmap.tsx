"use client";

import React, { useMemo, useState } from "react";
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, getDay } from "date-fns";
import { CFSubmission } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "lucide-react";
import { SkeletonLoader } from "@/components/shared/LoadingSpinner";

interface ActivityHeatmapProps {
    submissions: CFSubmission[];
    isLoading: boolean;
}

export function ActivityHeatmap({ submissions, isLoading }: ActivityHeatmapProps) {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Process data: aggregate submissions by date
    const activityData = useMemo(() => {
        if (!submissions) return {};

        const counts: Record<string, number> = {};
        submissions.forEach(sub => {
            const date = format(new Date(sub.creationTimeSeconds * 1000), 'yyyy-MM-dd');
            counts[date] = (counts[date] || 0) + 1;
        });

        return counts;
    }, [submissions]);

    // Generate calendar grid for the last 365 days (or until today)
    const today = new Date();
    const daysToRender = 365;
    const startDate = subDays(today, daysToRender);

    // Create weeks array for rendering
    const weeks = useMemo(() => {
        const days = eachDayOfInterval({ start: startDate, end: today });
        const weeks: Date[][] = [];
        let currentWeek: Date[] = [];

        days.forEach((day, index) => {
            if (index === 0 || getDay(day) === 0) { // Start new week on Sunday
                if (currentWeek.length > 0) weeks.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(day);
        });
        if (currentWeek.length > 0) weeks.push(currentWeek);

        return weeks;
    }, [startDate, today]);

    const getActivityLevel = (count: number) => {
        if (count === 0) return "bg-zinc-100 dark:bg-zinc-800/50";
        if (count <= 2) return "bg-green-200 dark:bg-green-900";
        if (count <= 5) return "bg-green-400 dark:bg-green-700";
        if (count <= 10) return "bg-green-600 dark:bg-green-500";
        return "bg-green-800 dark:bg-green-400";
    };

    if (isLoading) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[140px] w-full flex gap-1 overflow-hidden">
                        {Array.from({ length: 52 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                {Array.from({ length: 7 }).map((_, j) => (
                                    <SkeletonLoader key={j} className="w-3 h-3 rounded-sm" />
                                ))}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Submissions Activity
                    </CardTitle>
                    <div className="text-sm text-muted-foreground font-medium">
                        {submissions?.length || 0} submissions in total
                    </div>
                </div>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-6">
                <div className="min-w-[700px]">
                    <div className="flex gap-1 justify-end">
                        {weeks.map((week, wIdx) => (
                            <div key={wIdx} className="flex flex-col gap-1">
                                {week.map((day, dIdx) => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const count = activityData[dateStr] || 0;
                                    return (
                                        <TooltipProvider key={dateStr}>
                                            <Tooltip delayDuration={50}>
                                                <TooltipTrigger>
                                                    <div
                                                        className={`w-3 h-3 rounded-sm transition-colors hover:ring-1 hover:ring-ring hover:ring-offset-1 ${getActivityLevel(count)}`}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs">
                                                    <span className="font-bold">{count} submissions</span> on {format(day, 'MMM d, yyyy')}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground font-medium justify-end">
                        <span>Less</span>
                        <div className="w-3 h-3 rounded-sm bg-zinc-100 dark:bg-zinc-800/50" />
                        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                        <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
                        <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-400" />
                        <span>More</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
