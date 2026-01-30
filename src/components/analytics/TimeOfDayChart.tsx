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

interface TimeOfDayChartProps {
    submissions: CFSubmission[];
}

export function TimeOfDayChart({ submissions }: TimeOfDayChartProps) {
    const data = useMemo(() => {
        const hours = Array(24).fill(0);

        submissions.forEach(sub => {
            // creationTimeSeconds is unix timestamp
            const date = new Date(sub.creationTimeSeconds * 1000);
            const hour = date.getHours();
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
        <Card className="col-span-1 border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">Activity by Time of Day</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis
                                dataKey="hour"
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--muted)/0.5' }}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                    color: "hsl(var(--foreground))"
                                }}
                            />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${0.3 + (entry.count / Math.max(...data.map(d => d.count))) * 0.7})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
