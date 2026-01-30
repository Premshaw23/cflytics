"use client";

import { useState } from "react";
import { format } from "date-fns";
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

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case "OK": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "WRONG_ANSWER": return "bg-red-500/10 text-red-500 border-red-500/20";
            case "TIME_LIMIT_EXCEEDED": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "MEMORY_LIMIT_EXCEEDED": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    const getVerdictIcon = (verdict: string) => {
        switch (verdict) {
            case "OK": return <Check className="w-3 h-3 mr-1" />;
            case "WRONG_ANSWER": return <X className="w-3 h-3 mr-1" />;
            case "TIME_LIMIT_EXCEEDED": return <Clock className="w-3 h-3 mr-1" />;
            case "MEMORY_LIMIT_EXCEEDED": return <AlertTriangle className="w-3 h-3 mr-1" />;
            default: return null;
        }
    };

    if (isLoading) {
        return <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-md" />
            ))}
        </div>;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border border-border/50">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Problem</TableHead>
                            <TableHead>Lang</TableHead>
                            <TableHead>Verdict</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Memory</TableHead>
                            <TableHead className="text-right">Submitted</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentSubmissions.map((sub) => (
                            <TableRow key={sub.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    <a
                                        href={`https://codeforces.com/contest/${sub.contestId}/submission/${sub.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:underline flex items-center gap-1"
                                    >
                                        {sub.id} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={`https://codeforces.com/contest/${sub.contestId}/problem/${sub.problem.index}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:underline font-medium text-primary"
                                    >
                                        {sub.problem.index} - {sub.problem.name}
                                    </a>
                                    <div className="flex gap-1 mt-1 flex-wrap">
                                        {sub.problem.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {sub.programmingLanguage}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`font-normal ${getVerdictColor(sub.verdict || "TESTING")}`}>
                                        {getVerdictIcon(sub.verdict || "TESTING")}
                                        {sub.verdict ? sub.verdict.replace(/_/g, " ") : "TESTING"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm font-mono text-muted-foreground">
                                    {sub.timeConsumptionMillis} ms
                                </TableCell>
                                <TableCell className="text-sm font-mono text-muted-foreground">
                                    {(sub.memoryConsumptionBytes / 1024).toFixed(0)} KB
                                </TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">
                                    {format(new Date(sub.creationTimeSeconds * 1000), "MMM d, HH:mm")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {startIdx + 1}-{Math.min(startIdx + itemsPerPage, submissions.length)} of {submissions.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
