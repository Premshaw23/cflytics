"use client";

import { useState } from "react";
import Link from "next/link";
import { formatIST } from "@/lib/utils/date-utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, X, Clock, AlertTriangle, Code2 } from "lucide-react";
import { CFSubmission } from "@/types";

interface SubmissionsTableProps {
    submissions: CFSubmission[];
    isLoading?: boolean;
}

export function SubmissionsTable({ submissions, isLoading }: SubmissionsTableProps) {
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(submissions.length / itemsPerPage);
    const startIdx = (page - 1) * itemsPerPage;
    const currentSubmissions = submissions.slice(startIdx, startIdx + itemsPerPage);

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case "OK": return {
                badge: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500 border-green-200 dark:border-green-500/20 hover:bg-green-200 dark:hover:bg-green-500/20",
                icon: <Check className="w-3 h-3 mr-1.5" />
            };
            case "WRONG_ANSWER": return {
                badge: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500 border-red-200 dark:border-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/20",
                icon: <X className="w-3 h-3 mr-1.5" />
            };
            case "TIME_LIMIT_EXCEEDED": return {
                badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 border-amber-200 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/20",
                icon: <Clock className="w-3 h-3 mr-1.5" />
            };
            case "MEMORY_LIMIT_EXCEEDED": return {
                badge: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500 border-orange-200 dark:border-orange-500/20 hover:bg-orange-200 dark:hover:bg-orange-500/20",
                icon: <AlertTriangle className="w-3 h-3 mr-1.5" />
            };
            default: return {
                badge: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                icon: null
            };
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-16 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto overflow-y-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/50 hover:bg-transparent h-16 bg-muted/30">
                                <TableHead className="w-[140px] font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground pl-10">Archive #</TableHead>
                                <TableHead className="min-w-[300px] font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Challenge Node</TableHead>
                                <TableHead className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Protocol</TableHead>
                                <TableHead className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Execution</TableHead>
                                <TableHead className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">MS/KB</TableHead>
                                <TableHead className="w-[100px] font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-center">IDE</TableHead>
                                <TableHead className="text-right font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground pr-10">Synchronized</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentSubmissions.map((sub) => {
                                const style = getVerdictStyle(sub.verdict || "TESTING");
                                const problemId = `${sub.contestId}${sub.problem.index}`;
                                return (
                                    <TableRow key={sub.id} className="border-b border-border/10 hover:bg-primary/[0.02] transition-colors group h-20">
                                        <TableCell className="font-mono text-[10px] font-black text-muted-foreground/50 pl-10 group-hover:text-primary transition-colors">
                                            <a
                                                href={`https://codeforces.com/contest/${sub.contestId}/submission/${sub.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2"
                                            >
                                                #{sub.id} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <a
                                                    href={`https://codeforces.com/contest/${sub.contestId}/problem/${sub.problem.index}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-black text-[13px] text-foreground hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight"
                                                >
                                                    {sub.problem.index}. {sub.problem.name}
                                                </a>
                                                <div className="flex gap-2">
                                                    {sub.problem.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[8px] font-black uppercase tracking-widest bg-muted/50 text-muted-foreground/60 px-2 py-0.5 rounded-full border border-border/50">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {sub.problem.tags.length > 2 && (
                                                        <span className="text-[8px] font-black text-muted-foreground/30 self-center">
                                                            +{sub.problem.tags.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                            {sub.programmingLanguage}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full border-none shadow-sm transition-all ${style.badge}`}>
                                                {style.icon}
                                                {sub.verdict ? sub.verdict.replace(/_/g, " ") : "TESTING"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-mono font-bold text-muted-foreground/60">
                                            <div className="flex flex-col">
                                                <span>{sub.timeConsumptionMillis}ms</span>
                                                <span className="opacity-50">{(sub.memoryConsumptionBytes / 1024).toFixed(0)}KB</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                                                title="Open in IDE"
                                            >
                                                <Link href={`/compiler?problemId=${problemId}`}>
                                                    <Code2 className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right text-[10px] font-black text-muted-foreground/40 pr-10 uppercase tracking-tighter">
                                            {formatIST(sub.creationTimeSeconds * 1000, "MMM dd, HH:mm")}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Revealing <span className="text-foreground">{startIdx + 1}-{Math.min(startIdx + itemsPerPage, submissions.length)}</span> of <span className="text-primary">{submissions.length}</span> Records
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setPage(p => Math.max(1, p - 1));
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            disabled={page === 1}
                            className="h-10 px-6 font-black uppercase tracking-widest text-[10px] rounded-2xl border-border/50 hover:bg-primary hover:text-primary-foreground transition-all shadow-xl shadow-primary/5"
                        >
                            Prev
                        </Button>
                        <div className="bg-muted/40 h-10 px-6 flex items-center justify-center rounded-2xl border border-border/50 text-[10px] font-black tracking-widest text-primary min-w-[100px]">
                            {page} / {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setPage(p => Math.min(totalPages, p + 1));
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            disabled={page === totalPages}
                            className="h-10 px-6 font-black uppercase tracking-widest text-[10px] rounded-2xl border-border/50 hover:bg-primary hover:text-primary-foreground transition-all shadow-xl shadow-primary/5"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
