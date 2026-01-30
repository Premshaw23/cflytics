"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Tag } from 'lucide-react';
import { CFProblem } from '@/types';
import { cn } from "@/lib/utils";

interface ProblemCardProps {
    problem: CFProblem;
}

export function ProblemCard({ problem }: ProblemCardProps) {
    // Color code rating
    const getRatingColor = (rating?: number) => {
        if (!rating) return "bg-gray-500";
        if (rating < 1200) return "bg-gray-400";
        if (rating < 1400) return "bg-green-500";
        if (rating < 1600) return "bg-cyan-500";
        if (rating < 1900) return "bg-blue-500";
        if (rating < 2100) return "bg-purple-500";
        if (rating < 2400) return "bg-orange-500";
        return "bg-red-500";
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow border-border/50 group">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {problem.index}. {problem.name}
                    </CardTitle>
                    <Badge className={cn("shrink-0 pointer-events-none text-white", getRatingColor(problem.rating))}>
                        {problem.rating}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
                <div className="flex flex-wrap gap-1.5">
                    {problem.tags.slice(0, 4).map(tag => (
                        <div key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-sm">
                            <Tag className="w-3 h-3" /> {tag}
                        </div>
                    ))}
                    {problem.tags.length > 4 && (
                        <span className="text-xs text-muted-foreground self-center">+{problem.tags.length - 4}</span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-4 font-medium">
                    Contest {problem.contestId}
                </p>
            </CardContent>
            <CardFooter className="pt-0">
                <Button className="w-full gap-2 font-bold" asChild>
                    <a
                        href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Solve <ExternalLink className="w-4 h-4" />
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}
