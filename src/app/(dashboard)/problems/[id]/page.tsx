import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Code2, ChevronLeft, Clock, Timer, Database } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

import { requireAuthUser } from '@/lib/auth/session'
import { scrapeProblem } from '@/lib/api/scraper'
import { SampleTestCases } from '@/components/problems/SampleTestCases'
import { ProblemDescription } from '@/components/problems/ProblemDescription'
import { ProblemRetryButton } from '@/components/problems/ProblemRetryButton'
import { CheckCircle2, Clock as ClockIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Fetch problem data from Codeforces
async function getProblem(id: string, force = false) {
    // Parsing id like "1234A" or "1234-A"
    const match = id.match(/^(\d+)([a-zA-Z0-9]+)$/) || id.match(/^(\d+)-([a-zA-Z0-9]+)$/)
    if (!match) return null

    const contestId = match[1]
    const index = match[2]

    const problem = await scrapeProblem(contestId, index, force)
    if (!problem) return null

    return {
        ...problem,
        contestId,
        index,
        rating: problem.rating || null,
        tags: problem.tags || [],
        samples: problem.sampleTestCases
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const problem = await getProblem(id)
    return {
        title: problem ? `${problem.name} - CFlytics` : 'Problem Not Found',
    }
}

export default async function ProblemDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { id } = await params
    const qParams = await searchParams
    const force = qParams.retry === 'true'

    const problem = await getProblem(id, force)

    // Get User Status
    const user = await requireAuthUser();
    let status: 'solved' | 'attempted' | 'unsolved' = 'unsolved';
    let hasLocalAC = false;

    if (user && problem) {
        // 1. Check Codeforces for Solved status
        try {
            const cfResponse = await fetch(`https://codeforces.com/api/user.status?handle=${user.handle}&from=1&count=500`, {
                next: { revalidate: 300 } // Cache for 5 mins
            });
            const cfData = await cfResponse.json();
            if (cfData.status === 'OK') {
                const isCfSolved = cfData.result.some((sub: any) =>
                    sub.problem.contestId.toString() === problem.contestId &&
                    sub.problem.index === problem.index &&
                    sub.verdict === 'OK'
                );
                if (isCfSolved) status = 'solved';
            }
        } catch (e) {
            console.error("CF Status fetch failed:", e);
        }

        // 2. Check for local progress
        const prisma = (await import('@/lib/db/prisma')).default;
        const localSubmissions = await prisma.submission.findMany({
            where: {
                userId: user.id,
                problemId: problem.id,
            },
            select: { verdict: true }
        });

        if (localSubmissions.length > 0) {
            hasLocalAC = localSubmissions.some(s => s.verdict === 'AC');
            if (status !== 'solved') {
                status = 'attempted';
            }
        }
    }

    if (!problem) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-20 flex flex-col items-center justify-center text-center">
                <div className="bg-destructive/10 p-4 rounded-full mb-6">
                    <Database className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Problem Unavailable</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    We couldn't fetch the details for this problem from Codeforces. This might be due to a temporary block or the problem doesn't exist.
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/problems">Back to Explorer</Link>
                    </Button>
                    <ProblemRetryButton variant="default" className="bg-indigo-600 hover:bg-indigo-700" />
                </div>
            </div>
        )
    }

    const codeforcesUrl = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`
    const submitUrl = `https://codeforces.com/contest/${problem.contestId}/submit?problemIndex=${problem.index}`

    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Link
                href="/problems"
                className="flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group"
            >
                <ChevronLeft className="mr-1 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Problems
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                                {problem.contestId}{problem.index}
                            </Badge>
                            {problem.rating && (
                                <Badge
                                    className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 px-2 py-0.5"
                                >
                                    Rating: {problem.rating}
                                </Badge>
                            )}
                            {hasLocalAC && status !== 'solved' && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0.5 animate-pulse">
                                    Local AC - Ready to Submit
                                </Badge>
                            )}
                            <ProblemRetryButton
                                size="sm"
                                variant="ghost"
                                label="Refresh"
                                className="h-7 text-xs text-muted-foreground hover:text-primary transition-colors"
                            />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{problem.name}</h1>
                        <div className="flex flex-wrap gap-2">
                            {problem.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="bg-muted/50 hover:bg-muted text-xs capitalize">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Actions - Desktop Side or Top */}
                    <div className="lg:hidden mb-8 flex flex-col sm:flex-row gap-3">
                        <Button asChild size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                            <Link href={`/compiler?problemId=${problem.id}`}>
                                <Code2 className="mr-2 h-5 w-5" />
                                {hasLocalAC ? "Refine Solution" : "Solve Challenge"}
                            </Link>
                        </Button>
                        {hasLocalAC && status !== 'solved' ? (
                            <Button asChild variant="default" size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
                                <a href={submitUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-5 w-5" />
                                    Submit on CF
                                </a>
                            </Button>
                        ) : (
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                <a href={codeforcesUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-5 w-5" />
                                    View on CF
                                </a>
                            </Button>
                        )}
                    </div>

                    {/* Problem Meta Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <Card className="p-4 flex items-center gap-4 bg-card/50 backdrop-blur-sm border-border/50">
                            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                                <Timer className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Time Limit</p>
                                <p className="text-sm font-semibold">{problem.timeLimit}</p>
                            </div>
                        </Card>
                        <Card className="p-4 flex items-center gap-4 bg-card/50 backdrop-blur-sm border-border/50">
                            <div className="p-2 rounded-full bg-purple-500/10 text-purple-500">
                                <Database className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Memory Limit</p>
                                <p className="text-sm font-semibold">{problem.memoryLimit}</p>
                            </div>
                        </Card>
                        <Card className={cn(
                            "p-4 flex items-center gap-4 bg-card/50 backdrop-blur-sm border-border/50",
                            status === 'solved' && "border-emerald-500/20 bg-emerald-500/5",
                            status === 'attempted' && "border-amber-500/20 bg-amber-500/5"
                        )}>
                            <div className={cn(
                                "p-2 rounded-full",
                                status === 'solved' ? "bg-emerald-500/10 text-emerald-500" :
                                    status === 'attempted' ? "bg-amber-500/10 text-amber-500" :
                                        "bg-zinc-500/10 text-zinc-500"
                            )}>
                                {status === 'solved' ? <CheckCircle2 className="h-5 w-5" /> :
                                    status === 'attempted' ? <ClockIcon className="h-5 w-5" /> :
                                        <Clock className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                                <p className={cn(
                                    "text-sm font-semibold capitalize",
                                    status === 'solved' && "text-emerald-600 dark:text-emerald-400",
                                    status === 'attempted' && "text-amber-600 dark:text-amber-400"
                                )}>{status}</p>
                            </div>
                        </Card>
                    </div>

                    {/* Problem Statement */}
                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Database className="h-5 w-5 text-indigo-500" />
                                Problem Description
                            </h2>
                            {problem.description ? (
                                <ProblemDescription html={problem.description} />
                            ) : (
                                <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-2xl text-center">
                                    <div className="bg-amber-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ExternalLink className="h-6 w-6 text-amber-500" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">Description Temporarily Unavailable</h3>
                                    <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                                        Codeforces is currently protecting this content from automated access. You can view the full problem statement directly on their website.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button asChild variant="outline" className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500">
                                            <a href={codeforcesUrl} target="_blank" rel="noopener noreferrer">
                                                View on Codeforces
                                            </a>
                                        </Button>
                                        <ProblemRetryButton label="Reload Content" />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Input Specification */}
                        {problem.inputSpecification && (
                            <section>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Code2 className="h-5 w-5 text-indigo-500" />
                                    Input
                                </h2>
                                <ProblemDescription html={problem.inputSpecification} />
                            </section>
                        )}

                        {/* Output Specification */}
                        {problem.outputSpecification && (
                            <section>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Code2 className="h-5 w-5 text-indigo-500" />
                                    Output
                                </h2>
                                <ProblemDescription html={problem.outputSpecification} />
                            </section>
                        )}

                        {/* Sample Test Cases */}
                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-500" />
                                Sample Test Cases
                            </h2>
                            <SampleTestCases samples={problem.samples} />
                        </section>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="hidden lg:block w-80 shrink-0">
                    <div className="sticky top-24 space-y-6">
                        <Card className={cn(
                            "p-6 border-2 shadow-xl transition-all duration-500",
                            hasLocalAC && status !== 'solved'
                                ? "border-emerald-500/30 bg-emerald-500/[0.02] shadow-emerald-500/5"
                                : "border-indigo-500/20 bg-indigo-500/[0.02] shadow-indigo-500/5"
                        )}>
                            <h3 className="font-bold text-lg mb-4">
                                {status === 'solved' ? "Solved officially!" :
                                    hasLocalAC ? "Ready to Submit!" : "Ready to solve?"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                {status === 'solved' ? "You've successfully mastered this challenge on Codeforces. Great job!" :
                                    hasLocalAC ? "You've passed all local test cases! Now submit your official solution to Codeforces." :
                                        "Use our built-in IDE with support for multiple languages and real-time execution."}
                            </p>
                            <div className="space-y-3">
                                {hasLocalAC && status !== 'solved' && (
                                    <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 font-bold">
                                        <a href={submitUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-5 w-5" />
                                            Submit on Codeforces
                                        </a>
                                    </Button>
                                )}
                                <Button asChild size="lg" className={cn(
                                    "w-full transition-all transform hover:scale-[1.02] active:scale-[0.98]",
                                    hasLocalAC && status !== 'solved'
                                        ? "variant-outline border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                )}>
                                    <Link href={`/compiler?problemId=${problem.id}`}>
                                        <Code2 className="mr-2 h-5 w-5" />
                                        {hasLocalAC ? "Edit Solution" : "Code Solution"}
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full">
                                    <a href={codeforcesUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-5 w-5" />
                                        Codeforces
                                    </a>
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Quick Stats</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Difficulty</span>
                                    <span className="font-mono font-bold text-indigo-500">{problem.rating || 'Medium'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Success Rate</span>
                                    <span className="font-bold">42%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Solved</span>
                                    <span className="font-bold">12.4k</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
