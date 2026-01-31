"use client";

import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink, Calendar, Search, Edit3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { NoteDialog } from "@/components/problems/NoteDialog";
import { formatIST } from "@/lib/utils/date-utils";
import { useAuth } from "@/lib/store/useAuth";
import { guestStorage } from "@/lib/storage/guest";

interface Note {
    id: string;
    problemId: string;
    content: string;
    updatedAt: string;
}

export default function NotesClient() {
    const [handle, setHandle] = useState<string | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const authStatus = useAuth((s) => s.status);
    const authUser = useAuth((s) => s.user);
    const isConnected = authStatus === "connected";

    useEffect(() => {
        const saved = localStorage.getItem("codey_active_handle");
        setHandle(saved || "");
    }, []);

    useEffect(() => {
        if (authStatus === "loading") return;
        const effectiveHandle = isConnected ? (authUser?.handle ?? "") : (handle ?? "");
        if (!effectiveHandle) {
            setIsLoading(false);
            return;
        }
        fetchNotes(effectiveHandle);
    }, [authStatus, isConnected, authUser?.handle, handle]);

    const fetchNotes = async (effectiveHandle: string) => {
        setIsLoading(true);
        setIsError(false);
        try {
            if (isConnected) {
                const res = await fetch(`/api/notes`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setNotes(data.notes || []);
            } else {
                setNotes(guestStorage.notes.list(effectiveHandle));
            }
        } catch (err) {
            console.error(err);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredNotes = notes.filter(note =>
        note.problemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authStatus === "loading") return <LoadingSpinner label="Loading..." />;

    const effectiveHandle = isConnected ? (authUser?.handle ?? "") : (handle ?? "");

    if (!effectiveHandle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Personal Notes</h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isConnected ? "Connect a Codeforces handle to sync notes across devices." : "Set your handle to start tracking your progress."}
                    </p>
                </div>
                <Button onClick={() => router.push(isConnected ? "/connect" : "/")}>
                    {isConnected ? "Connect Account" : "Set Handle"}
                </Button>
            </div>
        );
    }

    if (isLoading) return <LoadingSpinner label="Compiling your notes..." />;
    if (isError) return <ErrorState message="Could not load your notes. Please try again." onRetry={() => fetchNotes(effectiveHandle)} />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
                        <FileText className="w-8 h-8 text-primary" /> My Study Notes
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm">
                        Documenting strategies and reflections for <span className="text-primary font-bold">@{effectiveHandle}</span>
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search notes..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {notes.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Edit3 className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold">Your notebook is empty</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                                Add notes to problems in the Problem Explorer or Recommendations to see them collected here.
                            </p>
                        </div>
                        <Button variant="outline" className="font-bold" onClick={() => router.push("/problems")}>
                            Explore Problems
                        </Button>
                    </CardContent>
                </Card>
            ) : filteredNotes.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">
                        No notes found matching &quot;{searchQuery}&quot;
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredNotes.map((note) => (
                        <Card key={note.id} className="border-border/50 hover:border-primary/30 transition-all">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono">{note.problemId}</Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                            <Calendar className="w-3 h-3" />
                                            Updated {formatIST(new Date(note.updatedAt), "dd/MM/yyyy")} IST
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl font-bold">Reflections on {note.problemId}</CardTitle>
                                </div>
                                <div className="flex gap-2">
                                    <NoteDialog
                                        handle={effectiveHandle}
                                        problemId={note.problemId}
                                        problemName={`Problem ${note.problemId}`}
                                    />
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild title="View on Codeforces">
                                        <a
                                            href={`https://codeforces.com/problemset/problem/${note.problemId.replace(/[A-Z]+$/, '')}/${note.problemId.match(/[A-Z]+$/)?.[0]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                                        {note.content}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
