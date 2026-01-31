"use client";

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { CFRatingChange } from '@/types';
import { formatIST } from '@/lib/utils/date-utils';

interface RatingProgressionChartProps {
    history: CFRatingChange[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                <p className="text-muted-foreground text-[10px] mb-2 font-bold uppercase tracking-wider">
                    {formatIST(label * 1000, 'dd/MM/yyyy')} IST
                </p>
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-primary">{payload[0].value}</span>
                    <span className="text-xs text-muted-foreground">Rating</span>
                </div>
            </div>
        );
    }
    return null;
};

export function RatingProgressionChart({ history, isLoading }: RatingProgressionChartProps) {
    if (isLoading) {
        return <div className="h-full w-full animate-pulse bg-muted/20 rounded-lg"></div>;
    }

    if (!history?.length) {
        return (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm font-medium border-2 border-dashed rounded-lg opacity-50">
                No rating data found for this user
            </div>
        );
    }

    const ratings = history.map(h => h.newRating);
    const minRating = Math.min(...ratings, 1200);
    const maxRating = Math.max(...ratings);
    const padding = 100;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={history}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />

                <ReferenceLine y={1200} stroke="#cccccc" strokeDasharray="3 3" />
                <ReferenceLine y={1400} stroke="#77ff77" strokeDasharray="3 3" />
                <ReferenceLine y={1600} stroke="#77ddff" strokeDasharray="3 3" />
                <ReferenceLine y={1900} stroke="#aa00aa" strokeDasharray="3 3" />
                <ReferenceLine y={2100} stroke="#ff8c00" strokeDasharray="3 3" />
                <ReferenceLine y={2400} stroke="#ff0000" strokeDasharray="3 3" />

                <XAxis
                    dataKey="ratingUpdateTimeSeconds"
                    tickFormatter={(unix) => formatIST(unix * 1000, 'yyyy')}
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    type="number"
                    domain={['dataMin', 'dataMax']}
                />
                <YAxis
                    domain={[minRating - padding, maxRating + padding]}
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                    type="monotone"
                    dataKey="newRating"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "white" }}
                    animationDuration={2000}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
