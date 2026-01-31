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

    const { userStatus } = useUserData({
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

    if (userStatus.isLoading) {
        return <LoadingSpinner label={`Analyzing data for ${handle}...`} />;
    }

    if (userStatus.isError) {
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
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Analytics: {handle}</h1>
                <Button variant="outline" onClick={() => router.push("/analytics")}>
                    Change User
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Key Metrics */}
                <Card className="md:col-span-3 border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-primary" /> Snapshot
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-3xl font-bold">{submissions.length}</div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wider">Total Submissions</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-500">{solved.length}</div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wider">Problems Solved</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-yellow-500">
                                {solved.length > 0
                                    ? (solved.reduce((acc, curr) => acc + (curr.problem.rating || 0), 0) / solved.length).toFixed(0)
                                    : 0}
                            </div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wider">Avg. Difficulty</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-500">
                                {solved.length > 0
                                    ? Math.max(...solved.map(s => s.problem.rating || 0))
                                    : 0}
                            </div>
                            <div className="text-sm text-muted-foreground uppercase tracking-wider">Max Difficulty</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Difficulty Progression - Main Chart */}
                <div className="md:col-span-2">
                    <DifficultyChart submissions={solved} />
                </div>

                {/* Activity by Time - Sidebar Chart */}
                <div className="md:col-span-1">
                    <TimeOfDayChart submissions={submissions} />
                </div>
            </div>
        </div>
    );
}
