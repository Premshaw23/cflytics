"use client";

import React, { useState, useEffect } from "react";
import { useBookmarks } from "@/lib/hooks/useBookmarks";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark as BookmarkIcon, ExternalLink, Trash2, Search, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function BookmarksClient() {
    const [handle, setHandle] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem("codey_active_handle");
        setHandle(saved || "");
    }, []);

    const { bookmarks, isLoading, isError, toggleBookmark } = useBookmarks(handle || "");

    if (!handle && handle !== null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Your Saved Problems</h1>
                    <p className="text-muted-foreground text-sm font-medium">Please set a handle to view your bookmarks.</p>
                </div>
                <Button onClick={() => router.push("/")}>Set Handle</Button>
            </div>
        );
    }

    if (isLoading) return <LoadingSpinner label="Fetching your saved problems..." />;
    if (isError) return <ErrorState message="Could not fetch bookmarks." />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
                        <BookmarkIcon className="w-8 h-8 text-primary" /> Saved Problems
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm">
                        Curated collection of challenges for <span className="text-primary font-bold">@{handle}</span>
                    </p>
                </div>
            </div>

            {!bookmarks || bookmarks.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <BookmarkIcon className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold">No saved problems yet</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                                Problems you bookmark from the Problem Explorer will appear here for quick access.
                            </p>
                        </div>
                        <Button variant="outline" className="font-bold" onClick={() => router.push("/problems")}>
                            Browse Problems <Target className="ml-2 w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarks.map((bookmark) => (
                        <Card key={bookmark.id} className="group border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="font-mono text-[10px] py-0 px-2">
                                        {bookmark.problemId}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => toggleBookmark.mutate({
                                            problemId: bookmark.problemId,
                                            name: bookmark.name,
                                            rating: bookmark.rating || undefined
                                        })}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors line-clamp-1">
                                    {bookmark.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Rating:</span>
                                        <span className="font-bold text-primary">{bookmark.rating || "N/A"}</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase">
                                        Added {new Date(bookmark.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="default" className="flex-1 font-bold h-9" asChild>
                                        <a
                                            href={`https://codeforces.com/problemset/problem/${bookmark.problemId.replace(/[A-Z]+$/, '')}/${bookmark.problemId.match(/[A-Z]+$/)?.[0]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Solve Now <ExternalLink className="ml-2 w-3 h-3" />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
