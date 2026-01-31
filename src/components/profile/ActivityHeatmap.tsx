"use client";

import React, { useMemo, useState } from "react";
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, getDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { CFSubmission } from "@/types";
import { formatIST } from "@/lib/utils/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "lucide-react";
import { SkeletonLoader } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
    submissions: CFSubmission[];
    isLoading: boolean;
}

export function ActivityHeatmap({ submissions, isLoading }: ActivityHeatmapProps) {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Compute years available (assuming from current year back to 2010 or based on first submission)
    const years = useMemo(() => {
        if (!submissions || submissions.length === 0) return [new Date().getFullYear()];
        const firstYear = new Date(submissions[submissions.length - 1].creationTimeSeconds * 1000).getFullYear();
        const currentYear = new Date().getFullYear();
        const y = [];
        for (let i = currentYear; i >= firstYear; i--) y.push(i);
        return y;
    }, [submissions]);

    // Aggregate data for the selected year
    const { activityData, maxStreak, totalActiveDays, maxSubmissionsInDay } = useMemo(() => {
        if (!submissions) return { activityData: {}, maxStreak: 0, totalActiveDays: 0, maxSubmissionsInDay: 0 };

        const counts: Record<string, number> = {};
        let maxSub = 0;

        // Filter submissions for selected year
        submissions.forEach(sub => {
            const date = new Date(sub.creationTimeSeconds * 1000);
            if (date.getFullYear() === selectedYear) {
                const dateStr = format(date, 'yyyy-MM-dd');
                counts[dateStr] = (counts[dateStr] || 0) + 1;
                maxSub = Math.max(maxSub, counts[dateStr]);
            }
        });

        const activeDays = Object.keys(counts).length;

        // Calculate max streak (simple)
        let currentStreak = 0;
        let bestStreak = 0;
        const daysInYear = eachDayOfInterval({
            start: new Date(selectedYear, 0, 1),
            end: new Date(selectedYear, 11, 31)
        });

        daysInYear.forEach(day => {
            const dStr = format(day, 'yyyy-MM-dd');
            if (counts[dStr]) {
                currentStreak++;
            } else {
                bestStreak = Math.max(bestStreak, currentStreak);
                currentStreak = 0;
            }
        });
        bestStreak = Math.max(bestStreak, currentStreak);

        return { activityData: counts, maxStreak: bestStreak, totalActiveDays: activeDays, maxSubmissionsInDay: maxSub };
    }, [submissions, selectedYear]);

    // Generate data grouped by month for the new layout
    const montlyData = useMemo(() => {
        const months = [];
        for (let m = 0; m < 12; m++) {
            const firstDayOfMonth = new Date(selectedYear, m, 1);
            const lastDayOfMonth = new Date(selectedYear, m + 1, 0); // Last day of current month

            // Generate weeks for this specific month
            // We want full vertical columns (Mon-Sun), but only filling days that belong to this month.
            // Start from the Sunday (or first day of week) on or before the 1st
            const startDay = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // Sunday start
            const endDay = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });

            const daysInMonthView = eachDayOfInterval({ start: startDay, end: endDay });

            const weeks: Date[][] = [];
            let currentWeek: Date[] = [];

            daysInMonthView.forEach((day, idx) => {
                if (idx > 0 && idx % 7 === 0) {
                    weeks.push(currentWeek);
                    currentWeek = [];
                }
                currentWeek.push(day);
            });
            if (currentWeek.length > 0) weeks.push(currentWeek);

            months.push({
                monthIndex: m,
                name: format(firstDayOfMonth, 'MMM'),
                weeks: weeks
            });
        }
        return months;
    }, [selectedYear]);

    const getActivityColor = (count: number) => {
        if (count === 0) return "bg-zinc-900";
        // Scale based on max submissions slightly, or fixed thresholds
        if (count <= 2) return "bg-emerald-900/40 opacity-100 ring-1 ring-emerald-500/30";
        if (count <= 5) return "bg-emerald-600/40 opacity-100 ring-1 ring-emerald-500/50";
        if (count <= 8) return "bg-emerald-500/60 opacity-100 ring-1 ring-emerald-400/60";
        return "bg-emerald-400 opacity-100 shadow-[0_0_10px_rgba(52,211,153,0.5)]";
    };

    if (isLoading) return <SkeletonLoader className="h-[300px] w-full rounded-[24px]" />;

    return (
        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden group">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-white/5 bg-white/[0.01]">
                {/* ... Header Content ... */}
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-widest text-white">
                        <Calendar className="w-5 h-5 text-emerald-500" />
                        Code Frequency
                    </CardTitle>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        {totalActiveDays} Active Days in {selectedYear} • Max Streak: {maxStreak}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {years.map(y => (
                        <button
                            key={y}
                            onClick={() => setSelectedYear(y)}
                            className={cn(
                                "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                selectedYear === y
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                                    : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
                            )}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="relative w-full overflow-hidden">
                    {/* Scroll fade masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none md:hidden" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none md:hidden" />

                    <div className="overflow-x-auto pb-4 pt-4 px-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                        <div className="min-w-max">
                            <div className="flex items-start gap-4">
                                {/* Labels Column */}
                                <div className="flex flex-col gap-[1.5px] mt-[1.5rem] mr-2 text-[9px] text-zinc-600 font-bold uppercase justify-between h-[6.5rem]">
                                    <span>Sun</span>
                                    <span>Mon</span>
                                    <span>Tue</span>
                                    <span>Wed</span>
                                    <span>Thu</span>
                                    <span>Fri</span>
                                    <span>Sat</span>
                                </div>

                                {/* Months Container */}
                                <div className="flex gap-4">
                                    {montlyData.map((month) => (
                                        <div key={month.name} className="flex flex-col gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 pl-[2px]">{month.name}</span>
                                            <div className="flex gap-[3px]">
                                                {month.weeks.map((week, wIdx) => (
                                                    <div key={wIdx} className="flex flex-col gap-[3px]">
                                                        {week.map((day, dIdx) => {
                                                            const dateStr = format(day, 'yyyy-MM-dd');
                                                            const count = activityData[dateStr] || 0;
                                                            const isCurrentMonth = day.getMonth() === month.monthIndex;

                                                            // If day is not in the current month rendering block, render transparent placeholder
                                                            // This maintains the grid structure but "breaks" visual connection
                                                            if (!isCurrentMonth) {
                                                                return <div key={dateStr} className="w-3 h-3 bg-transparent" />;
                                                            }

                                                            return (
                                                                <TooltipProvider key={dateStr}>
                                                                    <Tooltip delayDuration={0}>
                                                                        <TooltipTrigger asChild>
                                                                            <div
                                                                                className={cn(
                                                                                    "w-3 h-3 rounded-[2px] transition-all duration-200 hover:ring-1 hover:ring-white/50 cursor-pointer",
                                                                                    getActivityColor(count)
                                                                                )}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent
                                                                            side="top"
                                                                            className="bg-zinc-900/90 border-white/10 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xl p-2"
                                                                        >
                                                                            <span className="text-emerald-400">{count} submissions</span>
                                                                            <span className="text-zinc-500 block">{formatIST(day, "MMM dd, yyyy")}</span>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Less</span>
                    <div className="flex gap-1">
                        {[0, 2, 5, 8, 12].map((level, i) => (
                            <div key={i} className={cn("w-3 h-3 rounded-[2px] border", getActivityColor(level))} />
                        ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">More</span>
                </div>
            </CardContent>
        </Card>
    );
}
