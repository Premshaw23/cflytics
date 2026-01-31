"use client";

import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Zap,
    Target,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Lightbulb
} from "lucide-react";
import { CFSubmission, CFRatingChange } from "@/types";
import { cn } from "@/lib/utils";

interface AdvancedInsightsProps {
    submissions: CFSubmission[];
    ratingHistory: CFRatingChange[];
    currentRating?: number;
}

export function AdvancedInsights({ submissions, ratingHistory, currentRating = 0 }: AdvancedInsightsProps) {
    const insights = useMemo(() => {
        if (!submissions.length) return null;

        const solved = submissions.filter(s => s.verdict === "OK");
        const attempted = submissions.length;

        // 1. Weak Areas Identification
        const tagStats: Record<string, { total: number; solved: number }> = {};
        submissions.forEach(s => {
            s.problem.tags.forEach(tag => {
                if (!tagStats[tag]) tagStats[tag] = { total: 0, solved: 0 };
                tagStats[tag].total++;
                if (s.verdict === "OK") tagStats[tag].solved++;
            });
        });

        const weakAreas = Object.entries(tagStats)
            .filter(([_, stats]) => stats.total >= 5) // At least 5 attempts
            .map(([tag, stats]) => ({
                tag,
                accuracy: (stats.solved / stats.total) * 100,
                total: stats.total
            }))
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 3);

        // 2. Predictive Analytics - Rating Trend
        let ratingTrend = 0;
        if (ratingHistory.length >= 3) {
            const lastThree = ratingHistory.slice(-3);
            const deltaSum = lastThree.reduce((acc, curr) => acc + (curr.newRating - curr.oldRating), 0);
            ratingTrend = Math.round(deltaSum / 3);
        }

        // 3. Recommended Difficulty
        const avgSolvedRating = solved.length > 0
            ? solved.reduce((acc, curr) => acc + (curr.problem.rating || 0), 0) / solved.length
            : 0;
        const recommendedDifficulty = Math.round((currentRating || avgSolvedRating) + 100);

        return {
            weakAreas,
            ratingTrend,
            recommendedDifficulty,
            accuracy: (solved.length / attempted) * 100
        };
    }, [submissions, ratingHistory, currentRating]);

    if (!insights) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weak Areas & Suggestions */}
            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Topic Weaknesses
                    </CardTitle>
                    <CardDescription>
                        Based on your accuracy across different problem tags.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {insights.weakAreas.length > 0 ? (
                        <div className="space-y-4">
                            {insights.weakAreas.map((area, idx) => (
                                <div key={area.tag} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline" className="capitalize px-3 py-1 font-bold">
                                            {area.tag}
                                        </Badge>
                                        <span className="text-sm font-bold text-muted-foreground">
                                            {area.accuracy.toFixed(1)}% Accuracy
                                        </span>
                                    </div>
                                    <Progress value={area.accuracy} className="h-2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mb-2 opacity-50" />
                            <p className="text-sm text-muted-foreground font-medium">
                                No significant weak areas found yet. Keep solving!
                            </p>
                        </div>
                    )}

                    <div className="bg-primary/5 rounded-lg p-4 flex gap-3 border border-primary/10">
                        <Lightbulb className="w-5 h-5 text-primary shrink-0" />
                        <div className="text-sm">
                            <span className="font-bold block mb-1">Practice Strategy</span>
                            Focus on {insights.weakAreas[0]?.tag || 'new topics'} problems in the {insights.recommendedDifficulty - 200}-{insights.recommendedDifficulty} range.
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Insights & Projections */}
            <Card className="border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Performance Insights
                    </CardTitle>
                    <CardDescription>
                        Visualizing your growth and recommending next steps.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Rating Trend</span>
                            </div>
                            <div className={cn(
                                "text-2xl font-bold",
                                insights.ratingTrend > 0 ? "text-green-500" : insights.ratingTrend < 0 ? "text-red-500" : ""
                            )}>
                                {insights.ratingTrend > 0 ? "+" : ""}{insights.ratingTrend}
                                <span className="text-xs text-muted-foreground ml-1 font-normal">avg/contest</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                <Target className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Target Rating</span>
                            </div>
                            <div className="text-2xl font-bold">
                                {currentRating + 100}
                                <span className="text-xs text-muted-foreground ml-1 font-normal">Next Milestone</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-green-500/10 p-1 rounded">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-sm">
                                Your overall accuracy is <span className="font-bold">{insights.accuracy.toFixed(1)}%</span>.
                                {insights.accuracy > 40 ? " You're ready to tackle harder problems." : " Focus on accuracy before increasing difficulty."}
                            </p>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-primary/10 p-1 rounded">
                                <Target className="w-4 h-4 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    Based on your performance, you should aim for problems with rating around <span className="font-bold text-primary">{insights.recommendedDifficulty}</span>.
                                </p>
                                {insights.ratingTrend > 0 && (
                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span>Next Rank Elevation</span>
                                            <span className="text-primary">~{Math.ceil(100 / insights.ratingTrend)} contests</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-grow bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: '40%' }}></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimated</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
