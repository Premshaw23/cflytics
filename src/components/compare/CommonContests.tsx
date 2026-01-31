"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Swords } from 'lucide-react';
import { CFRatingChange } from '@/types';
import { Button } from '@/components/ui/button';
import { formatIST } from '@/lib/utils/date-utils';

interface CommonContestsProps {
    user1Handle: string;
    user2Handle: string;
    user1History: CFRatingChange[];
    user2History: CFRatingChange[];
}

export function CommonContests({
    user1Handle,
    user2Handle,
    user1History,
    user2History
}: CommonContestsProps) {

    const commonContests = useMemo(() => {
        if (!user1History || !user2History) return [];

        const u2Map = new Map(user2History.map(h => [h.contestId, h]));
        const common: { contestName: string, contestId: number, time: number, u1: CFRatingChange, u2: CFRatingChange }[] = [];

        user1History.forEach(u1 => {
            const u2 = u2Map.get(u1.contestId);
            if (u2) {
                common.push({
                    contestName: u1.contestName,
                    contestId: u1.contestId,
                    time: u1.ratingUpdateTimeSeconds,
                    u1,
                    u2
                });
            }
        });

        return common.sort((a, b) => b.time - a.time);
    }, [user1History, user2History]);

    const stats = useMemo(() => {
        let u1Wins = 0;
        let u2Wins = 0;

        commonContests.forEach(c => {
            if (c.u1.rank < c.u2.rank) u1Wins++;
            else if (c.u2.rank < c.u1.rank) u2Wins++;
        });

        return { u1Wins, u2Wins };
    }, [commonContests]);

    if (commonContests.length === 0) {
        return (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Swords className="w-5 h-5" /> Head-to-Head Record
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg m-6">
                    No common contests found.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Swords className="w-5 h-5" /> Head-to-Head Record
                    </CardTitle>
                    <div className="text-sm font-bold bg-muted px-3 py-1 rounded-full">
                        {user1Handle} <span className="text-green-500">{stats.u1Wins}</span> - <span className="text-red-500">{stats.u2Wins}</span> {user2Handle}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="max-h-[400px] overflow-y-auto pr-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contest</TableHead>
                                <TableHead className="text-center">{user1Handle}</TableHead>
                                <TableHead className="text-center">{user2Handle}</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commonContests.map((c) => {
                                const u1Win = c.u1.rank < c.u2.rank;
                                const u2Win = c.u2.rank < c.u1.rank;

                                return (
                                    <TableRow key={c.contestId}>
                                        <TableCell className="font-medium">
                                            <span className="line-clamp-1" title={c.contestName}>{c.contestName}</span>
                                            <span className="text-xs text-muted-foreground">{formatIST(c.time * 1000, 'dd/MM/yyyy')} IST</span>
                                        </TableCell>
                                        <TableCell className={`text-center ${u1Win ? "text-green-500 font-bold" : "text-muted-foreground"}`}>
                                            {c.u1.rank}
                                        </TableCell>
                                        <TableCell className={`text-center ${u2Win ? "text-green-500 font-bold" : "text-muted-foreground"}`}>
                                            {c.u2.rank}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" asChild className="h-6 w-6">
                                                <a
                                                    href={`https://codeforces.com/contest/${c.contestId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
