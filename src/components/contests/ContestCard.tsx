"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { formatIST } from "@/lib/utils/date-utils";
import { Calendar, Clock, ExternalLink, Trophy, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContestCountdown } from "./ContestCountdown";
import { CFContest } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatContestName } from "@/lib/utils/contest-utils";

interface ContestCardProps {
    contest: CFContest;
    showCountdown?: boolean;
}

export function ContestCard({ contest, showCountdown = true }: ContestCardProps) {
    const startTime = new Date(contest.startTimeSeconds! * 1000);
    const endTime = new Date((contest.startTimeSeconds! + contest.durationSeconds) * 1000);
    const isCoding = contest.phase === "CODING";
    const isBefore = contest.phase === "BEFORE";
    const isFinished = contest.phase === "FINISHED";

    const durationHours = Math.floor(contest.durationSeconds / 3600);
    const durationMinutes = (contest.durationSeconds % 3600) / 60;

    return (
        <Card className={cn(
            "flex flex-col h-full border-l-4 transition-all hover:shadow-md",
            isCoding ? "border-l-green-500 shadow-green-500/5 bg-green-500/5" :
                isBefore ? "border-l-primary" :
                    "border-l-zinc-300 dark:border-l-zinc-700 opacity-80 hover:opacity-100"
        )}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <Badge
                        variant={isCoding ? "default" : "secondary"}
                        className={cn(
                            "font-bold tracking-wide",
                            isCoding && "bg-green-600 hover:bg-green-700 animate-pulse"
                        )}
                    >
                        {isCoding ? "LIVE NOW" : isBefore ? "UPCOMING" : "FINISHED"}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        #{contest.id}
                    </span>
                </div>
                <Link href={`/contests/${contest.id}`} className="hover:text-primary transition-colors">
                    <CardTitle className="text-lg leading-tight mt-3 line-clamp-2" title={contest.name}>
                        {formatContestName(contest.name, contest.id)}
                    </CardTitle>
                </Link>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
                {isBefore && showCountdown && (
                    <div className="py-2 bg-background/50 rounded-lg border border-border/50 flex justify-center">
                        <ContestCountdown targetTimeSeconds={contest.startTimeSeconds!} />
                    </div>
                )}

                <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        <span className="font-medium text-foreground/80">{formatIST(startTime, "dd/MM/yyyy")}</span>
                        <span className="text-xs">at {formatIST(startTime, "HH:mm")} IST</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary/70" />
                        <span className="font-medium text-foreground/80">
                            {durationHours}h {durationMinutes > 0 && `${durationMinutes}m`}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                            Duration
                        </span>
                    </div>

                    {isCoding && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                            <Timer className="w-4 h-4" />
                            <span>Ends {formatDistanceToNow(endTime, { addSuffix: true })}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                <Button
                    className={cn("w-full font-bold gap-2 shadow-sm", isCoding ? "bg-green-600 hover:bg-green-700" : "")}
                    variant={isFinished ? "outline" : "default"}
                    asChild
                >
                    <Link href={`/contests/${contest.id}`}>
                        {isCoding ? "Enter Contest" : isBefore ? "Register / details" : "View Details"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
