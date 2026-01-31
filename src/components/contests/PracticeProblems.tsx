"use client";

import React from "react";
import { useContests } from "@/lib/hooks/useContests";
import { useContest } from "@/lib/hooks/useContest";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Lightbulb } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SkeletonLoader } from "@/components/shared/LoadingSpinner";

interface PracticeProblemsProps {
    currentContestName: string;
}

export function PracticeProblems({ currentContestName }: PracticeProblemsProps) {
    const { past, isLoading: contestsLoading } = useContests();

    // Improved matching logic: Look for specific patterns first
    const similarContest = React.useMemo(() => {
        if (!past || past.length === 0) return null;

        const nameLower = currentContestName.toLowerCase();

        // Define priority matching patterns
        const patterns = [
            /div\.\s*1\s*\+\s*div\.\s*2/i,
            /div\.\s*1/i,
            /div\.\s*2/i,
            /div\.\s*3/i,
            /div\.\s*4/i,
            /educational/i,
            /global/i,
            /hello/i,
            /goodbye/i
        ];

        // Find the specific pattern that matches current contest
        const activePattern = patterns.find(p => p.test(nameLower));

        if (activePattern) {
            // Find the most recent (first in past list) that matches the same pattern
            return past.find(c => activePattern.test(c.name.toLowerCase()));
        }

        // Fallback: If no pattern matches, just find any finished contest with "Round" 
        return past.find(c => c.name.toLowerCase().includes("round")) || past[0];
    }, [past, currentContestName]);

    const contestType = React.useMemo(() => {
        const patterns = ["Div. 1", "Div. 2", "Div. 3", "Div. 4", "Educational", "Global"];
        for (const p of patterns) {
            if (currentContestName.includes(p)) return p;
        }
        return "similar";
    }, [currentContestName]);

    const { data: contestDetail, isLoading: detailLoading } = useContest(similarContest?.id || 0, !!similarContest);

    if (contestsLoading || (similarContest && detailLoading)) {
        return (
            <div className="space-y-4">
                <SkeletonLoader className="h-8 w-48" />
                <SkeletonLoader className="h-[300px] w-full" />
            </div>
        );
    }

    if (!similarContest || !contestDetail || !contestDetail.problems || contestDetail.problems.length === 0) {
        return null;
    }

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Practice While You Wait</CardTitle>
                        <CardDescription>
                            Problems from the most recent {contestType} round ({similarContest.name})
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border bg-background overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[80px] font-bold">#</TableHead>
                                <TableHead className="font-bold">Name</TableHead>
                                <TableHead className="font-bold hidden md:table-cell">Rating</TableHead>
                                <TableHead className="text-right font-bold w-[100px]">Link</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contestDetail.problems.slice(0, 6).map((problem) => (
                                <TableRow key={problem.index} className="hover:bg-muted/50">
                                    <TableCell className="font-bold">{problem.index}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{problem.name}</div>
                                        <div className="flex gap-1 mt-1 flex-wrap">
                                            {problem.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[10px] text-muted-foreground bg-secondary px-1 py-0.5 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {problem.rating ? (
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {problem.rating}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                                            <a
                                                href={`https://codeforces.com/contest/${similarContest.id}/problem/${problem.index}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="gap-2"
                                            >
                                                Open <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/10">
                        <a href={`https://codeforces.com/contest/${similarContest.id}`} target="_blank" rel="noopener noreferrer" className="gap-2">
                            View Full Archive <BookOpen className="w-4 h-4" />
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
