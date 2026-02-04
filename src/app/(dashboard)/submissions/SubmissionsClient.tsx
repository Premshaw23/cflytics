"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUserData } from "@/lib/hooks/useUserData";
import { SubmissionsTable } from "@/components/submissions/SubmissionsTable";
import { VerdictChart } from "@/components/submissions/VerdictChart";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Activity, CheckCircle2, Target, Code2, History, PieChart as PieChartIcon, RefreshCw } from "lucide-react";

export default function SubmissionsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlHandle = searchParams.get("handle");
    const problemId = searchParams.get("problemId") || searchParams.get("problemid");

    const [handle, setHandle] = useState<string | null>(urlHandle);
    const [searchInput, setSearchInput] = useState(urlHandle || "");
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!urlHandle) {
            const saved = localStorage.getItem("cflytics_active_handle");
            if (saved) {
                setHandle(saved);
                setSearchInput(saved);
                router.replace(`/submissions?handle=${saved}`);
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
            router.push(`/submissions?handle=${searchInput.trim()}`);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await userStatus.refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    if (!handle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                <div className="w-full max-w-2xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            <div className="relative bg-background border border-border/50 p-6 rounded-[32px] shadow-2xl">
                                <Search className="w-16 h-16 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">
                                Submission <span className="text-primary">Archive</span>
                            </h1>
                            <p className="text-muted-foreground font-medium text-sm uppercase tracking-[0.2em]">
                                Explore algorithmic performance metrics
                            </p>
                        </div>
                    </div>

                    <Card className="border-border/40 shadow-2xl bg-card/50 backdrop-blur-xl rounded-[40px] p-2">
                        <CardContent className="p-4">
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1 group">
                                    <Input
                                        placeholder="ENTER CODEFORCES HANDLE..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="h-16 pl-8 bg-transparent border-none rounded-[24px] text-xl font-bold tracking-tight focus-visible:ring-0 transition-all uppercase placeholder:text-muted-foreground/30 text-foreground"
                                    />
                                </div>
                                <Button type="submit" size="lg" className="h-16 px-10 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all">
                                    Analyze Feed
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Real-time Sync
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" /> Accuracy Stats
                        </div>
                        <div className="flex items-center gap-2">
                            <Code2 className="w-4 h-4" /> Language Insights
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (userStatus.isLoading) {
        return <LoadingSpinner label={`Decryption: ${handle}...`} />;
    }

    if (userStatus.isError) {
        return (
            <ErrorState
                title="USER NOT FOUND"
                message="The specified handle could not be located in the archive."
                onRetry={() => router.push("/submissions")}
            />
        );
    }

    const submissions = (userStatus.data || []).filter(s =>
        !problemId || `${s.contestId}${s.problem.index}`.toLowerCase() === problemId.toLowerCase()
    );

    // Calculate basic stats
    const total = submissions.length;
    const ac = submissions.filter(s => s.verdict === "OK").length;
    const acRate = total > 0 ? ((ac / total) * 100).toFixed(1) : "0.0";

    const langCounts = submissions.reduce((acc, sub) => {
        acc[sub.programmingLanguage] = (acc[sub.programmingLanguage] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-5">
                        <div className="w-2.5 h-14 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                        <div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-none">
                                {handle}
                            </h1>
                            <div className="flex items-center gap-3 mt-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                                    Archive Access
                                </span>
                                {problemId && (
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                        Problem: {problemId}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center p-1.5 bg-muted/30 border border-border/50 rounded-2xl gap-2">
                        {problemId && (
                            <Button asChild size="sm" className="h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                <Link href={`/compiler?problemId=${problemId}`}>
                                    <Code2 className="mr-2 h-3.5 w-3.5" /> IDE
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="ghost" size="sm" className="h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[10px]">
                            <Link href="/compiler/submissions">
                                <History className="mr-2 h-3.5 w-3.5" /> Local
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[10px]"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Sync
                        </Button>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                            <Input
                                placeholder="JUMP TO HANDLE..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="h-12 pl-10 pr-4 bg-background border-border/50 rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder:text-muted-foreground/30 focus-visible:ring-1 focus-visible:ring-primary/20 w-[200px] transition-all"
                            />
                        </div>
                        <Button type="submit" className="h-12 w-12 rounded-2xl" variant="secondary">
                            <Search className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Artifacts", value: total, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "Validated Solves", value: ac, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                    { label: "Efficiency Rating", value: `${acRate}%`, icon: Target, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                    { label: "Primary Protocol", value: topLang, icon: Code2, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                ].map((stat, i) => (
                    <Card key={i} className="relative overflow-hidden group border-border/40 bg-card/40 backdrop-blur-xl rounded-[20px] py-4 transition-all duration-500 hover:border-primary/30 hover:shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.border} border transition-transform duration-500 group-hover:scale-110`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-black tracking-tighter text-foreground group-hover:translate-x-1 transition-transform duration-500">
                                {stat.value}
                            </div>
                        </CardContent>
                        <div className={`absolute -right-10 -bottom-10 w-32 h-32 ${stat.bg} blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full`} />
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 relative items-start">
                <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-zinc-500" />
                            RECENT ACTIVITY
                        </h2>
                    </div>
                    <SubmissionsTable submissions={submissions} />
                </div>
                <div className="xl:col-span-1 space-y-6 sticky top-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-zinc-500" />
                            ANALYTICS
                        </h2>
                    </div>
                    <VerdictChart submissions={submissions} />
                </div>
            </div>
        </div>
    );
}
