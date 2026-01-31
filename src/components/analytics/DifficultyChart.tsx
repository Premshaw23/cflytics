"use client";

import { useMemo } from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatIST } from "@/lib/utils/date-utils";
import { CFSubmission } from "@/types";

interface DifficultyChartProps {
    submissions: CFSubmission[];
}

export function DifficultyChart({ submissions }: DifficultyChartProps) {
    const data = useMemo(() => {
        return submissions
            .filter(s => s.verdict === "OK" && s.problem.rating)
            .map(s => ({
                x: s.creationTimeSeconds * 1000,
                y: s.problem.rating || 0,
                name: `${s.problem.contestId}${s.problem.index} - ${s.problem.name}`,
                verdict: s.verdict
            }))
            .sort((a, b) => a.x - b.x);
    }, [submissions]);

    const maxRating = Math.max(...data.map(d => d.y), 0);
    const minRating = Math.min(...data.map(d => d.y), 800);

    return (
        <Card className="col-span-1 md:col-span-2 border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">Difficulty Progression</CardTitle>
                <CardDescription>Problems solved over time vs their difficulty rating</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="x"
                                domain={['auto', 'auto']}
                                name="Time"
                                tickFormatter={(unixTime) => formatIST(unixTime, 'MM/yyyy')}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                                type="number"
                            />
                            <YAxis
                                dataKey="y"
                                domain={[Math.floor(minRating / 100) * 100, Math.ceil(maxRating / 100) * 100]}
                                name="Rating"
                                unit=""
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        return (
                                            <div className="bg-popover border border-border rounded-md p-2 shadow-md">
                                                <p className="font-bold text-popover-foreground">{d.name}</p>
                                                <p className="text-sm text-popover-foreground">Rating: {d.y}</p>
                                                <p className="text-xs text-muted-foreground">{formatIST(d.x, 'dd/MM/yyyy')} IST</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Scatter name="Solved Problems" data={data} fill="hsl(var(--primary))" line />
                            {/* Optional: Reference line for max rating achieved */}
                            <ReferenceLine y={maxRating} label="Max Difficulty" stroke="red" strokeDasharray="3 3" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
