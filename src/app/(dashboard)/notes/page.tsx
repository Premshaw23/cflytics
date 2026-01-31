import { Metadata } from "next";
import { Suspense } from "react";
import NotesClient from "./NotesClient";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const metadata: Metadata = {
    title: "My Study Notes",
    description: "Keep track of your problem-solving approaches, patterns, and lessons learned from Codeforces problems.",
};

export default function NotesPage() {
    return (
        <Suspense fallback={<LoadingSpinner label="Loading your notes..." />}>
            <NotesClient />
        </Suspense>
    );
}
