"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Flame, Target, Trophy, CheckCircle2 } from "lucide-react";
import { CFSubmission } from "@/types";
import { cn } from "@/lib/utils";

interface AchievementsProps {
    submissions: CFSubmission[];
    rating?: number;
    maxRating?: number;
}

export function Achievements({ submissions, rating = 0, maxRating = 0 }: AchievementsProps) {
    const solvedCount = useMemo(() =>
        new Set(submissions.filter(s => s.verdict === "OK").map(s => `${s.problem.contestId}-${s.problem.index}`)).size
        , [submissions]);

    const achievements = useMemo(() => {
        const list = [
            {
                id: "first-problem",
                title: "First Step",
                description: "Solved your first problem",
                icon: Star,
                earned: solvedCount >= 1,
                color: "text-amber-500",
                bg: "bg-amber-500/10"
            },
            {
                id: "centurion",
                title: "Centurion",
                description: "Solved 100+ problems",
                icon: Award,
                earned: solvedCount >= 100,
                color: "text-blue-500",
                bg: "bg-blue-500/10"
            },
            {
                id: "specialist",
                title: "Specialist Rank",
                description: "Reached 1400+ rating",
                icon: Target,
                earned: maxRating >= 1400,
                color: "text-cyan-500",
                bg: "bg-cyan-500/10"
            },
            {
                id: "expert",
                title: "Expert Rank",
                description: "Reached 1600+ rating",
                icon: Trophy,
                earned: maxRating >= 1600,
                color: "text-purple-500",
                bg: "bg-purple-500/10"
            },
            {
                id: "consistency",
                title: "Consistency",
                description: "Solved problems on 7+ consecutive days",
                icon: Flame,
                earned: false, // In a real app, this would be calculated from submission timestamps
                color: "text-orange-500",
                bg: "bg-orange-500/10"
            }
        ];

        return list;
    }, [solvedCount, maxRating]);

    const earnedCount = achievements.filter(a => a.earned).length;

    return (
        <Card className="bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-zinc-900 dark:text-white">
                    <Award className="w-5 h-5 text-primary" /> Achievements
                </CardTitle>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
                    {earnedCount} / {achievements.length}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                achievement.earned
                                    ? "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 shadow-sm"
                                    : "bg-zinc-100/50 dark:bg-white/5 border-dashed border-zinc-300 dark:border-white/10 opacity-60 grayscale"
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                achievement.earned ? achievement.bg : "bg-muted")}>
                                <achievement.icon className={cn("w-5 h-5", achievement.earned ? achievement.color : "text-muted-foreground")} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold truncate flex items-center gap-1.5">
                                    {achievement.title}
                                    {achievement.earned && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                </div>
                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                    {achievement.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
