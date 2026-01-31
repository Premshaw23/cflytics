"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalsList } from "@/components/goals/GoalsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Target, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function GoalsClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlHandle = searchParams.get("handle");

    const [handle, setHandle] = useState<string | null>(urlHandle);
    const [searchInput, setSearchInput] = useState(urlHandle || "");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!urlHandle) {
            const saved = localStorage.getItem("codey_active_handle");
            if (saved) {
                setHandle(saved);
                setSearchInput(saved);
                router.replace(`/goals?handle=${saved}`);
            }
        } else {
            setHandle(urlHandle);
            setSearchInput(urlHandle);
        }
    }, [urlHandle, router]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            router.push(`/goals?handle=${searchInput.trim()}`);
        }
    };

    const onGoalCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    if (!handle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />

                <div className="relative z-10 w-full max-w-lg space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-2xl mb-4 group">
                            <Target className="w-10 h-10 text-emerald-500 group-hover:rotate-45 transition-transform duration-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-500 dark:from-white dark:to-white/60">
                            GOAL TRACKER
                        </h1>
                        <p className="text-lg text-muted-foreground/80 font-medium">
                            Set ambitious targets and shatter your limits.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500/50 to-teal-600/50 opacity-20 group-hover:opacity-40 blur transition duration-500" />
                        <div className="relative flex items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-xl p-1.5 shadow-2xl">
                            <Search className="w-5 h-5 text-muted-foreground ml-3" />
                            <Input
                                placeholder="Enter Codeforces Handle..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="h-12 border-none bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground/50"
                            />
                            <Button type="submit" size="lg" className="h-10 px-6 font-bold uppercase tracking-wide rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">
                                Start
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight uppercase">
                        Active <span className="text-emerald-500">//</span> Goals
                    </h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        Tracking for <span className="text-zinc-900 dark:text-white font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/10">{handle}</span>
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push("/goals")} className="w-full md:w-auto border-dashed hover:border-solid">
                    Change User
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Create Goal Form */}
                <div className="md:col-span-1">
                    <GoalForm handle={handle} onGoalCreated={onGoalCreated} />
                </div>

                {/* Right Column: Goals List */}
                <div className="md:col-span-2">
                    <GoalsList handle={handle} refreshKey={refreshKey} />
                </div>
            </div>
        </div>
    );
}
