import { Metadata } from "next";
import { Suspense } from "react";
import AnalyticsClient from "./AnalyticsClient";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const metadata: Metadata = {
    title: "Performance Analytics",
    description: "Gain deep insights into your Codeforces performance. Analyze your solving activity by time of day and track your problem difficulty progression.",
};

export default function AnalyticsPage() {
    return (
        <Suspense fallback={<LoadingSpinner label="Preparing analytics..." />}>
            <AnalyticsClient />
        </Suspense>
    );
}
