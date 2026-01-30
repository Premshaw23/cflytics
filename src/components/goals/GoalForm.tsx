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
import { Goal } from "@prisma/client";
import { Loader2 } from "lucide-react";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    handle,
                    type,
                    target: parseInt(target),
                    deadline: deadline || undefined
                })
            });

            if (!response.ok) {
                throw new Error("Failed to create goal");
            }

            setTarget("");
            setDeadline("");
            onGoalCreated();
        } catch (err) {
            setError("Failed to create goal. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Set New Goal</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Goal Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RATING">Rating Target</SelectItem>
                                <SelectItem value="PROBLEMS_SOLVED">Problems Solved</SelectItem>
                                <SelectItem value="CONTEST_RANK">Contest Rank</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Target Value</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 1500"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Deadline (Optional)</Label>
                        <Input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create Goal
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
