"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/store/useAuth";
import { guestStorage, type GuestGoalType } from "@/lib/storage/guest";

interface GoalFormProps {
    handle: string;
    onGoalCreated: () => void;
}

export function GoalForm({ handle, onGoalCreated }: GoalFormProps) {
    const [type, setType] = useState<string>("RATING");
    const [target, setTarget] = useState<string>("");
    const [deadline, setDeadline] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const authStatus = useAuth((s) => s.status);
    const isConnected = authStatus === "connected";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isConnected) {
                const response = await fetch("/api/goals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type,
                        target: parseInt(target),
                        deadline: deadline || undefined
                    })
                });

                if (!response.ok) {
                    throw new Error("Failed to create goal");
                }
            } else {
                if (!handle) throw new Error("No handle set");
                guestStorage.goals.create(handle, {
                    type: type as GuestGoalType,
                    target: parseInt(target),
                    deadline: deadline ? new Date(deadline).toISOString() : null,
                });
            }

            setTarget("");
            setDeadline("");
            onGoalCreated();
        } catch {
            setError("Failed to create goal. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full bg-white/80 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <CardHeader className="relative">
                <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-white/60 font-black uppercase tracking-wider flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5">
                        <Loader2 className="w-4 h-4 text-primary animate-spin-slow" />
                    </div>
                    Set New Goal
                </CardTitle>
            </CardHeader>
            <CardContent className="relative">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-zinc-500 tracking-wider">Goal Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 h-10">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10">
                                <SelectItem value="RATING">Rating Target</SelectItem>
                                <SelectItem value="PROBLEMS_SOLVED">Problems Solved</SelectItem>
                                <SelectItem value="CONTEST_RANK">Contest Rank</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-zinc-500 tracking-wider">Target Value</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 1500"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            required
                            className="bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 h-10 focus-visible:ring-primary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-zinc-500 tracking-wider">Deadline (Optional)</Label>
                        <Input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 h-10 w-full block focus-visible:ring-primary/50"
                        />
                    </div>

                    {error && <p className="text-sm font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full h-11 font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Create Goal"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
