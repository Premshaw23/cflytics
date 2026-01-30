"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    BarChart,
    TrendingUp,
    Users,
    CheckCircle2,
    Clock,
    Trophy,
    Zap,
    ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserSearch } from "@/components/dashboard/UserSearch";
import { useUserData } from "@/lib/hooks/useUserData";
import { LoadingSpinner, SkeletonLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";

export default function DashboardOverview() {
    const [handle, setHandle] = useState("tourist"); // Default to tourist for preview
    const { userInfo, userStatus, ratingHistory, isLoading } = useUserData({ handle });

    if (userInfo.isError) {
        return <ErrorState onRetry={() => window.location.reload()} />;
    }

    const solvedCount = userStatus.data?.filter(s => s.verdict === "OK").length || 0;
    const currentRating = userInfo.data?.rating || 0;
    const maxRating = userInfo.data?.maxRating || 0;
    const rank = userInfo.data?.rank || "N/A";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
                    <p className="text-muted-foreground font-medium">
                        Welcome back! Active analysis for <span className="text-primary font-bold">@{handle}</span>
                    </p>
                </div>
                <UserSearch className="md:max-w-xs" />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border-border/50 h-32">
                            <CardContent className="p-6 flex flex-col justify-between h-full">
                                <SkeletonLoader className="h-4 w-24" />
                                <SkeletonLoader className="h-8 w-16" />
                                <SkeletonLoader className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <>
                        <StatsCard
                            title="Problems Solved"
                            value={solvedCount}
                            icon={CheckCircle2}
                            trend="+12 this month"
                            trendColor="text-green-500"
                        />
                        <StatsCard
                            title="Current Rating"
                            value={currentRating}
                            icon={BarChart}
                            description={`Max: ${maxRating}`}
                            trend={rank.charAt(0).toUpperCase() + rank.slice(1)}
                            trendColor="text-blue-500"
                        />
                        <StatsCard
                            title="Contests"
                            value={ratingHistory.data?.length || 0}
                            icon={Trophy}
                            trend="Global Rank"
                            trendColor="text-purple-500"
                        />
                        <StatsCard
                            title="Friend of"
                            value={userInfo.data?.friendOfCount || 0}
                            icon={Users}
                            trend="In Codeforces"
                            trendColor="text-orange-500"
                        />
                    </>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Rating Progression</CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 px-2 font-bold text-xs">
                            View Analytics <ArrowUpRight className="ml-1 w-3 h-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 border-2 border-dashed rounded-lg m-4 opacity-50 overflow-hidden relative">
                        {isLoading ? (
                            <LoadingSpinner label="Generating your chart..." />
                        ) : (
                            <div className="text-center p-8">
                                <BarChart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-sm font-bold text-muted-foreground">Detailed Visualization Engine Initializing</p>
                                <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-widest leading-relaxed">
                                    Real Recharts integration scheduled for Week 6
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-border/50">
                    <CardHeader>
                        <CardTitle>Weak Topic Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <SkeletonLoader key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {[
                                    { tag: "Dynamic Programming", solveRate: 34, color: "bg-red-500" },
                                    { tag: "Graphs", solveRate: 48, color: "bg-orange-500" },
                                    { tag: "Math", solveRate: 72, color: "bg-green-500" },
                                    { tag: "Greedy", solveRate: 65, color: "bg-blue-500" },
                                ].map((topic, idx) => (
                                    <div key={idx} className="space-y-1.5 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                                            <span>{topic.tag}</span>
                                            <span className="text-muted-foreground">{topic.solveRate}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-1000", topic.color)}
                                                style={{ width: `${topic.solveRate}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full mt-4 font-bold text-xs uppercase tracking-widest">
                                    Personalize Training Plan
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>Recent Solves</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonLoader key={i} className="h-14 w-full" />)
                            ) : (
                                userStatus.data?.filter(s => s.verdict === "OK").slice(0, 5).map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-100/30 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-primary/10 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold group-hover:text-primary transition-colors truncate max-w-[150px] md:max-w-none">
                                                    {s.problem.name}
                                                </p>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                                    {s.problem.contestId}{s.problem.index} • Rating: {s.problem.rating || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-bold py-0 h-6 shrink-0">
                                            {new Date(s.creationTimeSeconds * 1000).toLocaleDateString()}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>Streak Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center opacity-50">
                        <div className="text-center">
                            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-sm font-bold text-muted-foreground">Heatmap Engine Loading</p>
                            <p className="text-xs text-muted-foreground/60 mt-1 uppercase tracking-widest">
                                Scheduled for Week 6 Implementation
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
