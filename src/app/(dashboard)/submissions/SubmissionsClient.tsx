"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useUserData } from "@/lib/hooks/useUserData";
import { SubmissionsTable } from "@/components/submissions/SubmissionsTable";
import { VerdictChart } from "@/components/submissions/VerdictChart";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function SubmissionsClient() {
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

    if (!handle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h1 className="text-2xl font-bold">Search User Submissions</h1>
                <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
                    <Input
                        placeholder="Enter Codeforces Handle"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <Button type="submit">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </form>
            </div>
        );
    }

    if (userStatus.isLoading) {
        return <LoadingSpinner label={`Fetching submissions for ${handle}...`} />;
    }

    if (userStatus.isError) {
        return (
            <ErrorState
                title="Failed to fetch user"
                message="Could not find user or submissions. Please check the handle."
                onRetry={() => router.push("/submissions")}
            />
        );
    }

    const submissions = userStatus.data || [];

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Submissions: {handle}</h1>
                <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-xs">
                    <Input
                        placeholder="Search another user"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="h-9"
                    />
                    <Button type="submit" size="sm">Search</Button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{ac}</div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{acRate}%</div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Top Language</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate" title={topLang}>
                            {topLang}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <SubmissionsTable submissions={submissions} />
                </div>
                <div className="md:col-span-1">
                    <VerdictChart submissions={submissions} />
                </div>
            </div>
        </div>
    );
}
