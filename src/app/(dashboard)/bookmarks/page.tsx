import { Metadata } from "next";
import { Suspense } from "react";
import BookmarksClient from "./BookmarksClient";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const metadata: Metadata = {
    title: "Bookmarked Problems",
    description: "Your saved Codeforces problems. Keep track of challenges you want to solve later or revisit.",
};

export default function BookmarksPage() {
    return (
        <Suspense fallback={<LoadingSpinner label="Loading your bookmarks..." />}>
            <BookmarksClient />
        </Suspense>
    );
}
