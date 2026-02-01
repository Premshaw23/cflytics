"use client";

import React from "react";
import Link from "next/link";
import {
    ExternalLink,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Bookmark,
    CheckCircle2,
    Clock,
    CircleDashed,
    Code2
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CFProblem } from "@/types";
import { BookmarkButton } from "./BookmarkButton";
import { NoteDialog } from "./NoteDialog";

export interface ProblemTableProps {
    problems: CFProblem[];
    isLoading: boolean;
    sortConfig: { key: keyof CFProblem | 'solvedCount'; direction: 'asc' | 'desc' } | null;
    onSort: (key: keyof CFProblem | 'solvedCount') => void;
    handle?: string;
    solvedIds?: string[];
    attemptedIds?: string[];
}

export function ProblemTable({
    problems,
    isLoading,
    sortConfig,
    onSort,
    handle = "",
    solvedIds = [],
    attemptedIds = []
}: ProblemTableProps) {
    const renderSortIcon = (columnKey: keyof CFProblem | 'solvedCount') => {
        if (sortConfig?.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortConfig.direction === 'asc' ?
            <ArrowUp className="ml-2 h-4 w-4" /> :
            <ArrowDown className="ml-2 h-4 w-4" />;
    };

    return (
        <div className="rounded-md border border-border/50 shadow-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[80px] font-bold">#</TableHead>
                            <TableHead className="font-bold">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSort("name")}
                                    className="p-0 hover:bg-transparent font-bold"
                                >
                                    Name
                                    {renderSortIcon("name")}
                                </Button>
                            </TableHead>
                            <TableHead className="font-bold">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSort("rating")}
                                    className="p-0 hover:bg-transparent font-bold"
                                >
                                    Rating
                                    {renderSortIcon("rating")}
                                </Button>
                            </TableHead>
                            <TableHead className="font-bold hidden md:table-cell">Tags</TableHead>
                            <TableHead className="w-[120px] text-right font-bold pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                    <TableCell><div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                    <TableCell className="text-right"><div className="h-8 w-16 ml-auto bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                </TableRow>
                            ))
                        ) : problems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                                    No problems found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            problems.map((problem, idx) => (
                                <TableRow
                                    key={`${problem.contestId}-${problem.index}-${problem.name}-${idx}`}
                                    className="group hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell className="font-bold text-muted-foreground">
                                        {problem.contestId}{problem.index}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {solvedIds.includes(`${problem.contestId}${problem.index}`) ? (
                                                <span title="Solved"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /></span>
                                            ) : attemptedIds.includes(`${problem.contestId}${problem.index}`) ? (
                                                <span title="Attempted"><Clock className="w-4 h-4 text-amber-500 shrink-0" /></span>
                                            ) : (
                                                <span title="Unattempted"><CircleDashed className="w-4 h-4 text-muted-foreground/30 shrink-0" /></span>
                                            )}
                                            <a
                                                href={`/problems/${problem.contestId}${problem.index}`}
                                                className={cn(
                                                    "font-bold group-hover:text-primary transition-colors cursor-pointer capitalize",
                                                    solvedIds.includes(`${problem.contestId}${problem.index}`) && "text-emerald-600 dark:text-emerald-400"
                                                )}
                                            >
                                                {problem.name}
                                            </a>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {problem.rating ? (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "font-bold border-transparent",
                                                    problem.rating >= 2400 ? "bg-red-500/10 text-red-500" :
                                                        problem.rating >= 1900 ? "bg-purple-500/10 text-purple-500" :
                                                            problem.rating >= 1600 ? "bg-blue-500/10 text-blue-500" :
                                                                problem.rating >= 1400 ? "bg-cyan-500/10 text-cyan-500" :
                                                                    problem.rating >= 1200 ? "bg-green-500/10 text-green-500" :
                                                                        "bg-gray-500/10 text-gray-500"
                                                )}
                                            >
                                                {problem.rating}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground font-medium">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {problem.tags.slice(0, 3).map((tag, tagIdx) => (
                                                <Badge
                                                    key={`${tag}-${tagIdx}`}
                                                    variant="secondary"
                                                    className="bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold py-0 h-5"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {problem.tags.length > 3 && (
                                                <span className="text-[10px] font-bold text-muted-foreground ml-1">
                                                    +{problem.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-1">
                                            <NoteDialog
                                                handle={handle}
                                                problemId={`${problem.contestId}${problem.index}`}
                                                problemName={problem.name}
                                            />
                                            <BookmarkButton
                                                handle={handle}
                                                problemId={`${problem.contestId}${problem.index}`}
                                                name={problem.name}
                                                rating={problem.rating}
                                            />
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10" title="Open in IDE">
                                                <Link href={`/compiler?problemId=${problem.contestId}${problem.index}`}>
                                                    <Code2 className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full outline-none" title="View on Codeforces">
                                                <a
                                                    href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

