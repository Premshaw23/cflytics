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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
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
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.9)",
                            borderColor: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(12px)",
                            color: "#fff",
                            borderRadius: "12px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                            fontSize: "12px",
                            fontWeight: "bold",
                            textTransform: "uppercase"
                        }}
                        itemStyle={{ color: "#eab308" }}
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
