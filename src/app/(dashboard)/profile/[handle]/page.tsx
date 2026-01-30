"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserData } from "@/lib/hooks/useUserData";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { RatingGraph } from "@/components/profile/RatingGraph";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { BarChart, Info } from "lucide-react";

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

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="w-5 h-5" /> Rating History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] p-6">
                        <RatingGraph data={ratingHistory.data || []} isLoading={isLoading} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5" /> Weak Topics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="min-h-[350px] flex items-center justify-center border-2 border-dashed rounded-lg m-4 opacity-50 bg-zinc-50/50 dark:bg-zinc-900/50">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <div className="text-center">
                                <p className="font-bold text-muted-foreground">Topic Analysis</p>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground/70 mt-1">Coming Next</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
