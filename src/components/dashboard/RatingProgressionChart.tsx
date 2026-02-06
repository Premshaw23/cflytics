"use client";

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { LineChart } from 'lucide-react';
import { CFRatingChange } from '@/types';
import { formatIST } from '@/lib/utils/date-utils';

interface RatingProgressionChartProps {
    history: CFRatingChange[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-xl shadow-2xl transition-all duration-300">
                <p className="text-muted-foreground text-[10px] mb-2 font-black uppercase tracking-[0.1em]">
                    {formatIST(label * 1000, 'dd MMM yyyy')}
                </p>
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-black text-foreground text-lg">{payload[0].value}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Rating</span>
                </div>
                {payload[0].payload.rank && (
                    <div className="mt-1 text-[10px] font-bold text-muted-foreground uppercase">
                        {payload[0].payload.rank}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const CustomLabel = ({ viewBox, value }: any) => {
    const { x, y, width } = viewBox;
    return (
        <text
            x={x + width}
            y={y}
            fill="hsl(var(--muted-foreground))"
            fontSize={10}
            fontWeight="bold"
            textAnchor="end"
            dx={-10}
            dy={4}
        >
            {value}
        </text>
    );
};

export function RatingProgressionChart({ history, isLoading }: RatingProgressionChartProps) {
    if (isLoading) {
        return <div className="h-full w-full animate-pulse bg-muted/20 rounded-xl"></div>;
    }

    if (!history?.length) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground text-sm font-bold border-2 border-dashed rounded-xl opacity-30 gap-2">
                <LineChart className="w-8 h-8" />
                No rating history available
            </div>
        );
    }

    const ratings = history.map(h => h.newRating);
    const minRating = Math.min(...ratings, 1200);
    const maxRating = Math.max(...ratings);
    const padding = 150;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={history}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />

                {/* Rating Level Reference Lines */}
                {/* <ReferenceLine y={1200} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.3} label={<CustomLabel value="1200" />} />
                <ReferenceLine y={1400} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.3} label={<CustomLabel value="1400" />} />
                <ReferenceLine y={1600} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.3} label={<CustomLabel value="1600" />} />
                <ReferenceLine y={1900} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.3} label={<CustomLabel value="1900" />} />
                <ReferenceLine y={2100} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.3} label={<CustomLabel value="2100" />} />
                <ReferenceLine y={2400} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.3} label={<CustomLabel value="2400" />} /> */}

                <XAxis
                    dataKey="ratingUpdateTimeSeconds"
                    tickFormatter={(unix) => formatIST(unix * 1000, 'yyyy')}
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                    tickLine={false}
                    axisLine={false}
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    padding={{ left: 10, right: 10 }}
                />
                <YAxis
                    domain={[minRating - padding, maxRating + padding]}
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.toString()}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgb(16, 185, 129)', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <Area
                    type="monotone"
                    dataKey="newRating"
                    stroke="rgb(16, 185, 129)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRating)"
                    animationDuration={2500}
                    activeDot={{
                        r: 6,
                        fill: "rgb(16, 185, 129)",
                        strokeWidth: 2,
                        stroke: "hsl(var(--background))",
                        className: "shadow-xl"
                    }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
