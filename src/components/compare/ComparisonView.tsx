"use client";

import React from "react";
import Image from "next/image";
import { ArrowLeftRight, Trophy, TrendingUp, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CFUser, CFSubmission } from "@/types";
import { getRatingColor, getRatingBadgeClass } from "@/lib/utils/rating-colors";

interface ComparisonViewProps {
    user1: CFUser;
    user2: CFUser;
    user1Submissions?: CFSubmission[];
    user2Submissions?: CFSubmission[];
}

export function ComparisonView({
    user1,
    user2,
    user1Submissions = [],
    user2Submissions = []
}: ComparisonViewProps) {

    const getSolvedCount = (subs: CFSubmission[]) =>
        new Set(subs.filter(s => s.verdict === "OK").map(s => `${s.problem.contestId}-${s.problem.index}`)).size;

    const u1Solved = getSolvedCount(user1Submissions);
    const u2Solved = getSolvedCount(user2Submissions);

    const StatRow = ({
        label,
        val1,
        val2,
        highlight = "high", // 'high' means higher is better, 'low' means lower is better
        format = (v: any) => v
    }: {
        label: string,
        val1: number | string,
        val2: number | string,
        highlight?: "high" | "low" | "none",
        format?: (v: any) => React.ReactNode
    }) => {
        let color1 = "text-foreground";
        let color2 = "text-foreground";

        if (highlight !== "none" && typeof val1 === "number" && typeof val2 === "number") {
            if (val1 > val2) {
                color1 = highlight === "high" ? "text-green-500 font-bold" : "text-red-500";
                color2 = highlight === "high" ? "text-red-500" : "text-green-500 font-bold";
            } else if (val2 > val1) {
                color1 = highlight === "high" ? "text-red-500" : "text-green-500 font-bold";
                color2 = highlight === "high" ? "text-green-500 font-bold" : "text-red-500";
            }
        }

        return (
            <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className={`w-1/3 text-center ${color1}`}>{format(val1)}</div>
                <div className="w-1/3 text-center text-xs font-bold uppercase text-muted-foreground tracking-wider">{label}</div>
                <div className={`w-1/3 text-center ${color2}`}>{format(val2)}</div>
            </div>
        );
    }

    return (
        <div className="grid gap-8">
            {/* Heads Up Display */}
            <div className="flex items-center justify-between gap-4">
                {/* User 1 */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${getRatingColor(user1.rating).replace("text-", "border-")}`}>
                        <Image src={user1.titlePhoto} alt={user1.handle} width={96} height={96} className="object-cover" />
                    </div>
                    <h2 className={`text-xl font-bold ${getRatingColor(user1.rating)}`}>{user1.handle}</h2>
                    <Badge variant="outline" className={getRatingBadgeClass(user1.rating)}>{user1.rank}</Badge>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                        <ArrowLeftRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">VS</span>
                </div>

                {/* User 2 */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${getRatingColor(user2.rating).replace("text-", "border-")}`}>
                        <Image src={user2.titlePhoto} alt={user2.handle} width={96} height={96} className="object-cover" />
                    </div>
                    <h2 className={`text-xl font-bold ${getRatingColor(user2.rating)}`}>{user2.handle}</h2>
                    <Badge variant="outline" className={getRatingBadgeClass(user2.rating)}>{user2.rank}</Badge>
                </div>
            </div>

            {/* Stats Comparison Card */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" /> Vitals Comparison
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <StatRow label="Current Rating" val1={user1.rating} val2={user2.rating} />
                    <StatRow label="Max Rating" val1={user1.maxRating} val2={user2.maxRating} />
                    <StatRow label="Problems Solved" val1={u1Solved} val2={u2Solved} />
                    <StatRow label="Contribution" val1={user1.contribution} val2={user2.contribution} />
                    <StatRow label="Friends" val1={user1.friendOfCount} val2={user2.friendOfCount} />
                    <StatRow
                        label="Registered"
                        val1={user1.registrationTimeSeconds}
                        val2={user2.registrationTimeSeconds}
                        highlight="none"
                        format={(v) => new Date(v * 1000).getFullYear()}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
