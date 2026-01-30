"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CFSubmission } from "@/types";

interface VerdictChartProps {
    submissions: CFSubmission[];
}

export function VerdictChart({ submissions }: VerdictChartProps) {
    const verdictCounts = submissions.reduce((acc, sub) => {
        const verdict = sub.verdict || "TESTING";
        acc[verdict] = (acc[verdict] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(verdictCounts).map(([name, value]) => ({
        name: name.replace(/_/g, " "),
        value,
    }));

    const COLORS = {
        OK: "#22c55e",
        WRONG_ANSWER: "#ef4444",
        TIME_LIMIT_EXCEEDED: "#eab308",
        MEMORY_LIMIT_EXCEEDED: "#f97316",
        "RUNTIME_ERROR": "#8b5cf6",
        "COMPILATION_ERROR": "#64748b",
    } as const;

    const getColor = (name: string) => {
        // @ts-ignore
        return COLORS[name.replace(/ /g, "_")] || "#94a3b8";
    };

    return (
        <Card className="h-full border-border/50">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Verdict Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                    color: "hsl(var(--foreground))"
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
