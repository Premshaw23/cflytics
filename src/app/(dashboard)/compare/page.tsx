"use client";

import React, { useState } from "react";
import { CompareSearch } from "@/components/compare/CompareSearch";
import { ComparisonView } from "@/components/compare/ComparisonView";
import { useUserData } from "@/lib/hooks/useUserData";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";

export default function ComparePage() {
    const [handles, setHandles] = useState<{ h1: string; h2: string } | null>(null);

    // Fetch data for both users if handles are set
    const user1 = useUserData({ handle: handles?.h1 || "", enabled: !!handles });
    const user2 = useUserData({ handle: handles?.h2 || "", enabled: !!handles });

    const handleCompare = (h1: string, h2: string) => {
        setHandles({ h1, h2 });
    };

    if (!handles) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <CompareSearch onCompare={handleCompare} />
            </div>
        );
    }

    const isLoading = user1.isLoading || user2.isLoading;
    const isError = user1.userInfo.isError || user2.userInfo.isError;

    if (isError) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Compare Users</h1>
                    <button onClick={() => setHandles(null)} className="text-sm text-primary font-bold hover:underline">
                        New Comparison
                    </button>
                </div>
                <ErrorState
                    title="Comparison Failed"
                    message="Could not fetch data for one or both users. Please check the handles and try again."
                    onRetry={() => setHandles(null)}
                />
            </div>
        );
    }

    if (isLoading || !user1.userInfo.data || !user2.userInfo.data) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <LoadingSpinner label={`Comparing ${handles.h1} vs ${handles.h2}...`} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Head-to-Head</h1>
                <button
                    onClick={() => setHandles(null)}
                    className="text-sm text-primary font-bold hover:underline"
                >
                    New Comparison
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Vitals */}
                <div className="lg:col-span-1">
                    <ComparisonView
                        user1={user1.userInfo.data}
                        user2={user2.userInfo.data}
                        user1Submissions={user1.userStatus.data}
                        user2Submissions={user2.userStatus.data}
                    />
                </div>

                {/* Right Column: Graphs/Charts (Placeholder for now) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="p-8 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30 h-full">
                        <p className="text-muted-foreground font-medium">Common Contests & Rating Graph Comparison (Coming Soon)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
