"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserData } from "@/lib/hooks/useUserData";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { RatingGraph } from "@/components/profile/RatingGraph";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { TopicAnalysis } from "@/components/profile/TopicAnalysis";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { BarChart, Info, Trophy } from "lucide-react";
import { Achievements } from "@/components/profile/Achievements";
import { AdvancedInsights } from "@/components/analytics/AdvancedInsights";

export default function ProfilePage() {
    const params = useParams();
    const handle = params.handle as string;
    const { userInfo, userStatus, ratingHistory, isLoading } = useUserData({ handle });

    if (userInfo.isError || (!isLoading && !userInfo.data)) {
        return (
            <ErrorState
                title="User not found"
                message={`We couldn't find a Codeforces user with handle "${handle}".`}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <ProfileHeader user={userInfo.data} isLoading={isLoading} />

            {/* Stats Grid */}
            <ProfileStats
                user={userInfo.data}
                submissions={userStatus.data}
                isLoading={isLoading}
            />

            {/* Activity Heatmap */}
            <ActivityHeatmap
                submissions={userStatus.data || []}
                isLoading={isLoading}
            />

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="w-5 h-5" /> Rating History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] p-6">
                        <RatingGraph data={ratingHistory.data || []} isLoading={isLoading} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5" /> Strongest Topics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] p-6">
                        <TopicAnalysis submissions={userStatus.data || []} isLoading={isLoading} />
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Achievements & Insights */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Achievements
                        submissions={userStatus.data || []}
                        rating={userInfo.data?.rating}
                        maxRating={userInfo.data?.maxRating}
                    />
                </div>
                <div className="lg:col-span-2">
                    <AdvancedInsights
                        submissions={userStatus.data || []}
                        ratingHistory={ratingHistory.data || []}
                        currentRating={userInfo.data?.rating}
                    />
                </div>
            </div>
        </div>
    );
}
