"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CFSubmission } from "@/types";
import { toZonedTime } from "date-fns-tz";

interface TimeOfDayChartProps {
    submissions: CFSubmission[];
}

export function TimeOfDayChart({ submissions }: TimeOfDayChartProps) {
    const data = useMemo(() => {
        const hours = Array(24).fill(0);

        submissions.forEach(sub => {
            // creationTimeSeconds is unix timestamp
            const date = new Date(sub.creationTimeSeconds * 1000);
            const zonedDate = toZonedTime(date, "Asia/Kolkata");
            const hour = zonedDate.getHours();
            hours[hour]++;
        });

        return hours.map((count, hour) => ({
            hour: `${hour}:00`,
            count,
            // Color gradient logic could go here, or just static color
        }));
    }, [submissions]);

    // Find max for scaling if needed, but Recharts handles auto domain well.

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <defs>
                        <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="hour"
                        tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}
                        axisLine={false}
                        tickLine={false}
                        interval={2}
                    />
                    <YAxis
                        tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--border))', opacity: 0.15 }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white/95 dark:bg-black/90 border border-zinc-200 dark:border-white/10 backdrop-blur-xl rounded-xl p-3 shadow-2xl">
                                        <p className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white mb-1">
                                            {payload[0].payload.hour}
                                        </p>
                                        <div className="text-2xl font-black text-yellow-500">
                                            {payload[0].value} <span className="text-xs font-bold text-zinc-500 uppercase">Submissions</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="count" fill="url(#colorHour)" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fillOpacity={1} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
