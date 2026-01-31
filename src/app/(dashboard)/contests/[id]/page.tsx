"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useContest } from "@/lib/hooks/useContest";
import { ContestCountdown } from "@/components/contests/ContestCountdown";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Clock, Trophy, AlertCircle, Info } from "lucide-react";
import { formatIST } from "@/lib/utils/date-utils";
import { formatContestName } from "@/lib/utils/contest-utils";
import { PracticeProblems } from "@/components/contests/PracticeProblems";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function ContestDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { data, isLoading, isError, refetch } = useContest(id);

    if (isLoading) {
        return <LoadingSpinner label="Loading contest details..." />;
    }

    if (isError || !data?.contest) {
        return <ErrorState onRetry={() => refetch()} />;
    }

    const { contest, problems } = data;
    const startTime = new Date(contest.startTimeSeconds! * 1000);
    const isBefore = contest.phase === "BEFORE";
    const isCoding = contest.phase === "CODING";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge
                                variant={isCoding ? "default" : "secondary"}
                                className={cn(
                                    "font-bold tracking-wide",
                                    isCoding ? "bg-green-600 hover:bg-green-700" : ""
                                )}
                            >
                                {isCoding ? "LIVE" : isBefore ? "UPCOMING" : "FINISHED"}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs py-0.5 px-2 bg-muted/50">
                                #{contest.id}
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {formatContestName(contest.name, contest.id)}
                        </h1>
                    </div>
                    <Button asChild className={cn(isCoding ? "bg-green-600 hover:bg-green-700" : "")}>
                        <a href={`https://codeforces.com/contest/${contest.id}`} target="_blank" rel="noopener noreferrer">
                            {isCoding ? "Enter Contest" : "View on Codeforces"} <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground border-y border-border/50 py-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{formatIST(startTime, "dd/MM/yyyy HH:mm")} IST</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                                {Math.floor(contest.durationSeconds / 3600)}h {(contest.durationSeconds % 3600) / 60 > 0 && `${(contest.durationSeconds % 3600) / 60}m`}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Duration</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground capitalize">
                            {contest.type}
                        </span>
                    </div>
                </div>
            </div>

            {/* Countdown or Status */}
            {isBefore && (
                <div className="space-y-8">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
                            <h3 className="text-xl font-semibold">Contest starts in</h3>
                            <div className="text-4xl md:text-6xl text-primary font-bold">
                                <ContestCountdown targetTimeSeconds={contest.startTimeSeconds!} />
                            </div>
                            <Button className="mt-4 font-bold" variant="outline" asChild size="lg">
                                <a href={`https://codeforces.com/contest/${contest.id}/standings`} target="_blank" rel="noopener noreferrer">
                                    Register Now via Codeforces
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">
                                Problem details are locked for security until the contest begins. However, you can practice with similar problems below!
                            </p>
                        </div>
                        {!/#\d+/.test(contest.name) && (
                            <div className="text-[11px] opacity-80 pl-8 border-t border-blue-500/10 pt-2 italic">
                                Note: This round hasn't been officially numbered by Codeforces yet. We are using the Contest ID (#{contest.id}) as a temporary identifier.
                            </div>
                        )}
                    </div>

                    <PracticeProblems currentContestName={contest.name} />
                </div>
            )}

            {/* Problems List */}
            {!isBefore && problems && problems.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Problems</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] font-bold">#</TableHead>
                                    <TableHead className="font-bold">Name</TableHead>
                                    <TableHead className="font-bold">Type</TableHead>
                                    <TableHead className="text-right font-bold w-[100px]">Link</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {problems.map((problem) => (
                                    <TableRow key={problem.index} className="hover:bg-muted/50">
                                        <TableCell className="font-bold">{problem.index}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{problem.name}</div>
                                            {problem.tags.length > 0 && (
                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                    {problem.tags.slice(0, 3).map(tag => (
                                                        <span key={tag} className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground uppercase text-xs font-bold">
                                            {problem.type}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" asChild>
                                                <a
                                                    href={`https://codeforces.com/contest/${contest.id}/problem/${problem.index}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Empty State for Upcoming or No Problems */}
            {!isBefore && (!problems || problems.length === 0) && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
                        <p>Problems will be available once the contest starts.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
