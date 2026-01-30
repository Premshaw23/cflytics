"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, Trash2, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@prisma/client";

interface GoalsListProps {
    handle: string;
    refreshKey?: number; // Simple way to trigger refresh
}

export function GoalsList({ handle, refreshKey }: GoalsListProps) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGoals();
    }, [handle, refreshKey]);

    const fetchGoals = async () => {
        try {
            const res = await fetch(`/api/goals?handle=${handle}`);
            const data = await res.json();
            if (data.goals) {
                setGoals(data.goals);
            }
        } catch (err) {
            console.error("Failed to fetch goals", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteGoal = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
        fetchGoals();
    };

    const toggleComplete = async (goal: Goal) => {
        await fetch("/api/goals", {
            method: "PUT",
            body: JSON.stringify({
                id: goal.id,
                completed: !goal.completed
            })
        });
        fetchGoals();
    };

    if (loading) return <div>Loading goals...</div>;

    if (goals.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                No goals set yet for {handle}. Start by creating one!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {goals.map((goal) => {
                const progress = Math.min(100, Math.max(0, (goal.current / goal.target) * 100));

                return (
                    <Card key={goal.id} className={`transition-all ${goal.completed ? "border-green-500/50 bg-green-500/5" : ""}`}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={goal.completed ? "default" : "outline"} className={goal.completed ? "bg-green-500 hover:bg-green-600" : ""}>
                                            {goal.type.replace("_", " ")}
                                        </Badge>
                                        {goal.deadline && (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Defore {format(new Date(goal.deadline), "MMM d, yyyy")}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">
                                        Target: {goal.target}
                                    </CardTitle>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleComplete(goal)}
                                        className={goal.completed ? "text-green-500" : "text-muted-foreground"}
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteGoal(goal.id)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-sm text-muted-foreground">Progress: {goal.current} / {goal.target}</span>
                                    <span className="text-sm font-bold">{progress.toFixed(0)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
