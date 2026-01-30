"use client";

import React from "react";
import {
    BarChart,
    TrendingUp,
    Users,
    CheckCircle2,
    Clock,
    Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardOverview() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
                <p className="text-muted-foreground font-medium">Welcome back! Here's a summary of your performance.</p>
            </div>

            {/* Basic Stats Preview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Problems Solved", value: "342", icon: CheckCircle2, color: "text-green-500", trend: "+12 this week" },
                    { title: "Current Rating", value: "1582", icon: BarChart, color: "text-blue-500", trend: "+45 last contest" },
                    { title: "Contests", value: "24", icon: Trophy, color: "text-purple-500", trend: "Expert Rank" },
                    { title: "Current Streak", value: "12 Days", icon: Clock, color: "text-orange-500", trend: "Personal Best" },
                ].map((stat, i) => (
                    <Card key={i} className="border-border/50 hover:border-primary/20 transition-all group shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-semibold">{stat.trend}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-border/50">
                    <CardHeader>
                        <CardTitle>Activity Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg m-4 opacity-50">
                        <p className="text-sm font-medium">Activity Chart Visualization Coming Soon</p>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-border/50">
                    <CardHeader>
                        <CardTitle>Recent Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-zinc-100/50 dark:bg-zinc-800/50 group hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold group-hover:text-primary transition-colors cursor-pointer">Dynamic Programming Basic</p>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-[10px] py-0">DP</Badge>
                                            <Badge variant="outline" className="text-[10px] py-0 text-cf-cyan border-cf-cyan/30">1400</Badge>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-zinc-300 group-hover:text-green-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
