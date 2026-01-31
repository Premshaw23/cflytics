"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function ProfileRedirect() {
    const router = useRouter();

    useEffect(() => {
        const handle = localStorage.getItem("codey_active_handle");
        if (handle) {
            router.replace(`/profile/${handle}`);
        } else {
            // If no handle is set, send them to settings
            router.replace("/settings");
        }
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner label="Redirecting to profile..." />
        </div>
    );
}
