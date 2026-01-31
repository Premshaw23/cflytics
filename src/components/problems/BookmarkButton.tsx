"use client";

import React from "react";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/lib/hooks/useBookmarks";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/store/useAuth";

interface BookmarkButtonProps {
    handle: string;
    problemId: string;
    name: string;
    rating?: number;
}

export function BookmarkButton({ handle, problemId, name, rating }: BookmarkButtonProps) {
    const authStatus = useAuth((s) => s.status);
    const isConnected = authStatus === "connected";
    const { isBookmarked, toggleBookmark } = useBookmarks(handle);
    const bookmarked = isBookmarked(problemId);

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "h-8 w-8 rounded-full transition-colors",
                bookmarked
                    ? "text-primary hover:text-primary/80"
                    : "text-muted-foreground hover:text-primary"
            )}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!handle && !isConnected) return;
                toggleBookmark.mutate({ problemId, name, rating });
            }}
            disabled={(!handle && !isConnected) || toggleBookmark.isPending}
        >
            <BookmarkIcon
                className={cn(
                    "w-4 h-4",
                    bookmarked && "fill-current"
                )}
            />
        </Button>
    );
}
