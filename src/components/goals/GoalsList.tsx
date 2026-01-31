"use client";

import { useEffect, useState, useCallback } from "react";
import { formatIST } from "@/lib/utils/date-utils";
import { Check, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types";
import { useAuth } from "@/lib/store/useAuth";
import { guestStorage } from "@/lib/storage/guest";

interface GoalsListProps {
    handle: string;
    refreshKey?: number; // Simple way to trigger refresh
}

export function GoalsList({ handle, refreshKey }: GoalsListProps) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const authStatus = useAuth((s) => s.status);
    const isConnected = authStatus === "connected";

    const fetchGoals = useCallback(async () => {
        try {
            if (isConnected) {
                const res = await fetch(`/api/goals`);
                const data = await res.json();
                if (data.goals) {
                    setGoals(data.goals);
                }
            } else {
                const items = handle ? guestStorage.goals.list(handle) : [];
                setGoals(
                    items.map((g) => ({
                        ...g,
                        userId: "guest",
                    }))
                );
            }
        } catch (err) {
            console.error("Failed to fetch goals", err);
        } finally {
            setLoading(false);
        }
    }, [handle, isConnected]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals, refreshKey]);

    const deleteGoal = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        if (isConnected) {
            await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
            fetchGoals();
        } else {
            if (!handle) return;
            guestStorage.goals.remove(handle, id);
            fetchGoals();
        }
    };

    const toggleComplete = async (goal: Goal) => {
        if (isConnected) {
            await fetch("/api/goals", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: goal.id,
                    completed: !goal.completed
                })
            });
            fetchGoals();
        } else {
            if (!handle) return;
            guestStorage.goals.update(handle, goal.id, { completed: !goal.completed });
            fetchGoals();
        }
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
                const isCompleted = goal.completed || progress >= 100;

                return (
                    <Card key={goal.id} className={`transition-all duration-300 relative overflow-hidden group border-zinc-200 dark:border-white/5 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl hover:border-zinc-300 dark:hover:border-white/10 ${isCompleted ? "border-green-500/20 bg-green-50/50 dark:bg-green-950/10" : ""}`}>
                        {/* Glow Effect */}
                        <div className={`absolute -right-10 -top-10 w-40 h-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${isCompleted ? 'bg-green-500' : 'bg-primary'}`} />

                        <CardHeader className="pb-3 relative z-10">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" className={`uppercase text-[10px] font-black tracking-widest py-0.5 px-2 border-zinc-200 dark:border-white/10 ${isCompleted ? "bg-green-500/10 text-green-600 dark:text-green-500" : "bg-primary/10 text-primary"}`}>
                                            {goal.type.replace("_", " ")}
                                        </Badge>
                                        {goal.deadline && (
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatIST(new Date(goal.deadline), "MMM dd")}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl font-black italic tracking-tight">
                                        {goal.target}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Target Value</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleComplete(goal)}
                                        className={`rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 ${goal.completed ? "text-green-600 dark:text-green-500 bg-green-500/10" : "text-muted-foreground hover:text-zinc-900 dark:hover:text-white"}`}
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteGoal(goal.id)}
                                        className="rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-600 dark:hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span className="text-zinc-400">Progress</span>
                                    <span className={isCompleted ? "text-green-600 dark:text-green-500" : "text-zinc-900 dark:text-white"}>
                                        {goal.current} / {goal.target} ({progress.toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-200 dark:border-white/5">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out rounded-full ${isCompleted ? 'bg-gradient-to-r from-green-600 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
