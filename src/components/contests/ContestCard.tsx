"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { formatIST } from "@/lib/utils/date-utils";
import { Calendar, Clock, ExternalLink, Trophy, Timer, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContestCountdown } from "./ContestCountdown";
import { CFContest } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatContestName } from "@/lib/utils/contest-utils";
import { motion } from "framer-motion";

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
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
        >
            <Card className={cn(
                "group relative flex flex-col h-full bg-zinc-900/60 border-white/[0.03] overflow-hidden transition-all duration-500 backdrop-blur-xl hover:border-white/10 hover:shadow-2xl hover:shadow-black/60",
                isCoding && "border-green-500/30 bg-green-500/[0.03]"
            )}>
                {/* Dynamic Accent Line */}
                <div className={cn(
                    "absolute top-0 left-0 w-full h-[2px] transition-all duration-700",
                    isCoding ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]" :
                        isBefore ? "bg-zinc-800 group-hover:bg-primary/50" : "bg-zinc-900"
                )} />

                <CardHeader className="pt-10 pb-6 px-8 space-y-5">
                    <div className="flex justify-between items-center">
                        <Badge
                            className={cn(
                                "font-black tracking-[0.2em] text-[10px] uppercase px-3.5 py-1.5 rounded-full",
                                isCoding ? "bg-green-600 text-white animate-pulse shadow-lg shadow-green-500/20" :
                                    isBefore ? "bg-white text-black" : "bg-zinc-800 text-zinc-500 border border-white/5"
                            )}
                        >
                            {isCoding ? "LIVE" : isBefore ? "UPCOMING" : "FINISHED"}
                        </Badge>
                        <span className="text-[10px] font-black font-mono text-zinc-700 tracking-[0.2em] bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 uppercase">
                            #{contest.id}
                        </span>
                    </div>

                    <Link href={`/contests/${contest.id}`} className="block group/title">
                        <CardTitle className="text-2xl font-black tracking-tighter leading-[1.1] text-white transition-all group-hover/title:text-primary line-clamp-2 min-h-[2.2em]">
                            {formatContestName(contest.name, contest.id)}
                        </CardTitle>
                    </Link>
                </CardHeader>

                <CardContent className="px-8 pb-8 pt-0 space-y-8 flex-grow">
                    {isBefore && showCountdown && (
                        <div className="py-4 bg-black/40 rounded-[20px] border border-white/5 flex items-center justify-center shadow-xl relative overflow-hidden group/countdown">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover/countdown:opacity-100 transition-opacity duration-700" />
                            <ContestCountdown targetTimeSeconds={contest.startTimeSeconds!} className="relative z-10" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center gap-4 group/item">
                            <div className="w-10 h-10 rounded-xl bg-zinc-950/50 border border-white/5 flex items-center justify-center shrink-0 group-hover/item:border-white/10 transition-colors">
                                <Calendar className="w-5 h-5 text-zinc-600 group-hover/item:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] leading-none mb-1.5">Launch Schedule</span>
                                <span className="text-sm font-bold text-zinc-400 group-hover/item:text-white transition-colors">
                                    {formatIST(startTime, "MMM d, yyyy")} <span className="text-zinc-600 font-medium ml-1">@ {formatIST(startTime, "HH:mm")} IST</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group/item">
                            <div className="w-10 h-10 rounded-xl bg-zinc-950/50 border border-white/5 flex items-center justify-center shrink-0 group-hover/item:border-white/10 transition-colors">
                                <Clock className="w-5 h-5 text-zinc-600 group-hover/item:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] leading-none mb-1.5">Competition Window</span>
                                <span className="text-sm font-bold text-zinc-400 group-hover/item:text-white transition-colors">
                                    {durationHours}H {durationMinutes > 0 && `${durationMinutes}M`}
                                </span>
                            </div>
                        </div>

                        {isCoding && (
                            <div className="flex items-center gap-4 py-3 px-4 bg-green-500/5 rounded-2xl border border-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.02)]">
                                <Timer className="w-5 h-5 text-green-500 animate-spin-slow" />
                                <span className="text-xs font-black text-green-500/80 uppercase tracking-widest">
                                    Finalizing in {formatDistanceToNow(endTime, { addSuffix: false })}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="p-0 border-t border-white/[0.03]">
                    <Button
                        className={cn(
                            "w-full h-20 rounded-none text-[11px] font-black tracking-[0.3em] uppercase transition-all duration-500 gap-4 group/btn overflow-hidden relative",
                            isCoding ? "bg-green-600 hover:bg-green-700 text-white" :
                                isFinished ? "bg-transparent hover:bg-zinc-900 text-zinc-600 hover:text-white" :
                                    "bg-white text-black hover:bg-zinc-100 shadow-2xl"
                        )}
                        asChild
                    >
                        <Link href={`/contests/${contest.id}`}>
                            <span className="relative z-10">{isCoding ? "JOIN ARENA" : isBefore ? "SECURE ACCESS" : "REVIEW METRICS"}</span>
                            <ChevronRight className="w-5 h-5 relative z-10 transition-transform duration-500 group-hover/btn:translate-x-2" />
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
