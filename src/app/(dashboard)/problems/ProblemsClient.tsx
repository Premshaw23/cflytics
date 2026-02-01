"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useProblems } from "@/lib/hooks/useProblems";
import { useUserProblemStatus } from "@/lib/hooks/useUserProblemStatus";
import { ErrorState } from "@/components/shared/ErrorState";
import { ProblemTable } from "@/components/problems/ProblemTable";
import { ProblemFilter, FilterState } from "@/components/problems/ProblemFilter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { ProblemCards } from "@/components/problems/ProblemCards";
import { cn } from "@/lib/utils";
import { CFProblem } from "@/types";

const ITEMS_PER_PAGE = 20;

export default function ProblemsClient() {
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        tags: [],
        minRating: 0,
        maxRating: 4000,
        status: 'all',
        division: 'all'
    });

    const [sortConfig, setSortConfig] = useState<{
        key: keyof CFProblem | 'solvedCount';
        direction: 'asc' | 'desc';
    } | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [handle, setHandle] = useState<string>("");
    const [displayMode, setDisplayMode] = useState<"card" | "table">("table");

    useEffect(() => {
        const saved = localStorage.getItem("codey_active_handle");
        if (saved) setHandle(saved);

        const savedMode = localStorage.getItem("codey_problem_display_mode") as "card" | "table";
        if (savedMode) setDisplayMode(savedMode);
    }, []);

    const { data, isLoading, isError, refetch } = useProblems({ tags: filters.tags });
    const { data: statusData } = useUserProblemStatus();

    const filteredProblems = useMemo(() => {
        if (!data?.problems) return [];

        const solvedIds = new Set(statusData?.solvedIds || []);
        const attemptedIds = new Set(statusData?.attemptedIds || []);

        const result = data.problems.filter(p => {
            const problemId = `${p.contestId}${p.index}`;
            const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                problemId.toLowerCase().includes(filters.search.toLowerCase());

            // Handle missing rating (some problems don't have ratings)
            const problemRating = p.rating || 0;
            const matchesRating = (filters.minRating === 0 && filters.maxRating === 4000) ||
                (problemRating >= filters.minRating && problemRating <= filters.maxRating);

            // Status filtering
            let matchesStatus = true;
            if (filters.status === 'solved') {
                matchesStatus = solvedIds.has(problemId);
            } else if (filters.status === 'attempted') {
                // Attempted but NOT yet solved
                matchesStatus = attemptedIds.has(problemId) && !solvedIds.has(problemId);
            } else if (filters.status === 'unsolved') {
                // Never even touched/submitted
                matchesStatus = !attemptedIds.has(problemId);
            }

            // Division filtering
            let matchesDivision = true;
            if (filters.division !== 'all') {
                // Approximate division based on problem index and rating
                // Div 4: often A,B,C rating < 1200
                // Div 3: often A,B,C,D rating < 1600
                // This is a rough estimation as Codeforces doesn't expose division directly in problems
                const rating = p.rating || 0;
                if (filters.division === '4') matchesDivision = rating > 0 && rating <= 1100;
                else if (filters.division === '3') matchesDivision = rating > 1100 && rating <= 1400;
                else if (filters.division === '2') matchesDivision = rating > 1400 && rating <= 1900;
                else if (filters.division === '1') matchesDivision = rating > 1900;
            }

            return matchesSearch && matchesRating && matchesStatus && matchesDivision;
        });

        // Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = sortConfig.key === 'solvedCount' ? 0 : a[sortConfig.key];
                const bValue = sortConfig.key === 'solvedCount' ? 0 : b[sortConfig.key];

                // Handle undefined values
                if (aValue === undefined && bValue === undefined) return 0;
                if (aValue === undefined) return 1;
                if (bValue === undefined) return -1;

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            // Default sort: problems with ratings first, sorted by rating ascending (easiest first)
            result.sort((a, b) => {
                const aRating = a.rating ?? 0;
                const bRating = b.rating ?? 0;

                // Problems with ratings come first
                if (aRating === 0 && bRating > 0) return 1;
                if (bRating === 0 && aRating > 0) return -1;

                // Both have ratings: sort by rating ascending (easiest first)
                return aRating - bRating;
            });
        }

        return result;
    }, [data, filters, sortConfig]);

    const paginatedProblems = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProblems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProblems, currentPage]);

    const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);

    const handleSort = (key: keyof CFProblem | 'solvedCount') => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'desc' }; // Default to desc for ratings/difficulty
        });
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
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                    <Button
                        variant={displayMode === "table" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => {
                            setDisplayMode("table");
                            localStorage.setItem("codey_problem_display_mode", "table");
                        }}
                        className="h-8 px-3 gap-2"
                    >
                        <List className="w-4 h-4" /> Table
                    </Button>
                    <Button
                        variant={displayMode === "card" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => {
                            setDisplayMode("card");
                            localStorage.setItem("codey_problem_display_mode", "card");
                        }}
                        className="h-8 px-3 gap-2"
                    >
                        <LayoutGrid className="w-4 h-4" /> Cards
                    </Button>
                </div>
            </div>

            <ProblemFilter
                filters={filters}
                onChange={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1); // Reset to page 1 on filter change
                }}
            />

            {displayMode === "table" ? (
                <ProblemTable
                    problems={paginatedProblems}
                    isLoading={isLoading}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    handle={handle}
                    solvedIds={statusData?.solvedIds || []}
                    attemptedIds={statusData?.attemptedIds || []}
                />
            ) : (
                <ProblemCards
                    problems={paginatedProblems}
                    isLoading={isLoading}
                    handle={handle}
                    solvedIds={statusData?.solvedIds || []}
                    attemptedIds={statusData?.attemptedIds || []}
                />
            )}

            {/* Pagination Controls */}
            {!isLoading && filteredProblems.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50 pt-6">
                    <div className="text-sm text-muted-foreground font-medium text-center sm:text-left order-2 sm:order-1">
                        Showing <span className="text-foreground font-bold">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="text-foreground font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProblems.length)}</span> of <span className="text-foreground font-bold">{filteredProblems.length}</span> problems
                    </div>
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setCurrentPage(prev => Math.max(1, prev - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={currentPage === 1}
                            className="h-9 px-4 font-bold"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Prev
                        </Button>
                        <div className="bg-muted/50 px-3 py-1.5 rounded-md text-sm font-bold border border-border/50">
                            {currentPage} / {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={currentPage === totalPages}
                            className="h-9 px-4 font-bold"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
