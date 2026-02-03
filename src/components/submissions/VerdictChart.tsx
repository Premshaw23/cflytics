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
        <Card className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-[32px] overflow-hidden shadow-2xl">
            <CardHeader className="pb-0 pt-8 border-b border-border/10 bg-muted/20">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pb-6 pl-2">Verdict Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[350px] w-full pt-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="45%"
                                innerRadius={70}
                                outerRadius={95}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.name)} className="transition-opacity duration-300 hover:opacity-80" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border) / 0.5)",
                                    borderRadius: "16px",
                                    padding: "10px 14px",
                                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)"
                                }}
                                itemStyle={{
                                    fontSize: "10px",
                                    fontWeight: "900",
                                    color: "hsl(var(--foreground))",
                                    textTransform: "uppercase"
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={80}
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{
                                    fontSize: "9px",
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    color: "hsl(var(--muted-foreground))",
                                    paddingBottom: "20px"
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
