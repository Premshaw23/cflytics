import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProblemsLoading() {
    return (
        <div className="space-y-12 pb-20 animate-pulse">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-80 rounded-2xl" />
                    <Skeleton className="h-5 w-96 rounded-lg" />
                </div>
                <div className="flex bg-muted/20 p-1.5 rounded-2xl border border-border/50">
                    <Skeleton className="h-10 w-28 rounded-xl" />
                    <Skeleton className="h-10 w-28 rounded-xl ml-1" />
                </div>
            </div>

            {/* Filter Section */}
            <Card className="glass border-none shadow-none rounded-[32px] overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <Skeleton className="h-14 flex-1 rounded-2xl" />
                        <div className="flex flex-wrap gap-3">
                            <Skeleton className="h-14 w-32 rounded-2xl" />
                            <Skeleton className="h-14 w-32 rounded-2xl" />
                            <Skeleton className="h-14 w-32 rounded-2xl" />
                            <Skeleton className="h-14 w-32 rounded-2xl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Section (Table Skeleton) */}
            <div className="glass rounded-[32px] overflow-hidden border-none shadow-none">
                <div className="p-8 space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-6 py-4 border-b border-border/50 last:border-0">
                            <Skeleton className="h-6 w-12 rounded-lg" />
                            <Skeleton className="h-6 flex-1 rounded-lg" />
                            <Skeleton className="h-6 w-24 rounded-lg" />
                            <Skeleton className="h-6 w-64 rounded-lg hidden md:block" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 px-4">
                <Skeleton className="h-6 w-64 rounded-lg" />
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-28 rounded-2xl" />
                    <Skeleton className="h-12 w-16 rounded-xl" />
                    <Skeleton className="h-12 w-28 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
