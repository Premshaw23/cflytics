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
            <div className="bg-popover/90 backdrop-blur-md border border-border p-3 rounded-xl shadow-2xl transition-all duration-300">
                <p className="text-muted-foreground text-[10px] mb-2 font-black uppercase tracking-[0.1em]">
                    {formatIST(label * 1000, 'dd MMM yyyy')}
                </p>
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-black text-primary text-lg">{payload[0].value}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Rating</span>
                </div>
                {payload[0].payload.rank && (
                    <div className="mt-1 text-[10px] font-bold text-primary/80 uppercase">
                        {payload[0].payload.rank}
                    </div>
                )}
            </div>
        );
    }
    return null;
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
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />

                {/* Rating Level Reference Lines */}
                <ReferenceLine y={1200} stroke="#808080" strokeDasharray="3 3" opacity={0.2} label={{ position: 'right', value: '1200', fill: '#808080', fontSize: 10 }} />
                <ReferenceLine y={1400} stroke="#008000" strokeDasharray="3 3" opacity={0.2} label={{ position: 'right', value: '1400', fill: '#008000', fontSize: 10 }} />
                <ReferenceLine y={1600} stroke="#03a89e" strokeDasharray="3 3" opacity={0.2} />
                <ReferenceLine y={1900} stroke="#aa00aa" strokeDasharray="3 3" opacity={0.2} label={{ position: 'right', value: '1900', fill: '#aa00aa', fontSize: 10 }} />
                <ReferenceLine y={2100} stroke="#ff8c00" strokeDasharray="3 3" opacity={0.2} />
                <ReferenceLine y={2400} stroke="#ff0000" strokeDasharray="3 3" opacity={0.2} label={{ position: 'right', value: '2400', fill: '#ff0000', fontSize: 10 }} />

                <XAxis
                    dataKey="ratingUpdateTimeSeconds"
                    tickFormatter={(unix) => formatIST(unix * 1000, 'yyyy')}
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    padding={{ left: 10, right: 10 }}
                />
                <YAxis
                    domain={[minRating - padding, maxRating + padding]}
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.toString()}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                    type="monotone"
                    dataKey="newRating"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRating)"
                    animationDuration={2500}
                    activeDot={{
                        r: 6,
                        fill: "hsl(var(--primary))",
                        strokeWidth: 2,
                        stroke: "white",
                        className: "shadow-xl"
                    }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
