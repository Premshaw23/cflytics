'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Code } from 'lucide-react'
import { ProblemDescription as LatexRenderer } from '@/components/problems/ProblemDescription'
import { toast } from 'sonner'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'


interface ProblemDescriptionProps {
    problemId: string | null
}

export function ProblemDescription({ problemId }: ProblemDescriptionProps) {
    const [problem, setProblem] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const fetchDetails = async (force = false) => {
        if (!problemId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/problems/${problemId}/details${force ? '?force=true' : ''}`)
            const data = await res.json()
            if (data.error) {
                console.error(data.error)
                setProblem(null)
                if (force) toast.error("Failed to refresh problem details")
            } else {
                setProblem(data)
                if (force) toast.success("Problem details updated!")
            }
        } catch (err) {
            console.error('Failed to fetch problem details', err)
            if (force) toast.error("An error occurred during refresh")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDetails()
    }, [problemId])

    const handleRefresh = () => {
        fetchDetails(true)
    }

    if (!problemId) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in duration-500">
                <div className="space-y-6 max-w-[280px]">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                        <div className="relative bg-card border border-border/50 p-5 rounded-[24px] shadow-xl">
                            <Code className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-black uppercase tracking-tighter text-foreground">Workspace Ready</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-relaxed">
                            Select a problem to view details here, or simply start coding and compile your own logic without any problem constraints.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="p-4 space-y-4 animate-pulse">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-24"></div>
                </div>
                <div className="space-y-2 pt-4">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
            </div>
        )
    }

    if (!problem) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>Failed to load problem description.</p>
            </div>
        )
    }

    return (
        <div className="p-4 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight mb-2 uppercase text-primary">{problem.name}</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="font-mono bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">{problem.rating || 'Unrated'}</Badge>
                        {(problem.tags || []).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="bg-muted/50 text-[10px] uppercase font-bold tracking-widest">{tag}</Badge>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1 text-[11px] text-muted-foreground font-medium uppercase tracking-wider bg-muted/20 p-3 rounded-xl border border-border/50">
                        <div className="flex items-center gap-2">
                            <span className="opacity-50">Time limit:</span>
                            <span>{problem.timeLimit || '1 second'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="opacity-50">Memory limit:</span>
                            <span>{problem.memoryLimit || '256 MB'}</span>
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="h-9 w-9 rounded-2xl bg-muted/30 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all shrink-0 border border-border/50"
                    title="Refresh from Codeforces"
                >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>

            <div className="space-y-6">
                {/* Use LatexRenderer for problem description */}
                {problem.description && (
                    <div className="mb-6">
                        <div className="[&_.prose]:text-sm [&_.prose]:p-4 [&_.prose]:rounded-xl">
                            <LatexRenderer html={problem.description} />
                        </div>
                    </div>
                )}

                {problem.inputSpecification && (
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 ml-1">input</h3>
                        <div className="[&_.prose]:text-sm [&_.prose]:p-4 [&_.prose]:rounded-xl">
                            <LatexRenderer html={problem.inputSpecification} />
                        </div>
                    </div>
                )}

                {problem.outputSpecification && (
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 ml-1">output</h3>
                        <div className="[&_.prose]:text-sm [&_.prose]:p-4 [&_.prose]:rounded-xl">
                            <LatexRenderer html={problem.outputSpecification} />
                        </div>
                    </div>
                )}

                {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                    <div className="space-y-8 pt-4 border-t border-border/50">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4 p-1 px-3 bg-primary/10 rounded-lg inline-block">Example</h3>
                        {problem.sampleTestCases.map((sample: any, index: number) => (
                            <div key={index} className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">input</p>
                                    <div className="relative group">
                                        <pre className="bg-muted/30 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-border/50 shadow-inner whitespace-pre-wrap">
                                            {sample.input}
                                        </pre>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">output</p>
                                    <pre className="bg-emerald-500/[0.04] p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-emerald-500/20 shadow-sm text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">
                                        {sample.output}
                                    </pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {problem.note && (
                    <div className="pt-8 border-t border-border/50">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 ml-1">Note</h3>
                        <div className="[&_.prose]:text-sm [&_.prose]:p-4 [&_.prose]:rounded-xl bg-amber-500/[0.02] border border-amber-500/10 rounded-2xl">
                            <LatexRenderer html={problem.note} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
