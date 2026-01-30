"use client";

import React, { PureComponent } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CFRatingChange } from '@/types';
import { getRatingColor } from '@/lib/utils/rating-colors';
import { format } from 'date-fns';

interface RatingGraphProps {
    data: CFRatingChange[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                <p className="font-bold text-sm mb-1">{data.contestName}</p>
                <div className="space-y-1 text-xs">
                    <p><span className="text-muted-foreground">Rating: </span><span className="font-bold">{data.newRating}</span></p>
                    <p><span className="text-muted-foreground">Rank: </span>{data.rank}</p>
                    <p><span className="text-muted-foreground">Change: </span>
                        <span className={data.newRating - data.oldRating >= 0 ? "text-green-500" : "text-red-500"}>
                            {data.newRating - data.oldRating >= 0 ? "+" : ""}{data.newRating - data.oldRating}
                        </span>
                    </p>
                    <p className="text-muted-foreground">{format(new Date(data.ratingUpdateTimeSeconds * 1000), 'MMM d, yyyy')}</p>
                </div>
            </div>
        );
    }
    return null;
};

export function RatingGraph({ data, isLoading }: RatingGraphProps) {
    if (isLoading) {
        return <div className="h-[350px] w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg"></div>;
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[350px] w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed text-muted-foreground">
                No rating history available
            </div>
        );
    }

    // Calculate domain for better visualization
    const ratings = data.map(d => d.newRating);
    const minRating = Math.min(...ratings, 1200); // Floor at 1200 normally
    const maxRating = Math.max(...ratings);
    const padding = 100;

    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 10,
                        left: -20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />

                    {/* Rating Color Zones */}
                    <ReferenceLine y={1200} stroke="#cccccc" strokeDasharray="3 3" />
                    <ReferenceLine y={1400} stroke="#77ff77" strokeDasharray="3 3" />
                    <ReferenceLine y={1600} stroke="#77ddff" strokeDasharray="3 3" />
                    <ReferenceLine y={1900} stroke="#aa00aa" strokeDasharray="3 3" />
                    <ReferenceLine y={2100} stroke="#ff8c00" strokeDasharray="3 3" />
                    <ReferenceLine y={2400} stroke="#ff0000" strokeDasharray="3 3" />

                    <XAxis
                        dataKey="ratingUpdateTimeSeconds"
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
                    <Line
                        type="monotone"
                        dataKey="newRating"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
