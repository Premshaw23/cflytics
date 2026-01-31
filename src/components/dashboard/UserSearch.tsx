"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, History, TrendingUp, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserSearch({ className }: { className?: string }) {
    const [handle, setHandle] = useState("");
    const [mounted, setMounted] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem("codey_recent_searches");
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
        setMounted(true);
    }, []);

    const saveSearch = (searchHandle: string) => {
        const updated = [
            searchHandle,
            ...recentSearches.filter((s) => s.toLowerCase() !== searchHandle.toLowerCase()),
        ].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("codey_recent_searches", JSON.stringify(updated));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (handle.trim()) {
            saveSearch(handle.trim());
            router.push(`/profile/${handle.trim()}`);
            setShowDropdown(false);
        }
    };

    const clearRecent = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRecentSearches([]);
        localStorage.removeItem("codey_recent_searches");
    };

    return (
        <div className={cn("relative w-full max-w-xl", className)}>
            <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    type="text"
                    placeholder="Enter Codeforces handle..."
                    className="pl-10 h-11 bg-card border-border/50 focus-visible:ring-primary/20 transition-all pr-20"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {handle && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md"
                            onClick={() => setHandle("")}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                    <Button type="submit" size="sm" className="h-8 px-3 text-xs font-bold">
                        Analyze
                    </Button>
                </div>
            </form>

            {/* Dropdown for Recent Searches */}
            {mounted && showDropdown && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-100/50 dark:bg-zinc-800/50 border-b">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <History className="w-3 h-3" /> Recent Searches
                        </span>
                        <button
                            onClick={clearRecent}
                            className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="py-1">
                        {recentSearches.map((s, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left group"
                                onClick={() => {
                                    setHandle(s);
                                    router.push(`/profile/${s}`);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <UserIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-semibold">{s}</span>
                                </div>
                                <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
