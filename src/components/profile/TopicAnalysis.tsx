"use client";

import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CFSubmission } from '@/types';
import { Info } from 'lucide-react';
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface TopicAnalysisProps {
    submissions: CFSubmission[];
    isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                <p className="font-bold text-sm mb-1 capitalize">{label}</p>
                <p className="text-xs">
                    <span className="text-muted-foreground">Solved: </span>
                    <span className="font-bold">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

export function TopicAnalysis({ submissions, isLoading }: TopicAnalysisProps) {
    const data = useMemo(() => {
        if (!submissions) return [];

        const tagCounts: Record<string, number> = {};
        const processedProblems = new Set<string>(); // To avoid double counting same problem

        submissions.forEach(sub => {
            // Only count accepted solutions
            if (sub.verdict !== "OK") return;

            const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
            if (processedProblems.has(problemId)) return;
            processedProblems.add(problemId);

            sub.problem.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 tags
    }, [submissions]);

    if (isLoading) {
        return (
            <div className="min-h-[350px] flex items-center justify-center">
                <LoadingSpinner label="Analyzing topics..." />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="min-h-[350px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                No solved problems data available
            </div>
        );
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 5,
                        right: 30,
                        left: 40,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" opacity={0.4} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip cursor={{ fill: 'var(--accent)', opacity: 0.2 }} content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="hsl(var(--primary))" opacity={0.8 + (index * 0.02)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
