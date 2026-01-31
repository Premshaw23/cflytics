"use client";

import React from "react";
import {
    Trophy,
    Target,
    Zap,
    BarChart,
    Clock
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CFUser, CFSubmission } from "@/types";
import { SkeletonLoader } from "@/components/shared/LoadingSpinner";
import { formatIST } from "@/lib/utils/date-utils";

interface ProfileStatsProps {
    user?: CFUser;
    submissions?: CFSubmission[];
    isLoading: boolean;
}

export function ProfileStats({ user, submissions, isLoading }: ProfileStatsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 rounded-xl border border-border/50 bg-card p-6">
                        <SkeletonLoader className="h-4 w-24 mb-4" />
                        <SkeletonLoader className="h-8 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    const solvedCount = submissions?.filter(s => s.verdict === "OK").length || 0;
    // Unique problems logic could be added here

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Current Rating"
                value={user?.rating || 0}
                icon={BarChart}
                description={`Max: ${user?.maxRating || 0} (${user?.maxRank})`}
                trendColor="text-blue-500"
            />
            <StatsCard
                title="Total Solved"
                value={solvedCount}
                icon={Target}
                description="All time submissions"
                trendColor="text-green-500"
            />
            <StatsCard
                title="Last Visit"
                value={user?.lastOnlineTimeSeconds ? formatIST(user.lastOnlineTimeSeconds * 1000, "dd/MM/yyyy") : "N/A"}
                icon={Clock}
                description="Last online"
                trendColor="text-orange-500"
            />
            <StatsCard
                title="Contribution"
                value={user?.contribution || 0}
                icon={Zap}
                description="Community score"
                trendColor={user?.contribution && user.contribution >= 0 ? "text-green-500" : "text-red-500"}
            />
        </div>
    );
}
