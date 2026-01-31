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
    ).slice(0, 50);

    return (
        <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-white rounded-full" />
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">CONTESTS</h1>
                    </div>
                    <p className="text-zinc-500 font-bold text-lg max-w-2xl leading-relaxed uppercase tracking-tight">
                        Schedule of upcoming rounds and archive of past events. Track your next challenge.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="h-12 border-white/5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 font-black tracking-widest text-[10px] uppercase px-6" asChild>
                        <a href="https://calendar.google.com/calendar/embed?src=br1o1n70oe45bd713028362628%40group.calendar.google.com" target="_blank" rel="noopener noreferrer" className="gap-3">
                            <Calendar className="w-4 h-4" /> Add to Calendar
                        </a>
                    </Button>
                    <Button variant="default" className="h-12 bg-white text-black hover:bg-zinc-200 font-black tracking-widest text-[10px] uppercase px-6" asChild>
                        <a href="https://codeforces.com/contests" target="_blank" rel="noopener noreferrer" className="gap-3">
                            Official Schedule <ExternalLink className="w-4 h-4" />
                        </a>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                    <TabsList className="bg-zinc-900/50 border border-white/5 p-1 h-14 rounded-2xl w-full md:w-[440px]">
                        <TabsTrigger value="upcoming" className="rounded-xl h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-black transition-all">
                            <Timer className="w-3.5 h-3.5 mr-2" />
                            Upcoming Rounds
                            <span className="ml-2 px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-500 text-[9px] data-[state=active]:bg-zinc-100 data-[state=active]:text-black group-data-[state=active]:bg-black/5">
                                {upcoming.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="past" className="rounded-xl h-full font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white data-[state=active]:text-black transition-all">
                            <Trophy className="w-3.5 h-3.5 mr-2" />
                            Past Archive
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                        <Input
                            placeholder="Search archive..."
                            className="h-14 pl-12 bg-zinc-900/40 border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest placeholder:text-zinc-700 focus:border-white/10 focus:ring-4 ring-white/5 transition-all w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="upcoming" className="space-y-10 outline-none">
                    {isLoading ? (
                        <div className="min-h-[400px] flex items-center justify-center">
                            <LoadingSpinner label="SYNCING SCHEDULE" />
                        </div>
                    ) : upcoming.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-[40px] bg-zinc-900/20">
                            <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-8 border border-white/5">
                                <Calendar className="w-10 h-10 text-zinc-700" />
                            </div>
                            <p className="text-2xl font-black text-white tracking-tighter uppercase mb-2">No Active Rounds</p>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">The archive is always open for training.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {upcoming.map(contest => (
                                <ContestCard key={contest.id} contest={contest} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-10 outline-none">
                    <Card className="bg-zinc-900/20 border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-white/5 hover:bg-transparent">
                                        <TableHead className="w-[120px] font-black uppercase tracking-widest text-[10px] text-zinc-600 h-16 pl-8">Entry ID</TableHead>
                                        <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-600 h-16">Contest Identity</TableHead>
                                        <TableHead className="hidden md:table-cell font-black uppercase tracking-widest text-[10px] text-zinc-600 h-16">Timeline</TableHead>
                                        <TableHead className="hidden lg:table-cell font-black uppercase tracking-widest text-[10px] text-zinc-600 h-16">Limit</TableHead>
                                        <TableHead className="text-right font-black uppercase tracking-widest text-[10px] text-zinc-600 h-16 pr-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <TableRow key={i} className="border-b border-white/[0.02]">
                                                <TableCell className="pl-8"><div className="h-4 w-12 bg-zinc-800 animate-pulse rounded-lg" /></TableCell>
                                                <TableCell><div className="h-4 w-64 bg-zinc-800 animate-pulse rounded-lg" /></TableCell>
                                                <TableCell className="hidden md:table-cell"><div className="h-4 w-24 bg-zinc-800 animate-pulse rounded-lg" /></TableCell>
                                                <TableCell className="text-right pr-8"><div className="h-9 w-20 ml-auto bg-zinc-800 animate-pulse rounded-lg" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredPast.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-64 text-center">
                                                <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No records found matching your search</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPast.map(contest => (
                                            <TableRow key={contest.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                                <TableCell className="font-black font-mono text-[10px] text-zinc-500 pl-8 tracking-widest uppercase">#{contest.id}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/contests/${contest.id}`}
                                                        className="font-bold text-zinc-300 group-hover:text-primary transition-colors text-sm"
                                                    >
                                                        {formatContestName(contest.name, contest.id)}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-zinc-500 font-bold text-xs whitespace-nowrap">
                                                    {formatIST(contest.startTimeSeconds! * 1000, "MMM dd, yyyy")}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-zinc-500 font-bold text-xs uppercase tracking-tighter">
                                                    {Math.floor(contest.durationSeconds / 3600)}H {(contest.durationSeconds % 3600) / 60 > 0 ? `${(contest.durationSeconds % 3600) / 60}M` : ""}
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="ghost" size="sm" asChild className="h-10 px-4 font-black tracking-widest text-[9px] uppercase hover:bg-white hover:text-black transition-all gap-2 rounded-xl">
                                                        <Link href={`/contests/${contest.id}`}>
                                                            DATA <Eye className="w-3.5 h-3.5" />
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
