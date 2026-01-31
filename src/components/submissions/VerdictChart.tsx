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
        <Card className="bg-white/40 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-0 border-b border-zinc-200 dark:border-white/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-4">Verdict Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} className="stroke-white dark:stroke-zinc-900 stroke-2" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--tooltip-bg, rgba(255, 255, 255, 0.95))", // Default light mode
                                    borderColor: "var(--tooltip-border, rgba(0,0,0,0.1))",
                                    borderRadius: "12px",
                                    color: "var(--tooltip-text, #000)",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)"
                                }}
                                itemStyle={{ color: "#71717a" }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: "#71717a",
                                    paddingTop: "20px"
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
