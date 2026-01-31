"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useProblems } from "@/lib/hooks/useProblems";
import { ErrorState } from "@/components/shared/ErrorState";
import { ProblemTable } from "@/components/problems/ProblemTable";
import { ProblemFilter, FilterState } from "@/components/problems/ProblemFilter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

    useEffect(() => {
        const saved = localStorage.getItem("codey_active_handle");
        if (saved) setHandle(saved);
    }, []);

    const { data, isLoading, isError, refetch } = useProblems({ tags: filters.tags });

    const filteredProblems = useMemo(() => {
        if (!data?.problems) return [];

        const result = data.problems.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                `${p.contestId}${p.index}`.toLowerCase().includes(filters.search.toLowerCase());

            // Handle missing rating (some problems don't have ratings)
            const problemRating = p.rating || 0;
            const matchesRating = (filters.minRating === 0 && filters.maxRating === 4000) ||
                (problemRating >= filters.minRating && problemRating <= filters.maxRating);

            // Status and Division filtering would go here if we had that data/logic
            // For now, these are placeholders in the UI as the backend/data isn't fully ready for them

            return matchesSearch && matchesRating;
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
            </div>

            <ProblemFilter
                filters={filters}
                onChange={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1); // Reset to page 1 on filter change
                }}
            />

            <ProblemTable
                problems={paginatedProblems}
                isLoading={isLoading}
                sortConfig={sortConfig}
                onSort={handleSort}
                handle={handle}
            />

            {/* Pagination Controls */}
            {!isLoading && filteredProblems.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground font-medium">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProblems.length)} of {filteredProblems.length} problems
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="text-sm font-bold mx-2">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
