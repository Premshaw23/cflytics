"use client";

import { useEffect, useState } from "react";
import { Goal } from "@prisma/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SkeletonLoader } from "@/components/shared/LoadingSpinner";

export function GoalProgressSummary({ handle }: { handle: string }) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await fetch(`/api/goals?handle=${handle}`);
                const data = await res.json();
                if (data.goals) {
                    // Show only active/incomplete goals on dashboard
                    setGoals(data.goals.filter((g: Goal) => !g.completed).slice(0, 3));
                }
            } catch (err) {
                console.error("Failed to fetch goals for dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        if (handle) fetchGoals();
    }, [handle]);

    if (loading) {
        return (
            <Card className="border-border/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" /> Active Goals
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SkeletonLoader className="h-4 w-full" />
                    <SkeletonLoader className="h-4 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (goals.length === 0) return null;

    return (
        <Card className="border-border/50">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Active Goals
                </CardTitle>
                <Link href={`/goals?handle=${handle}`} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                {goals.map((goal) => {
                    const progress = Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
                    return (
                        <div key={goal.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                                <span className="text-muted-foreground truncate max-w-[120px]">
                                    {goal.type.replace("_", " ")}
                                </span>
                                <span>{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                            <div className="text-[9px] text-muted-foreground">
                                {goal.current} / {goal.target}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
