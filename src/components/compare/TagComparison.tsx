"use client";

import React, { useMemo } from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { CFSubmission } from '@/types';

interface TagComparisonProps {
    user1Handle: string;
    user2Handle: string;
    user1Submissions: CFSubmission[];
    user2Submissions: CFSubmission[];
}

const INTERESTING_TAGS = [
    "dp",
    "graphs",
    "math",
    "greedy",
    "data structures",
    "constructive algorithms",
    "implementation",
    "geometry",
    "strings",
    "number theory"
];

export function TagComparison({
    user1Handle,
    user2Handle,
    user1Submissions,
    user2Submissions
}: TagComparisonProps) {

    const processSubmissions = (submissions: CFSubmission[]) => {
        const solved = new Set<string>();
        const tagCounts: Record<string, number> = {};

        submissions.forEach(sub => {
            if (sub.verdict === "OK") {
                const key = `${sub.problem.contestId}-${sub.problem.index}`;
                if (!solved.has(key)) {
                    solved.add(key);
                    sub.problem.tags.forEach(tag => {
                        if (INTERESTING_TAGS.includes(tag)) {
                            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                        }
                    });
                }
            }
        });
        return tagCounts;
    };

    const data = useMemo(() => {
        const u1Tags = processSubmissions(user1Submissions);
        const u2Tags = processSubmissions(user2Submissions);

        return INTERESTING_TAGS.map(tag => ({
            subject: tag,
            A: u1Tags[tag] || 0,
            B: u2Tags[tag] || 0,
            fullMark: Math.max(...Object.values(u1Tags), ...Object.values(u2Tags)) * 1.1
        }));
    }, [user1Submissions, user2Submissions]);

    return (
        <Card className="border-border/50 col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="w-5 h-5 text-blue-500" /> Topic Strength (Solved Count)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar
                                name={user1Handle}
                                dataKey="A"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fill="#22c55e"
                                fillOpacity={0.3}
                            />
                            <Radar
                                name={user2Handle}
                                dataKey="B"
                                stroke="#ef4444"
                                strokeWidth={2}
                                fill="#ef4444"
                                fillOpacity={0.3}
                            />
                            <Legend />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    color: "hsl(var(--foreground))"
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
