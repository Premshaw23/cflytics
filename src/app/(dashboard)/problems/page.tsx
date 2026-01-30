"use client";

import React, { useState, useMemo } from "react";
import {
    Search,
    Filter,
    ChevronDown,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Hash,
    ArrowUpDown
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useProblems } from "@/lib/hooks/useProblems";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { CF_TAGS } from "@/config/constants";
import { cn } from "@/lib/utils";

export default function ProblemsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [minRating, setMinRating] = useState<number>(0);
    const [maxRating, setMaxRating] = useState<number>(4000);

    const { data, isLoading, isError, refetch } = useProblems({ tags: selectedTags });

    const filteredProblems = useMemo(() => {
        if (!data?.problems) return [];

        return data.problems.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${p.contestId}${p.index}`.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRating = (p.rating === undefined) || (p.rating >= minRating && p.rating <= maxRating);

            return matchesSearch && matchesRating;
        });
    }, [data, searchTerm, minRating, maxRating]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    if (isError) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Problem Explorer</h1>
                    <p className="text-muted-foreground font-medium">Browse and search through thousands of Codeforces problems.</p>
                </div>
            </div>

            {/* Filters Area */}
            <Card className="border-border/50 shadow-sm overflow-visible">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or index (e.g. 4A)..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Filter className="w-4 h-4" />
                                        Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                                        <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px] max-h-[400px] overflow-y-auto">
                                    <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {CF_TAGS.map(tag => (
                                        <DropdownMenuCheckboxItem
                                            key={tag}
                                            checked={selectedTags.includes(tag)}
                                            onCheckedChange={() => toggleTag(tag)}
                                        >
                                            {tag}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        Difficulty
                                        <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="p-4 space-y-4 w-[250px]">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating Range</p>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Min"
                                                className="h-8 text-xs"
                                                value={minRating}
                                                onChange={(e) => setMinRating(parseInt(e.target.value) || 0)}
                                            />
                                            <span className="text-muted-foreground">-</span>
                                            <Input
                                                type="number"
                                                placeholder="Max"
                                                className="h-8 text-xs"
                                                value={maxRating}
                                                onChange={(e) => setMaxRating(parseInt(e.target.value) || 4000)}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs font-bold"
                                        onClick={() => { setMinRating(0); setMaxRating(4000); }}
                                    >
                                        Reset Range
                                    </Button>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {selectedTags.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary font-bold hover:text-primary hover:bg-primary/10"
                                    onClick={() => setSelectedTags([])}
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </div>

                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {selectedTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="gap-1 px-3 py-1 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag} <X className="w-3 h-3 ml-1" />
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Problems Table */}
            <Card className="border-border/50 shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] font-bold">#</TableHead>
                                <TableHead className="font-bold">Name</TableHead>
                                <TableHead className="font-bold">Rating</TableHead>
                                <TableHead className="font-bold hidden md:table-cell">Tags</TableHead>
                                <TableHead className="w-[100px] text-right font-bold">Link</TableHead>
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
                                        <TableCell className="text-right"><div className="h-8 w-8 ml-auto bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredProblems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">
                                        No problems found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProblems.slice(0, 100).map((problem) => (
                                    <TableRow key={`${problem.contestId}${problem.index}`} className="group">
                                        <TableCell className="font-bold text-muted-foreground">
                                            {problem.contestId}{problem.index}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-bold group-hover:text-primary transition-colors cursor-pointer capitalize">
                                                {problem.name}
                                            </p>
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
                                                {problem.tags.slice(0, 3).map(tag => (
                                                    <Badge
                                                        key={tag}
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
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full outline-none">
                                                <a
                                                    href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {!isLoading && filteredProblems.length > 100 && (
                <p className="text-center text-sm text-muted-foreground font-medium">
                    Showing top 100 products of {filteredProblems.length} results. Use filters to refine.
                </p>
            )}
        </div>
    );
}

function X({ className, ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("lucide lucide-x", className)}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}
