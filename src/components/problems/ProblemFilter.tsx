"use client";

import React from "react";
import {
    Search,
    Filter,
    ChevronDown,
    X,
    CheckCircle2,
    Trophy
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { CF_TAGS } from "@/config/constants";

export interface FilterState {
    search: string;
    tags: string[];
    minRating: number;
    maxRating: number;
    status: 'all' | 'solved' | 'unsolved' | 'attempted';
    division: 'all' | '1' | '2' | '3' | '4';
}

interface ProblemFilterProps {
    filters: FilterState;
    onChange: (newFilters: FilterState) => void;
}

export function ProblemFilter({ filters, onChange }: ProblemFilterProps) {
    const updateFilter = (key: keyof FilterState, value: any) => {
        onChange({ ...filters, [key]: value });
    };

    const toggleTag = (tag: string) => {
        const currentTags = filters.tags;
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
        updateFilter("tags", newTags);
    };

    const clearAll = () => {
        onChange({
            search: "",
            tags: [],
            minRating: 0,
            maxRating: 4000,
            status: 'all',
            division: 'all'
        });
    };

    return (
        <Card className="border-border/50 shadow-sm overflow-visible bg-card">
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or index (e.g. 4A)..."
                            className="pl-10"
                            value={filters.search}
                            onChange={(e) => updateFilter("search", e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* Tags Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 border-dashed">
                                    <Filter className="w-4 h-4" />
                                    Tags {filters.tags.length > 0 && `(${filters.tags.length})`}
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[240px] max-h-[400px] overflow-y-auto">
                                <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {CF_TAGS.map((tag, idx) => (
                                    <DropdownMenuCheckboxItem
                                        key={`${tag}-${idx}`}
                                        checked={filters.tags.includes(tag)}
                                        onCheckedChange={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Difficulty Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 border-dashed">
                                    Difficulty
                                    <ChevronDown className="w-4 h-4 opacity-50" />
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
                                            value={filters.minRating || ''}
                                            onChange={(e) => updateFilter("minRating", parseInt(e.target.value) || 0)}
                                        />
                                        <span className="text-muted-foreground">-</span>
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            className="h-8 text-xs"
                                            value={filters.maxRating === 4000 ? '' : filters.maxRating}
                                            onChange={(e) => updateFilter("maxRating", parseInt(e.target.value) || 4000)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full text-xs font-bold"
                                    onClick={() => {
                                        updateFilter("minRating", 0);
                                        updateFilter("maxRating", 4000);
                                    }}
                                >
                                    Reset Range
                                </Button>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Status Filter (New) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 border-dashed">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Status
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Problem Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={filters.status}
                                    onValueChange={(val) => updateFilter("status", val)}
                                >
                                    <DropdownMenuRadioItem value="all">All Goals</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="unsolved">Unsolved</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="solved">Solved</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="attempted">Attempted</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Division Filter (New) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 border-dashed">
                                    <Trophy className="w-4 h-4" />
                                    Div
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Contest Division</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup
                                    value={filters.division}
                                    onValueChange={(val) => updateFilter("division", val)}
                                >
                                    <DropdownMenuRadioItem value="all">All Divisions</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="1">Div. 1</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="2">Div. 2</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="3">Div. 3</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="4">Div. 4</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {(filters.tags.length > 0 || filters.minRating > 0 || filters.maxRating < 4000 || filters.status !== 'all' || filters.division !== 'all' || filters.search) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={clearAll}
                            >
                                Clear All
                                <X className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Active Filters Display */}
                {filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                        {filters.tags.map((tag, idx) => (
                            <Badge
                                key={`${tag}-${idx}`}
                                variant="secondary"
                                className="gap-1 px-3 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                                onClick={() => toggleTag(tag)}
                            >
                                {tag} <X className="w-3 h-3 ml-1" />
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
