"use client";

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    TooltipProps
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CFRatingChange } from '@/types';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface RatingComparisonGraphProps {
    user1Handle: string;
    user2Handle: string;
    user1History: CFRatingChange[];
    user2History: CFRatingChange[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                <p className="text-muted-foreground text-[10px] mb-2 font-bold uppercase tracking-wider">
                    {format(new Date(label * 1000), 'MMM d, yyyy')}
                </p>

                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="font-bold">{entry.name}:</span>
                        <span className="text-primary">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function RatingComparisonGraph({
    user1Handle,
    user2Handle,
    user1History,
    user2History,
    isLoading
}: RatingComparisonGraphProps) {

    if (isLoading) {
        return <div className="h-[350px] w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg"></div>;
    }

    if ((!user1History?.length && !user2History?.length)) {
        return (
            <div className="h-[350px] w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed text-muted-foreground">
                No rating history available for comparison
            </div>
        );
    }

    // We need to merge data points for the customized tooltip to work perfectly with XAxis,
    // BUT separate lines work fine with time scale axis.
    // Recharts with type="number" and scale="time" on XAxis handles disjointed data points well.
    // We just need to ensure the data prop passed to LineChart is empty or combined, OR pass individual data to Lines.

    // Strategy: Create a combined domain.
    // Actually, passing data individually to Line components is tricky in Recharts if they don't share x-values.
    // Better strategy: Create a unified array of all time points, filling in nulls? No, Recharts 'connectNulls' can map.
    // Simplest for Recharts with multiple series on time axis: 
    // Just use one data array containing all events, with fields for user1Rating and user2Rating.

    // 1. Collect all unique time points
    const allPoints: Record<number, { time: number, [key: string]: number | undefined }> = {};

    user1History?.forEach(h => {
        if (!allPoints[h.ratingUpdateTimeSeconds]) {
            allPoints[h.ratingUpdateTimeSeconds] = { time: h.ratingUpdateTimeSeconds };
        }
        allPoints[h.ratingUpdateTimeSeconds][user1Handle] = h.newRating;
    });

    user2History?.forEach(h => {
        if (!allPoints[h.ratingUpdateTimeSeconds]) {
            allPoints[h.ratingUpdateTimeSeconds] = { time: h.ratingUpdateTimeSeconds };
        }
        allPoints[h.ratingUpdateTimeSeconds][user2Handle] = h.newRating;
    });

    const chartData = Object.values(allPoints).sort((a, b) => a.time - b.time);

    // Calculate domain
    const ratings = [
        ...(user1History?.map(d => d.newRating) || []),
        ...(user2History?.map(d => d.newRating) || [])
    ];
    const minRating = Math.min(...ratings, 1200);
    const maxRating = Math.max(...ratings);
    const padding = 100;

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Rating Trajectory
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] p-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />

                        <ReferenceLine y={1200} stroke="#cccccc" strokeDasharray="3 3" />
                        <ReferenceLine y={1400} stroke="#77ff77" strokeDasharray="3 3" />
                        <ReferenceLine y={1600} stroke="#77ddff" strokeDasharray="3 3" />
                        <ReferenceLine y={1900} stroke="#aa00aa" strokeDasharray="3 3" />
                        <ReferenceLine y={2100} stroke="#ff8c00" strokeDasharray="3 3" />
                        <ReferenceLine y={2400} stroke="#ff0000" strokeDasharray="3 3" />

                        <XAxis
                            dataKey="time"
                            tickFormatter={(unix) => format(new Date(unix * 1000), 'yyyy')}
                            stroke="var(--muted-foreground)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            scale="time"
                        />
                        <YAxis
                            domain={[minRating - padding, maxRating + padding]}
                            stroke="var(--muted-foreground)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        <Line
                            name={user1Handle}
                            type="monotone"
                            dataKey={user1Handle}
                            stroke="#2563eb" // Blue for User 1
                            strokeWidth={2}
                            dot={false}
                            connectNulls // Critical to connect points across gaps
                            activeDot={{ r: 6 }}
                            animationDuration={1500}
                        />
                        <Line
                            name={user2Handle}
                            type="monotone"
                            dataKey={user2Handle}
                            stroke="#dc2626" // Red for User 2
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                            activeDot={{ r: 6 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
