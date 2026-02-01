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
            const saved = localStorage.getItem("codey_active_handle");
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <Search className="w-24 h-24 text-zinc-900 dark:text-white relative z-10" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">SUBMISSION ANALYZER</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Enter a handle to explore performance metrics</p>
                </div>
                <form onSubmit={handleSearch} className="flex gap-4 w-full max-w-md">
                    <div className="relative flex-1 group">
                        <Input
                            placeholder="CODEFORCES HANDLE"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="h-14 pl-6 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 rounded-2xl text-lg font-bold tracking-tight focus:ring-primary/50 focus:border-primary/50 transition-all uppercase placeholder:text-zinc-400 dark:placeholder:text-zinc-700 text-zinc-900 dark:text-white"
                        />
                    </div>
                    <Button type="submit" size="lg" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest">
                        Analyze
                    </Button>
                </form>
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
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                        <h1 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase transition-all">
                            {handle}
                        </h1>
                    </div>
                    <p className="text-zinc-500 font-bold text-sm max-w-2xl leading-relaxed uppercase tracking-widest pl-5">
                        {problemId ? `Submissions for Problem ${problemId}` : 'Submission Archive & Performance Analytics'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {problemId && (
                        <Button asChild size="lg" className="h-12 px-6 rounded-xl font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                            <Link href={`/compiler?problemId=${problemId}`}>
                                <Code2 className="mr-2 h-4 w-4" />
                                Open IDE
                            </Link>
                        </Button>
                    )}
                    <Button asChild size="lg" className="h-12 px-6 rounded-xl font-black uppercase tracking-widest" variant="outline">
                        <Link href="/compiler/submissions">
                            <History className="mr-2 h-4 w-4" />
                            Local Archive
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        className="h-12 px-6 rounded-xl font-black uppercase tracking-widest"
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Verify
                    </Button>
                    <form onSubmit={handleSearch} className="flex gap-3 w-full max-w-sm">
                        <Input
                            placeholder="SEARCH USER..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="h-12 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 rounded-xl text-xs font-black uppercase tracking-widest placeholder:text-zinc-500 dark:placeholder:text-zinc-700 focus:border-zinc-300 dark:focus:border-white/10 text-zinc-900 dark:text-white"
                        />
                        <Button type="submit" className="h-12 w-12 rounded-xl p-0" variant="secondary">
                            <Search className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Submissions", value: total, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "Accepted", value: ac, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
                    { label: "Accuracy", value: `${acRate}%`, icon: Target, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                    { label: "Top Language", value: topLang, icon: Code2, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                ].map((stat, i) => (
                    <Card key={i} className={`bg-white/40 dark:bg-zinc-900/40 border-zinc-200 dark:border-white/5 backdrop-blur-xl transition-all duration-300 hover:border-zinc-300 dark:hover:border-white/10 group overflow-hidden`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                {stat.label}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:scale-105 transition-transform duration-300 truncate`}>
                                {stat.value}
                            </div>
                        </CardContent>
                        {/* Glow Effect */}
                        <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${stat.bg} blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-full`} />
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
