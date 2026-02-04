"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/lib/store/useAuth";

export default function ProfileRedirect() {
    const router = useRouter();
    const authStatus = useAuth((s) => s.status);
    const authUser = useAuth((s) => s.user);

    useEffect(() => {
        // If connected, `/profile` should always mean "my profile"
        if (authStatus === "connected" && authUser?.handle) {
            router.replace(`/profile/${authUser.handle}`);
            return;
        }

        const handle = localStorage.getItem("cflytics_active_handle");
        router.replace(handle ? `/profile/${handle}` : "/settings");
    }, [router, authStatus, authUser?.handle]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner label="Redirecting to profile..." />
        </div>
    );
}
