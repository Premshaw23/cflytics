"use client";

import React, { useMemo } from 'react';
import { CFSubmission } from '@/types';
import { Flame, Calendar, Trophy, Zap } from 'lucide-react';

interface StreakStatsProps {
    submissions: CFSubmission[];
    isLoading?: boolean;
}

export function StreakStats({ submissions, isLoading }: StreakStatsProps) {
    const streaks = useMemo(() => {
        if (!submissions || submissions.length === 0) return { current: 0, longest: 0 };

        const solveDates = new Set<string>();
        submissions.forEach(sub => {
            if (sub.verdict === "OK") {
                const date = new Date(sub.creationTimeSeconds * 1000).toDateString();
                solveDates.add(date);
            }
        });

        const sortedDates = Array.from(solveDates).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

        if (sortedDates.length === 0) return { current: 0, longest: 0 };

        // Current Streak
        let current = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let checkDate = new Date(today);

        // If they solved today or yesterday, the streak is alive
        const hasToday = solveDates.has(today.toDateString());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const hasYesterday = solveDates.has(yesterday.toDateString());

        if (hasToday || hasYesterday) {
            if (!hasToday) checkDate = yesterday;

            while (solveDates.has(checkDate.toDateString())) {
                current++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        // Longest Streak
        let longest = 0;
        let tempLongest = 0;
        const allDatesSorted = Array.from(solveDates).map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());

        if (allDatesSorted.length > 0) {
            tempLongest = 1;
            longest = 1;
            for (let i = 1; i < allDatesSorted.length; i++) {
                const diffTime = Math.abs(allDatesSorted[i].getTime() - allDatesSorted[i - 1].getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempLongest++;
                } else if (diffDays > 1) {
                    longest = Math.max(longest, tempLongest);
                    tempLongest = 1;
                }
            }
            longest = Math.max(longest, tempLongest);
        }

        return { current, longest };
    }, [submissions]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex flex-col items-center justify-center text-center space-y-2 group hover:bg-primary/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Flame className={`w-6 h-6 text-orange-500 ${streaks.current > 0 ? 'animate-bounce' : 'opacity-40'}`} />
                </div>
                <div>
                    <div className="text-2xl font-black text-orange-500">{streaks.current}</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Days Streak</div>
                </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex flex-col items-center justify-center text-center space-y-2 group hover:bg-primary/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <div className="text-2xl font-black text-blue-500">{streaks.longest}</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Longest Streak</div>
                </div>
            </div>

            <div className="col-span-2 p-3 bg-muted/40 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Solving Speed</span>
                </div>
                <span className="text-xs font-bold">{submissions.filter(s => s.verdict === "OK").length > 0 ? (submissions.filter(s => s.verdict === "OK").length / 30).toFixed(1) : 0} problems/day (avg)</span>
            </div>
        </div>
    );
}
