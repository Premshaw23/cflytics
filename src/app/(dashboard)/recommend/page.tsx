"use client";

import React, { useState, useEffect } from 'react';
import { useRecommendations } from '@/lib/hooks/useRecommendations';
import { ProblemCard } from '@/components/recommend/ProblemCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, Target, Zap, Filter, ChevronDown, Check } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card } from '@/components/ui/card';
import { CF_TAGS } from '@/config/constants';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

export default function RecommendPage() {
    const [handle, setHandle] = useState('');
    const [submittedHandle, setSubmittedHandle] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("cflytics_active_handle");
        if (saved) {
            setHandle(saved);
            setSubmittedHandle(saved);
        }
    }, []);

    const { recommendations, isLoading, userRating } = useRecommendations({
        handle: submittedHandle,
        tag: selectedTag
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (handle) setSubmittedHandle(handle);
    };

    if (!submittedHandle) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-4 max-w-2xl px-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Smart Recommendations
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Enter your handle to get personalized problem suggestions based on your current rating.
                        We curate problems that are slightly above your level (+100 to +300 difficulty) to help you improve.
                    </p>
                </div>

                <Card className="w-full max-w-md p-6 border-2 border-primary/20 shadow-xl">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Your Codeforces Handle..."
                                className="pl-10"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={!handle} className="font-bold">
                            Get Picks
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Target className="w-8 h-8 text-primary" />
                        Recommended for {submittedHandle}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Target Rating Zone: <span className="text-primary font-bold">{userRating || 1200} - {(userRating || 1200) + 300}</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="w-4 h-4" />
                                {selectedTag || "All Tags"}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="h-[300px] overflow-y-auto w-[200px]">
                            <DropdownMenuItem onClick={() => setSelectedTag(null)}>
                                <div className="flex items-center justify-between w-full">
                                    All Tags
                                    {!selectedTag && <Check className="w-4 h-4" />}
                                </div>
                            </DropdownMenuItem>
                            {CF_TAGS.map(tag => (
                                <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)}>
                                    <div className="flex items-center justify-between w-full">
                                        {tag}
                                        {selectedTag === tag && <Check className="w-4 h-4" />}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" onClick={() => { setSubmittedHandle(''); setHandle(''); }}>Change User</Button>
                </div>
            </div>

            {selectedTag && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Filtering by:</span>
                    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive" onClick={() => setSelectedTag(null)}>
                        {selectedTag} <span className="text-[10px]">✕</span>
                    </Badge>
                </div>
            )}

            {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <LoadingSpinner label="Analyzing your profile and finding suitable problems..." />
                </div>
            ) : recommendations.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl">
                    <p className="text-xl font-bold text-muted-foreground">No recommendations found.</p>
                    <p className="text-muted-foreground">Try adjusting your filters or solving more problems to establish a rating.</p>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {recommendations.map(problem => (
                        <ProblemCard
                            key={`${problem.contestId}-${problem.index}`}
                            problem={problem}
                            handle={submittedHandle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

