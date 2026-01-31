"use client";

import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/useUserData";
import { LoadingSpinner, SkeletonLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, TrendingUp, BarChart2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdvancedInsights } from "@/components/analytics/AdvancedInsights";

const TimeOfDayChart = dynamic(() => import("@/components/analytics/TimeOfDayChart").then(mod => mod.TimeOfDayChart), {
    loading: () => <SkeletonLoader className="h-[300px] w-full" />,
    ssr: false
});

const DifficultyChart = dynamic(() => import("@/components/analytics/DifficultyChart").then(mod => mod.DifficultyChart), {
    loading: () => <SkeletonLoader className="h-[350px] w-full" />,
    ssr: false
});

export default function AnalyticsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlHandle = searchParams.get("handle");

    const [handle, setHandle] = useState<string | null>(urlHandle);
    const [searchInput, setSearchInput] = useState(urlHandle || "");

    useEffect(() => {
        if (!urlHandle) {
            const saved = localStorage.getItem("codey_active_handle");
            if (saved) {
                setHandle(saved);
                setSearchInput(saved);
                router.replace(`/analytics?handle=${saved}`);
            }
        } else {
            setHandle(urlHandle);
            setSearchInput(urlHandle);
        }
    }, [urlHandle, router]);

    const { userStatus, userInfo, ratingHistory, isLoading } = useUserData({
        handle: handle || "",
        enabled: !!handle
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/analytics?handle=${searchInput.trim()}`);
        }
    };

    if (!handle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 justify-center">
                        <TrendingUp className="w-8 h-8 text-primary" /> Advanced Analytics
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Deep dive into your Codeforces performance with detailed charts and insights.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
                    <Input
                        placeholder="Enter Codeforces Handle"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="h-10"
                    />
                    <Button type="submit" size="lg">
                        <Search className="w-4 h-4 mr-2" />
                        Analyze
                    </Button>
                </form>
            </div>
        );
    }

    if (isLoading) {
        return <LoadingSpinner label={`Analyzing data for ${handle}...`} />;
    }

    if (userStatus.isError || userInfo.isError) {
        return (
            <ErrorState
                title="Analysis Failed"
                message="Could not fetch data for analysis. Please check the handle."
                onRetry={() => router.push("/analytics")}
            />
        );
    }

    const submissions = userStatus.data || [];
    const solved = submissions.filter(s => s.verdict === "OK");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Explorer</h1>
                    <p className="text-muted-foreground font-medium">Detailed performance breakdown for <span className="text-primary font-bold">{handle}</span></p>
                </div>
                <Button variant="outline" onClick={() => router.push("/analytics")} className="w-full md:w-auto">
                    Change User
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Key Metrics Snapshot */}
                <Card className="border-border/50 bg-card overflow-hidden">
                    <CardHeader className="bg-muted/50 py-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-primary" /> Performance Snapshot
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 text-center bg-card">
                        <div className="space-y-1">
                            <div className="text-3xl font-bold tracking-tight">{submissions.length}</div>
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Submissions</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold tracking-tight text-green-500">{solved.length}</div>
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Problems Solved</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold tracking-tight text-yellow-500">
                                {solved.length > 0
                                    ? (solved.reduce((acc, curr) => acc + (curr.problem.rating || 0), 0) / solved.length).toFixed(0)
                                    : 0}
                            </div>
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Avg. Difficulty</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-3xl font-bold tracking-tight text-blue-500">
                                {solved.length > 0
                                    ? Math.max(...solved.map(s => s.problem.rating || 0))
                                    : 0}
                            </div>
                            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Peak Difficulty</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Insights Section */}
                <AdvancedInsights
                    submissions={submissions}
                    ratingHistory={ratingHistory.data || []}
                    currentRating={userInfo.data?.rating}
                />

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <DifficultyChart submissions={solved} />
                    </div>
                    <div className="lg:col-span-1">
                        <TimeOfDayChart submissions={submissions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
