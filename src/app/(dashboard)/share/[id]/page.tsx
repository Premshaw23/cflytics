'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CodeEditor } from '@/components/compiler/CodeEditor'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Share2, Copy, Play, ExternalLink, Code2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function SharedSolutionPage() {
    const params = useParams()
    const router = useRouter()
    const [solution, setSolution] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSolution = async () => {
            try {
                const res = await fetch(`/api/compiler/share?id=${params.id}`)
                const data = await res.json()
                if (data.solution) {
                    setSolution(data.solution)
                } else {
                    toast.error("Solution not found")
                    router.push('/compiler')
                }
            } catch (err) {
                console.error(err)
                toast.error("Failed to load solution")
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchSolution()
        }
    }, [params.id, router])

    const handleCopyCode = () => {
        if (solution?.code) {
            navigator.clipboard.writeText(solution.code)
            toast.success("Code copied to clipboard")
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="text-sm font-medium text-muted-foreground">Fetching Solution...</p>
                </div>
            </div>
        )
    }

    if (!solution) return null

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Simple Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 bg-card/30 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/compiler" className="hover:bg-muted p-2 rounded-full transition-colors group">
                        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                            Shared Solution
                            <Badge variant="outline" className="text-[10px] font-mono px-1.5 uppercase">
                                {solution.language}
                            </Badge>
                        </h1>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Code2 className="w-3 h-3" />
                            Problem: <span className="font-mono text-indigo-500">{solution.problemId}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 rounded-xl font-medium"
                        onClick={handleCopyCode}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                    </Button>
                    <Link href={`/compiler?problemId=${solution.problemId}`}>
                        <Button
                            size="sm"
                            className="h-9 px-4 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Play className="h-4 w-4 mr-2 fill-current" />
                            Open in IDE
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Read-only Editor */}
            <div className="flex-1 overflow-hidden p-6 bg-muted/20">
                <div className="h-full rounded-2xl border bg-card overflow-hidden shadow-2xl relative">
                    <div className="absolute top-4 right-4 z-10 opacity-50 pointer-events-none select-none">
                        <Badge className="bg-background text-foreground/50 border-none font-bold uppercase tracking-widest text-[10px]">READ ONLY</Badge>
                    </div>
                    <CodeEditor
                        language={solution.language}
                        value={solution.code}
                        readOnly={true}
                        height="100%"
                    />
                </div>
            </div>

            {/* Simple Footer */}
            <div className="border-t px-6 py-3 bg-card/30 text-center shrink-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Generated by <span className="text-indigo-500">CFlytics IDE</span> • Share your logic with the world
                </p>
            </div>
        </div>
    )
}
