"use client";

import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/useUserData";
import { LoadingSpinner, SkeletonLoader } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, TrendingUp, BarChart2, CheckCircle2, Trophy, Brain, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdvancedInsights } from "@/components/analytics/AdvancedInsights";
import { StatsCard } from "@/components/dashboard/StatsCard";

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
            <div className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />

                <div className="relative z-10 w-full max-w-lg space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-2xl mb-4 group">
                            <TrendingUp className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-white/60">
                            ANALYTICS HUB
                        </h1>
                        <p className="text-lg text-muted-foreground/80 font-medium">
                            Unlock deep insights into your competitive programming journey.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/50 to-purple-600/50 opacity-20 group-hover:opacity-40 blur transition duration-500" />
                        <div className="relative flex items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-xl p-1.5 shadow-2xl">
                            <Search className="w-5 h-5 text-muted-foreground ml-3" />
                            <Input
                                placeholder="Enter Codeforces Handle..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="h-12 border-none bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground/50"
                            />
                            <Button type="submit" size="lg" className="h-10 px-6 font-bold uppercase tracking-wide rounded-lg">
                                Analyze
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <LoadingSpinner label={`Crunching data for ${handle}...`} />;
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
    const avgDifficulty = solved.length > 0
        ? (solved.reduce((acc, curr) => acc + (curr.problem.rating || 0), 0) / solved.length).toFixed(0)
        : 0;
    const maxDifficulty = solved.length > 0
        ? Math.max(...solved.map(s => s.problem.rating || 0))
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight uppercase">
                        Analytics <span className="text-primary">//</span> Explorer
                    </h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        Insights for <span className="text-zinc-900 dark:text-white font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/10">{handle}</span>
                    </p>
                </div>
                <form onSubmit={handleSearch} className="flex gap-3 w-full max-w-sm">
                    <Input
                        placeholder="ANALYZE ANOTHER USER..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="h-12 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 rounded-xl text-xs font-black uppercase tracking-widest placeholder:text-zinc-500 dark:placeholder:text-zinc-700 focus:border-zinc-300 dark:focus:border-white/10 text-zinc-900 dark:text-white"
                    />
                    <Button type="submit" className="h-12 w-12 rounded-xl p-0" variant="secondary">
                        <Search className="w-4 h-4" />
                    </Button>
                </form>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Submissions"
                    value={submissions.length}
                    icon={BarChart2}
                    description="Lifetime attempts"
                    trendColor="text-blue-500"
                />
                <StatsCard
                    title="Problems Solved"
                    value={solved.length}
                    icon={CheckCircle2}
                    description={`Success Rate: ${submissions.length > 0 ? ((solved.length / submissions.length) * 100).toFixed(1) : 0}%`}
                    trendColor="text-green-500"
                />
                <StatsCard
                    title="Avg. Difficulty"
                    value={avgDifficulty}
                    icon={Brain}
                    description="Based on solved problems"
                    trendColor="text-orange-500"
                />
                <StatsCard
                    title="Peak Difficulty"
                    value={maxDifficulty}
                    icon={Trophy}
                    description="Hardest problem cracked"
                    trendColor="text-purple-500"
                />
            </div>

            {/* Advanced Insights Section */}
            <AdvancedInsights
                submissions={submissions}
                ratingHistory={ratingHistory.data || []}
                currentRating={userInfo.data?.rating}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <Card className="bg-white/40 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-xl overflow-hidden h-full">
                        <CardHeader className="border-b border-zinc-200 dark:border-white/5 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" /> Difficulty Progression
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <DifficultyChart submissions={solved} />
                        </CardContent>
                    </Card>
                </div>
                <div className="xl:col-span-1 space-y-6">
                    <Card className="bg-white/40 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-xl overflow-hidden h-full">
                        <CardHeader className="border-b border-zinc-200 dark:border-white/5 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" /> Hourly Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <TimeOfDayChart submissions={submissions} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
