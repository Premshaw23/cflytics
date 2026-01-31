"use client";

import React, { useState } from 'react';
import { useContests } from '@/lib/hooks/useContests';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatIST } from '@/lib/utils/date-utils';
import { ExternalLink, Search, Trophy, Timer, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatContestName } from '@/lib/utils/contest-utils';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ErrorState } from '@/components/shared/ErrorState';
import { ContestCard } from '@/components/contests/ContestCard';

export default function ContestsClient() {
    const { upcoming, past, isLoading, isError, refetch } = useContests();
    const [searchTerm, setSearchTerm] = useState('');

    if (isError) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    const filteredPast = past.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 50); // Limit to 50 for performance

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Contests</h1>
                    <p className="text-muted-foreground font-medium">Schedule of upcoming rounds and archive of past events.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href="https://calendar.google.com/calendar/embed?src=br1o1n70oe45bd713028362628%40group.calendar.google.com" target="_blank" rel="noopener noreferrer" className="gap-2">
                            <Calendar className="w-4 h-4" /> Add to Calendar
                        </a>
                    </Button>
                    <Button variant="default" asChild>
                        <a href="https://codeforces.com/contests" target="_blank" rel="noopener noreferrer" className="gap-2">
                            Official Schedule <ExternalLink className="w-4 h-4" />
                        </a>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="upcoming" className="gap-2 font-bold">
                        <Timer className="w-4 h-4" />
                        Upcoming
                        <span className="ml-1 bg-primary/10 px-1.5 py-0.5 rounded text-xs">{upcoming.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="past" className="gap-2 font-bold">
                        <Trophy className="w-4 h-4" /> Past Archive
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-6">
                    {isLoading ? (
                        <div className="min-h-[300px] flex items-center justify-center">
                            <LoadingSpinner label="Loading schedule..." />
                        </div>
                    ) : upcoming.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/50">
                            <Calendar className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                            <p className="text-xl font-bold text-muted-foreground">No upcoming contests scheduled.</p>
                            <p className="text-muted-foreground mt-2">Check back later or view the archive.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {upcoming.map(contest => (
                                <ContestCard key={contest.id} contest={contest} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-6">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search past contests..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Card className="border-border/50 shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="w-[100px] font-bold">ID</TableHead>
                                        <TableHead className="font-bold">Name</TableHead>
                                        <TableHead className="hidden md:table-cell font-bold">Date</TableHead>
                                        <TableHead className="hidden lg:table-cell font-bold">Duration</TableHead>
                                        <TableHead className="text-right font-bold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 10 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><div className="h-4 w-8 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                                <TableCell className="hidden md:table-cell"><div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                                <TableCell className="text-right"><div className="h-8 w-8 ml-auto bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredPast.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                                                No contests found matching &quot;{searchTerm}&quot;
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPast.map(contest => (
                                            <TableRow key={contest.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-mono text-muted-foreground">{contest.id}</TableCell>
                                                <TableCell className="font-medium">
                                                    <Link
                                                        href={`/contests/${contest.id}`}
                                                        className="hover:text-primary hover:underline underline-offset-4"
                                                    >
                                                        {formatContestName(contest.name, contest.id)}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground whitespace-nowrap">
                                                    {formatIST(contest.startTimeSeconds! * 1000, "dd/MM/yyyy")}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                    {Math.floor(contest.durationSeconds / 3600)}h {(contest.durationSeconds % 3600) / 60 > 0 ? `${(contest.durationSeconds % 3600) / 60}m` : ""}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild className="h-8 px-2 font-bold gap-1.5">
                                                        <Link href={`/contests/${contest.id}`}>
                                                            <Eye className="w-3.5 h-3.5" /> View
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
