"use client";

import React, { useState } from 'react';
import { useContests } from '@/lib/hooks/useContests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, ExternalLink, Search, Trophy, Timer } from 'lucide-react';
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

export default function ContestsPage() {
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
                <Button variant="outline" asChild>
                    <a href="https://codeforces.com/contests" target="_blank" rel="noopener noreferrer" className="gap-2">
                        Official Calendar <ExternalLink className="w-4 h-4" />
                    </a>
                </Button>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="upcoming" className="gap-2"><Timer className="w-4 h-4" /> Upcoming ({upcoming.length})</TabsTrigger>
                    <TabsTrigger value="past" className="gap-2"><Trophy className="w-4 h-4" /> Past Archive</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-6">
                    {isLoading ? (
                        <div className="min-h-[300px] flex items-center justify-center">
                            <LoadingSpinner label="Loading schedule..." />
                        </div>
                    ) : upcoming.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl">
                            <p className="text-xl font-bold text-muted-foreground">No upcoming contests scheduled.</p>
                            <p className="text-muted-foreground">Check back later or view the archive.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcoming.map(contest => {
                                const startTime = new Date(contest.startTimeSeconds * 1000);
                                const isCoding = contest.phase === "CODING";
                                return (
                                    <Card key={contest.id} className={`border-l-4 ${isCoding ? "border-l-green-500 shadow-md shadow-green-500/10" : "border-l-primary"}`}>
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <Badge variant={isCoding ? "default" : "secondary"} className={isCoding ? "bg-green-500 hover:bg-green-600" : ""}>
                                                    {isCoding ? "LIVE" : "UPCOMING"}
                                                </Badge>
                                                <span className="text-xs font-mono text-muted-foreground">ID: {contest.id}</span>
                                            </div>
                                            <CardTitle className="text-lg leading-tight mt-2 line-clamp-2" title={contest.name}>
                                                {contest.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{format(startTime, "PPP p")}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {isCoding ? "Ends" : "Starts"} {formatDistanceToNow(isCoding ? new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000) : startTime, { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Timer className="w-4 h-4" />
                                                    <span>Duration: {Math.floor(contest.durationSeconds / 3600)}h {(contest.durationSeconds % 3600) / 60}m</span>
                                                </div>
                                            </div>

                                            <Button className="w-full font-bold gap-2" variant={isCoding ? "default" : "outline"} asChild>
                                                <a href={`https://codeforces.com/contest/${contest.id}`} target="_blank" rel="noopener noreferrer">
                                                    {isCoding ? "Enter Contest" : "Register / Info"} <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
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

                    <Card className="border-border/50">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="hidden md:table-cell">Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><div className="h-4 w-8 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell className="hidden md:table-cell"><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                                <TableCell className="text-right"><div className="h-8 w-8 ml-auto bg-muted animate-pulse rounded" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredPast.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                No contests found matching "{searchTerm}"
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPast.map(contest => (
                                            <TableRow key={contest.id}>
                                                <TableCell className="font-mono text-muted-foreground">{contest.id}</TableCell>
                                                <TableCell className="font-medium">{contest.name}</TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                                    {format(new Date(contest.startTimeSeconds * 1000), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <a href={`https://codeforces.com/contest/${contest.id}`} target="_blank" rel="noopener noreferrer">
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
