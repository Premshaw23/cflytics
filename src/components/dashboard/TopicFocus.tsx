"use client";

import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Info } from 'lucide-react';
import { CFSubmission } from '@/types';
import { Button } from "@/components/ui/button";

interface TopicFocusProps {
    submissions: CFSubmission[];
    isLoading?: boolean;
}

export function TopicFocus({ submissions, isLoading }: TopicFocusProps) {
    const topicStats = useMemo(() => {
        if (!submissions || submissions.length === 0) return [];

        const stats: Record<string, { total: number; ok: number }> = {};

        submissions.forEach(sub => {
            sub.problem.tags.forEach(tag => {
                if (!stats[tag]) stats[tag] = { total: 0, ok: 0 };
                stats[tag].total += 1;
                if (sub.verdict === "OK") stats[tag].ok += 1;
            });
        });

        return Object.entries(stats)
            .map(([tag, { total, ok }]) => ({
                tag,
                total,
                ok,
                solveRate: Math.round((ok / total) * 100)
            }))
            .filter(s => s.total >= 3) // Only consider topics with at least 3 attempts
            .sort((a, b) => a.solveRate - b.solveRate) // Show lowest solve rate first
            .slice(0, 4); // Top 4 "weak" topics
    }, [submissions]);

    if (topicStats.length === 0 && !isLoading) {
        return (
            <div className="text-center py-6 text-muted-foreground text-xs font-medium border border-dashed rounded-lg">
                Not enough submission data to analyze weak topics.
            </div>
        );
    }

    const getColor = (rate: number) => {
        if (rate < 40) return "bg-red-500";
        if (rate < 60) return "bg-orange-500";
        if (rate < 80) return "bg-blue-500";
        return "bg-green-500";
    };

    return (
        <div className="space-y-4">
            {topicStats.map((topic, idx) => (
                <div key={idx} className="space-y-1.5 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="truncate max-w-[150px]">{topic.tag}</span>
                        <span className="text-muted-foreground">{topic.solveRate}% Accuracy</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className={cn("h-full transition-all duration-1000", getColor(topic.solveRate))}
                            style={{ width: `${topic.solveRate}%` }}
                        />
                    </div>
                </div>
            ))}
            <Button variant="outline" className="w-full mt-2 font-bold text-xs uppercase tracking-widest h-8" size="sm" asChild>
                <a href="/problems">Explore Problems</a>
            </Button>
        </div>
    );
}
