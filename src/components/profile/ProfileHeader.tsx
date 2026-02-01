"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Building2, Users, Star, ExternalLink, Heart, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/components/shared/LoadingSpinner";
import { getRatingColor, getRatingBadgeClass } from "@/lib/utils/rating-colors";
import { CFUser } from "@/types";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/store/useAuth";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
    user?: CFUser;
    isLoading: boolean;
}

export function ProfileHeader({ user, isLoading }: ProfileHeaderProps) {
    const router = useRouter();
    const authStatus = useAuth((s) => s.status);
    const authUser = useAuth((s) => s.user);
    const logout = useAuth((s) => s.logout);
    const isConnected = authStatus === "connected" && !!authUser?.handle;

    const [activeHandle, setActiveHandle] = useState<string>("");

    useEffect(() => {
        const update = () => {
            const current = localStorage.getItem("codey_active_handle") || "";
            setActiveHandle(current);
        };

        // Defer to avoid SSR access + satisfy react-hooks/set-state-in-effect rule
        const id = setTimeout(update, 0);
        window.addEventListener("storage", update);
        return () => {
            clearTimeout(id);
            window.removeEventListener("storage", update);
        };
    }, []);

    const connectedHandle = isConnected ? (authUser?.handle ?? "") : "";
    const isMyAccount = !!user && !!connectedHandle && user.handle === connectedHandle;
    const isActiveAnalysis = !!user && !!activeHandle && user.handle === activeHandle;
    const isViewingOtherWhileConnected = !!user && !!connectedHandle && !isMyAccount;

    const setAsActive = () => {
        if (user) {
            localStorage.setItem("codey_active_handle", user.handle);
            setActiveHandle(user.handle);
            window.dispatchEvent(new Event('storage')); // Notify other components
        }
    };

    const backToMyHandle = () => {
        if (!connectedHandle) return;
        localStorage.setItem("codey_active_handle", connectedHandle);
        setActiveHandle(connectedHandle);
        window.dispatchEvent(new Event("storage"));
        router.push(`/profile/${connectedHandle}`);
    };

    const switchConnectedAccount = async () => {
        if (!user) return;
        if (isMyAccount) return;

        const ok = confirm(
            `You are currently connected as @${connectedHandle || "unknown"}.\n\nSwitch connected account to @${user.handle}? This will log you out and you will need to verify @${user.handle}.`
        );
        if (!ok) return;

        await logout();
        localStorage.setItem("codey_active_handle", user.handle);
        router.push(`/connect?handle=${encodeURIComponent(user.handle)}`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col md:flex-row gap-6 items-start animate-pulse">
                <SkeletonLoader className="w-32 h-32 rounded-full" />
                <div className="space-y-4 flex-1 w-full">
                    <SkeletonLoader className="h-8 w-64" />
                    <SkeletonLoader className="h-5 w-40" />
                    <div className="flex gap-4">
                        <SkeletonLoader className="h-6 w-24" />
                        <SkeletonLoader className="h-6 w-24" />
                        <SkeletonLoader className="h-6 w-24" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="relative overflow-hidden rounded-[32px] bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-2xl p-8 lg:p-10 group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-start md:items-center">
                {/* Avatar Section */}
                <div className="relative shrink-0">
                    <div className={`absolute -inset-1 rounded-full blur-xl opacity-40 animate-pulse ${getRatingBadgeClass(user.rating).replace('bg-', 'bg-').split(' ')[1]}`} />
                    <div className={cn(
                        "relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 bg-zinc-100 dark:bg-zinc-950 shadow-2xl",
                        user.rating >= 3000 ? "border-red-600" :
                            user.rating >= 2400 ? "border-red-500" :
                                user.rating >= 2100 ? "border-orange-500" :
                                    user.rating >= 1900 ? "border-violet-500" :
                                        "border-zinc-200 dark:border-white/10"
                    )}>
                        <Image
                            src={user.titlePhoto || "https://userpic.codeforces.org/no-title.jpg"}
                            alt={user.handle}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 space-y-4 w-full">
                    {isViewingOtherWhileConnected && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
                            <div className="text-sm">
                                <span className="text-muted-foreground font-bold">Connected as</span>{" "}
                                <span className="font-black">@{connectedHandle}</span>
                                <span className="text-muted-foreground font-bold"> • Viewing</span>{" "}
                                <span className="font-black text-primary">@{user.handle}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    className="h-9 font-bold"
                                    onClick={backToMyHandle}
                                    title={`Back to your profile (@${connectedHandle})`}
                                >
                                    Back to @{connectedHandle}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-4 flex-wrap">
                                <h1 className={cn("text-4xl lg:text-5xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white", getRatingColor(user.rating))}>
                                    {user.handle}
                                </h1>
                                {user.rating >= 2400 && (
                                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 uppercase tracking-widest font-black text-[10px] px-2 py-1">
                                        Grandmaster
                                    </Badge>
                                )}
                                {isMyAccount && (
                                    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 uppercase tracking-widest font-black text-[10px] px-2 py-1">
                                        This is your account
                                    </Badge>
                                )}
                                {isActiveAnalysis && !isMyAccount && (
                                    <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/30 uppercase tracking-widest font-black text-[10px] px-2 py-1">
                                        Active analysis
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-lg font-medium text-zinc-500 dark:text-zinc-400">
                                {user.rank && <span className={cn("capitalize font-bold", getRatingColor(user.rating))}>{user.rank}</span>}
                                {user.maxRating && (
                                    <span className="text-zinc-500 dark:text-zinc-600 font-bold text-sm tracking-widest uppercase">
                                        • Max Rating: <span className={getRatingColor(user.maxRating)}>{user.maxRating}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Button
                                variant={isActiveAnalysis ? "secondary" : "outline"}
                                className={cn(
                                    "flex-1 sm:flex-initial rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs h-10 sm:h-12 px-4 sm:px-6 transition-all",
                                    !isActiveAnalysis && "bg-zinc-900 border-white/10 hover:border-white/20 hover:bg-zinc-800 text-white dark:bg-zinc-900 dark:border-white/10 dark:hover:bg-white dark:hover:text-black"
                                )}
                                onClick={setAsActive}
                                disabled={isActiveAnalysis}
                            >
                                {isActiveAnalysis ? (
                                    <><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Active</>
                                ) : (
                                    <><Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Set active</>
                                )}
                            </Button>

                            {isConnected && !isMyAccount && (
                                <Button
                                    variant="outline"
                                    className="flex-1 sm:flex-initial rounded-xl font-bold uppercase tracking-widest text-[10px] sm:text-xs h-10 sm:h-12 px-4 sm:px-6"
                                    onClick={switchConnectedAccount}
                                >
                                    Switch
                                </Button>
                            )}

                            <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-zinc-900 border-white/10 hover:bg-zinc-800 text-white dark:bg-zinc-900 dark:border-white/10 dark:hover:bg-white dark:hover:text-black shrink-0" asChild>
                                <a href={`https://codeforces.com/profile/${user.handle}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
                        {(user.firstName || user.lastName) && (
                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">
                                <Users className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                                {user.firstName} {user.lastName}
                            </div>
                        )}
                        {user.organization && (
                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">
                                <Building2 className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                                {user.organization}
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">
                            <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                            {user.city || "Unknown City"}, {user.country || "Earth"}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">
                            <Star className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                            Contribution: <span className={user.contribution >= 0 ? "text-green-500" : "text-red-500"}>{user.contribution > 0 ? "+" : ""}{user.contribution}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

