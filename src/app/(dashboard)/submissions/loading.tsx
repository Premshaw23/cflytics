import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubmissionsLoading() {
    return (
        <div className="space-y-12 pb-20 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-5">
                        <Skeleton className="w-3 h-14 bg-primary/20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-64 rounded-xl" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-32 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-muted/20 p-4 rounded-[28px] border border-border/50">
                    <Skeleton className="h-14 w-32 rounded-2xl" />
                    <Skeleton className="h-14 w-32 rounded-2xl" />
                    <Skeleton className="h-14 w-32 rounded-2xl" />
                    <div className="h-10 w-px bg-border/50 mx-2 hidden md:block" />
                    <Skeleton className="h-14 w-48 rounded-2xl" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="glass rounded-[32px] p-1 border-none shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <Skeleton className="h-3 w-24 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-xl" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-20 rounded-lg" />
                            <Skeleton className="h-1.5 w-full rounded-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-10 items-start">
                <div className="xl:col-span-3 space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-64 rounded-lg" />
                    </div>
                    <div className="glass rounded-[32px] p-4 space-y-4">
                        {[...Array(10)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                        ))}
                    </div>
                </div>

                <div className="xl:col-span-1 space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-32 rounded-lg" />
                    </div>
                    <Skeleton className="h-[400px] w-full glass rounded-[32px]" />
                </div>
            </div>
        </div>
    );
}
