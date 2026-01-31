import { Metadata } from "next";
import { Suspense } from "react";
import GoalsClient from "./GoalsClient";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const metadata: Metadata = {
    title: "Personal Goals",
    description: "Set and track your Codeforces achievements. Define targets for rating, problems solved, or contest rank and monitor your progress over time.",
};

export default function GoalsPage() {
    return (
        <Suspense fallback={<LoadingSpinner label="Loading goals..." />}>
            <GoalsClient />
        </Suspense>
    );
}
