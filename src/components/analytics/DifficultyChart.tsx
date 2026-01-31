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
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="x"
                        domain={['auto', 'auto']}
                        name="Time"
                        tickFormatter={(unixTime) => formatIST(unixTime, 'MMM yy')}
                        tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}
                        axisLine={false}
                        tickLine={false}
                        type="number"
                        dy={10}
                    />
                    <YAxis
                        dataKey="y"
                        domain={[Math.floor(minRating / 100) * 100, Math.ceil(maxRating / 100) * 100]}
                        name="Rating"
                        unit=""
                        tick={{ fill: '#71717a', fontSize: 11, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-black/90 border border-white/10 backdrop-blur-xl rounded-xl p-4 shadow-2xl">
                                        <p className="font-black text-xs uppercase tracking-wider text-white mb-2">{d.name}</p>
                                        <div className="flex justify-between items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-zinc-500">Rating</span>
                                                <span className="text-xl font-black text-cyan-400">{d.y}</span>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <span className="text-[10px] uppercase font-bold text-zinc-500">Date</span>
                                                <span className="text-xs font-bold text-zinc-300">{formatIST(d.x, 'MMM dd, yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Scatter name="Solved Problems" data={data} fill="#22d3ee" fillOpacity={1} shape="circle" />
                    <ReferenceLine y={maxRating} stroke="#10b981" strokeDasharray="3 3" opacity={0.5}>
                        <text x="100%" y={maxRating} dy={-10} textAnchor="end" fill="#10b981" fontSize={10} fontWeight="bold" letterSpacing="0.1em">MAX RATING</text>
                    </ReferenceLine>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
