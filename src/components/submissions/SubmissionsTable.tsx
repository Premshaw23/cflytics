"use client";

import { useState } from "react";
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
import { ExternalLink, Check, X, Clock, AlertTriangle } from "lucide-react";
import { CFSubmission } from "@/types";

interface SubmissionsTableProps {
    submissions: CFSubmission[];
    isLoading?: boolean;
}

export function SubmissionsTable({ submissions, isLoading }: SubmissionsTableProps) {
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;

    const totalPages = Math.ceil(submissions.length / itemsPerPage);
    const startIdx = (page - 1) * itemsPerPage;
    const currentSubmissions = submissions.slice(startIdx, startIdx + itemsPerPage);

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case "OK": return {
                badge: "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
                icon: <Check className="w-3 h-3 mr-1.5" />
            };
            case "WRONG_ANSWER": return {
                badge: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
                icon: <X className="w-3 h-3 mr-1.5" />
            };
            case "TIME_LIMIT_EXCEEDED": return {
                badge: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",
                icon: <Clock className="w-3 h-3 mr-1.5" />
            };
            case "MEMORY_LIMIT_EXCEEDED": return {
                badge: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20",
                icon: <AlertTriangle className="w-3 h-3 mr-1.5" />
            };
            default: return {
                badge: "bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700",
                icon: null
            };
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-16 bg-zinc-900/40 border border-white/5 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[24px] overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-white/5 hover:bg-transparent">
                                <TableHead className="w-[100px] font-black uppercase tracking-widest text-[10px] text-zinc-500 h-14 pl-6">ID</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-500 h-14">Challenge</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-500 h-14">Language</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-500 h-14">Status</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-500 h-14">Runtime</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] text-zinc-500 h-14">Memory</TableHead>
                                <TableHead className="text-right font-black uppercase tracking-widest text-[10px] text-zinc-500 h-14 pr-6">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentSubmissions.map((sub) => {
                                const style = getVerdictStyle(sub.verdict || "TESTING");
                                return (
                                    <TableRow key={sub.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                        <TableCell className="font-mono text-xs font-bold text-zinc-500 pl-6 group-hover:text-primary transition-colors">
                                            <a
                                                href={`https://codeforces.com/contest/${sub.contestId}/submission/${sub.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5"
                                            >
                                                #{sub.id} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <a
                                                    href={`https://codeforces.com/contest/${sub.contestId}/problem/${sub.problem.index}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-bold text-sm text-zinc-200 hover:text-white transition-colors line-clamp-1"
                                                >
                                                    {sub.problem.index}. {sub.problem.name}
                                                </a>
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {sub.problem.tags.slice(0, 3).map(tag => (
                                                        <span key={tag} className="text-[9px] font-bold uppercase tracking-wider bg-zinc-800/50 border border-white/5 px-1.5 py-0.5 rounded text-zinc-500">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-zinc-400">
                                            {sub.programmingLanguage}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 ${style.badge} transition-all`}>
                                                {style.icon}
                                                {sub.verdict ? sub.verdict.replace(/_/g, " ") : "TESTING"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-mono font-medium text-zinc-400">
                                            {sub.timeConsumptionMillis} ms
                                        </TableCell>
                                        <TableCell className="text-xs font-mono font-medium text-zinc-400">
                                            {(sub.memoryConsumptionBytes / 1024).toFixed(0)} KB
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-zinc-500 pr-6">
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
                <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        Viewing {startIdx + 1}-{Math.min(startIdx + itemsPerPage, submissions.length)} of {submissions.length} records
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-8 text-[10px] font-black uppercase tracking-widest bg-zinc-900 border-white/10 hover:bg-white hover:text-black hover:border-white transition-all"
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                // Simple logic to show some page numbers around current page could be added here
                                // For now, just a simplified indicator
                                return null;
                            })}
                            <span className="text-xs font-black text-zinc-500">Page {page} / {totalPages}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="h-8 text-[10px] font-black uppercase tracking-widest bg-zinc-900 border-white/10 hover:bg-white hover:text-black hover:border-white transition-all"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
