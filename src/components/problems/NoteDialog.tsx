"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/store/useAuth";
import { guestStorage } from "@/lib/storage/guest";

interface NoteDialogProps {
    handle: string;
    problemId: string;
    problemName: string;
}

export function NoteDialog({ handle, problemId, problemName }: NoteDialogProps) {
    const [note, setNote] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const authStatus = useAuth((s) => s.status);
    const isConnected = authStatus === "connected";

    useEffect(() => {
        if (isOpen && handle && problemId) {
            fetchNote();
        }
    }, [isOpen, handle, problemId]);

    const fetchNote = async () => {
        setIsLoading(true);
        try {
            if (isConnected) {
                const res = await fetch(`/api/notes?problemId=${problemId}`);
                const data = await res.json();
                if (data.note) {
                    setNote(data.note.content);
                } else {
                    setNote("");
                }
            } else {
                if (!handle) {
                    setNote("");
                } else {
                    const existing = guestStorage.notes.get(handle, problemId);
                    setNote(existing?.content ?? "");
                }
            }
        } catch (err) {
            console.error("Failed to fetch note", err);
        } finally {
            setIsLoading(false);
        }
    };

    const saveNote = async () => {
        setIsSaving(true);
        try {
            if (isConnected) {
                const res = await fetch("/api/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ problemId, content: note }),
                });
                if (!res.ok) throw new Error("Failed to save");
            } else {
                if (!handle) throw new Error("No handle set");
                guestStorage.notes.upsert(handle, problemId, note);
            }

            toast.success("Note saved successfully");
            setIsOpen(false);
        } catch (err) {
            toast.error("Failed to save note");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary transition-colors"
                    title="Add/Edit Note"
                >
                    <FileText className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Notes for {problemId}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm font-bold mb-3">{problemName}</p>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Textarea
                            placeholder="Record your thoughts, approach, or complexity here..."
                            className="min-h-[200px] font-medium leading-relaxed"
                            value={note}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                        />
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={saveNote} disabled={isSaving || isLoading} className="font-bold gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Note
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
