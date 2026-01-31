"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CFProblem } from "@/types";
import { getRatingColor } from "@/lib/utils/rating-colors";
import { Trophy, Users, ExternalLink, Bookmark } from "lucide-react";
import Link from "next/link";
import { BookmarkButton } from "./BookmarkButton";
import { NoteDialog } from "./NoteDialog";

interface ProblemCardsProps {
    problems: CFProblem[];
    isLoading: boolean;
    handle: string;
}

export function ProblemCards({ problems, isLoading, handle }: ProblemCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="animate-pulse border-border/50">
                        <div className="h-32 bg-muted/50 rounded-t-lg" />
                        <CardContent className="p-4 space-y-3">
                            <div className="h-4 w-3/4 bg-muted/50 rounded" />
                            <div className="h-3 w-1/2 bg-muted/50 rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {problems.map((problem) => {
                const color = getRatingColor(problem.rating || 0);

                return (
                    <Card key={`${problem.contestId}${problem.index}`} className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card overflow-hidden flex flex-col">
                        <CardHeader className="p-4 pb-2 space-y-1 shrink-0">
                            <div className="flex items-start justify-between gap-2">
                                <Badge variant="outline" className="font-mono text-[10px] py-0 px-2">
                                    {problem.contestId}{problem.index}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <BookmarkButton
                                        handle={handle}
                                        problemId={`${problem.contestId}${problem.index}`}
                                        name={problem.name}
                                        rating={problem.rating}
                                    />
                                    <NoteDialog
                                        handle={handle}
                                        problemId={`${problem.contestId}${problem.index}`}
                                        problemName={problem.name}
                                    />
                                </div>
                            </div>
                            <Link
                                href={`/problems/${problem.contestId}-${problem.index}`}
                                className="block"
                            >
                                <CardTitle className="text-sm font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[40px]">
                                    {problem.name}
                                </CardTitle>
                            </Link>
                        </CardHeader>

                        <CardContent className="p-4 pt-0 space-y-3 flex-grow">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <Trophy className="w-3.5 h-3.5" style={{ color }} />
                                    <span className="text-xs font-bold" style={{ color }}>
                                        {problem.rating || "Unrated"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Users className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium">10k+</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {problem.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted/50 hover:bg-muted font-medium">
                                        {tag}
                                    </Badge>
                                ))}
                                {problem.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted/50">
                                        +{problem.tags.length - 3}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0 mt-auto border-t border-border/5 pt-3">
                            <a
                                href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-1.5 rounded-md bg-muted/30 hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all duration-300"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Solve on CF
                            </a>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
