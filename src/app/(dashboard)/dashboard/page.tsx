"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import {
    BarChart as BarChartIcon,
    Users,
    CheckCircle2,
    Trophy,
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
import { GoalProgressSummary } from "@/components/dashboard/GoalProgressSummary";
import { TopicFocus } from "@/components/dashboard/TopicFocus";
import { StreakStats } from "@/components/dashboard/StreakStats";

const RatingProgressionChart = dynamic(() => import("@/components/dashboard/RatingProgressionChart").then(mod => mod.RatingProgressionChart), {
    ssr: false,
    loading: () => <SkeletonLoader className="h-full w-full" />
});

export default function DashboardOverview() {
    const [handle, setHandle] = useState<string | null>(null);

    useEffect(() => {
        // Try to get handle from localStorage first
        const saved = localStorage.getItem("codey_active_handle");
        setHandle(saved || "tourist");
    }, []);

    const { userInfo, userStatus, ratingHistory, isLoading } = useUserData({
        handle: handle || ""
    });

    if (userInfo.isError) {
        return <ErrorState onRetry={() => window.location.reload()} />;
    }

    const solvedCount = userStatus.data?.filter(s => s.verdict === "OK").length || 0;
    const currentRating = userInfo.data?.rating || 0;
    const maxRating = userInfo.data?.maxRating || 0;
    const rank = userInfo.data?.rank || "N/A";

    if (!handle) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard Overview</h1>
                    <p className="text-muted-foreground font-medium text-sm">
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
                            icon={BarChartIcon}
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
                <Card className="lg:col-span-4 border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
                        <CardTitle className="text-lg">Rating Progression</CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 px-2 font-bold text-xs" asChild>
                            <a href={`/profile/${handle}`}>
                                View Profile <ArrowUpRight className="ml-1 w-3 h-3" />
                            </a>
                        </Button>
                    </CardHeader>
                    <CardContent className="h-[350px] p-6">
                        {isLoading ? (
                            <SkeletonLoader className="h-full w-full" />
                        ) : (
                            <RatingProgressionChart history={ratingHistory.data || []} />
                        )}
                    </CardContent>
                </Card>

                <div className="lg:col-span-3 space-y-6">
                    <GoalProgressSummary handle={handle} />

                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Weak Topic Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <SkeletonLoader key={i} className="h-10 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <TopicFocus submissions={userStatus.data || []} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="bg-muted/20">
                        <CardTitle className="text-lg">Recent Solves</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
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

                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="bg-muted/20">
                        <CardTitle className="text-lg">Streak Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-4">
                                <SkeletonLoader className="h-24 w-full" />
                                <SkeletonLoader className="h-24 w-full" />
                                <SkeletonLoader className="h-10 col-span-2 w-full" />
                            </div>
                        ) : (
                            <StreakStats submissions={userStatus.data || []} />
                        )}
                        <div className="mt-6 text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
                            Solving problems consistently builds algorithmic muscle.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
