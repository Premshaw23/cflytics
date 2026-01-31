"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalsList } from "@/components/goals/GoalsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Set Your Goals</h1>
                    <p className="text-muted-foreground">Track your progress and achieve milestones.</p>
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
                        Start Tracking
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Goals for {handle}</h1>
                <Button variant="outline" onClick={() => router.push("/goals")}>
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
