"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Building2, Users, Star, ExternalLink, Heart } from "lucide-react";
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
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group shrink-0">
                <div className={`absolute -inset-0.5 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 ${getRatingBadgeClass(user.rating).replace('bg-', 'bg-').split(' ')[1]}`}></div>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl">
                    <Image
                        src={user.titlePhoto || "https://userpic.codeforces.org/no-title.jpg"}
                        alt={user.handle}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            <div className="space-y-3 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className={`text-3xl font-bold ${getRatingColor(user.rating)}`}>
                                {user.handle}
                            </h1>
                            {user.rank && (
                                <Badge variant="outline" className={`font-bold capitalize ${getRatingBadgeClass(user.rating)}`}>
                                    {user.rank}
                                </Badge>
                            )}
                            {isMyHandle && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold">
                                    My Handle
                                </Badge>
                            )}
                        </div>
                        {(user.firstName || user.lastName) && (
                            <p className="text-muted-foreground font-medium mt-1">
                                {user.firstName} {user.lastName}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {!isMyHandle && (
                            <Button
                                variant="outline"
                                className="gap-2 group"
                                onClick={setAsActive}
                            >
                                <Heart className="w-4 h-4 group-hover:fill-primary transition-colors" /> Set as Mine
                            </Button>
                        )}
                        <Button variant="outline" className="gap-2 shrink-0" asChild>
                            <a href={`https://codeforces.com/profile/${user.handle}`} target="_blank" rel="noopener noreferrer">
                                Codeforces Profile <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
                    {user.city && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span>{user.city}{user.country && `, ${user.country}`}</span>
                        </div>
                    )}
                    {user.organization && (
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            <span>{user.organization}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{user.friendOfCount.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4" />
                        <span>Contribution: <span className={user.contribution >= 0 ? "text-green-500" : "text-red-500"}>{user.contribution > 0 ? "+" : ""}{user.contribution}</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}

