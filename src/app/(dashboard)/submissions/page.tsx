import { Metadata } from "next";
import { Suspense } from "react";
import SubmissionsClient from "./SubmissionsClient";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const metadata: Metadata = {
    title: "Submission History",
    description: "Explore detailed submission history for any Codeforces user. Analyze verdicts, programming languages, and execution metrics.",
};

export default function SubmissionsPage() {
    return (
        <Suspense fallback={<LoadingSpinner label="Loading submissions..." />}>
            <SubmissionsClient />
        </Suspense>
    );
}
