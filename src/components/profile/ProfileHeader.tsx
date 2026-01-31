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

interface ProfileHeaderProps {
    user?: CFUser;
    isLoading: boolean;
}

export function ProfileHeader({ user, isLoading }: ProfileHeaderProps) {
    const [isMyHandle, setIsMyHandle] = useState(false);

    useEffect(() => {
        if (user) {
            const active = localStorage.getItem("codey_active_handle");
            setIsMyHandle(active === user.handle);
        }
    }, [user]);

    const setAsActive = () => {
        if (user) {
            localStorage.setItem("codey_active_handle", user.handle);
            setIsMyHandle(true);
            window.dispatchEvent(new Event('storage')); // Notify other components
        }
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
                                {isMyHandle && (
                                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 uppercase tracking-widest font-black text-[10px] px-2 py-1">
                                        Verified Owner
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

                        <div className="flex items-center gap-3">
                            <Button
                                variant={isMyHandle ? "secondary" : "outline"}
                                size="lg"
                                className={cn(
                                    "rounded-xl font-bold uppercase tracking-widest text-xs h-12 px-6 transition-all",
                                    !isMyHandle && "bg-zinc-900 border-white/10 hover:border-white/20 hover:bg-zinc-800 text-white dark:bg-zinc-900 dark:border-white/10 dark:hover:bg-white dark:hover:text-black"
                                )}
                                onClick={setAsActive}
                                disabled={isMyHandle}
                            >
                                {isMyHandle ? (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Active Profile</>
                                ) : (
                                    <><Heart className="w-4 h-4 mr-2" /> Set as Main</>
                                )}
                            </Button>

                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-zinc-900 border-white/10 hover:bg-zinc-800 text-white dark:bg-zinc-900 dark:border-white/10 dark:hover:bg-white dark:hover:text-black" asChild>
                                <a href={`https://codeforces.com/profile/${user.handle}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-5 h-5" />
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

