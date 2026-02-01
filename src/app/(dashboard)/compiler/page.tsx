'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CodeEditor } from '@/components/compiler/CodeEditor'
import { TestCasePanel } from '@/components/compiler/TestCasePanel'
import { ProblemDescription } from '@/components/compiler/ProblemDescription'
import { LanguageSelector } from '@/components/compiler/LanguageSelector'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2, RotateCcw, ChevronLeft, ChevronRight, LayoutPanelTop, PanelRightClose, PanelRightOpen, History as HistoryIcon, Play, Send, Share2, Database, CheckCircle2 } from 'lucide-react'
import { getTemplate } from '@/lib/compiler/templates'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/lib/store/useAuth'
import { cn } from '@/lib/utils'
import { useUserProblemStatus } from '@/lib/hooks/useUserProblemStatus'
import { useQueryClient } from '@tanstack/react-query'

function CompilerContent() {
    const searchParams = useSearchParams()
    const problemId = searchParams.get('problemId')

    const { user, status: authStatus } = useAuth()
    const queryClient = useQueryClient()
    const { data: statusData } = useUserProblemStatus()

    const isSolved = problemId && statusData?.solvedIds.includes(problemId)
    const isAttempted = problemId && statusData?.attemptedIds.includes(problemId) && !isSolved

    // States
    const [language, setLanguage] = useState('cpp')
    const [code, setCode] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [showDescription, setShowDescription] = useState(true)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [problemMetadata, setProblemMetadata] = useState<any>(null)
    const [leftPanelWidth, setLeftPanelWidth] = useState(450)
    const [isResizing, setIsResizing] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)

    const containerRef = React.useRef<HTMLDivElement>(null)

    // Handle Resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return

            const containerRect = containerRef.current.getBoundingClientRect()
            const newWidth = e.clientX - containerRect.left

            // Constraints: min 300px, max 60% of container width
            if (newWidth > 300 && newWidth < containerRect.width * 0.6) {
                setLeftPanelWidth(newWidth)
            }
        }

        const handleMouseUp = () => {
            setIsResizing(false)
        }

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'default'
            document.body.style.userSelect = 'auto'
        }
    }, [isResizing])

    // Load problem metadata
    useEffect(() => {
        if (problemId) {
            fetch(`/api/problems/${problemId}/details`)
                .then(res => res.json())
                .then(data => setProblemMetadata(data))
                .catch(err => console.error('Failed to fetch problem metadata', err))
        }
    }, [problemId])

    // Load code template on language change or problem change
    useEffect(() => {
        const savedCode = localStorage.getItem(`code-${problemId}-${language}`)
        if (savedCode) {
            setCode(savedCode)
        } else {
            setCode(getTemplate(language, problemId || undefined))
        }
    }, [language, problemId])

    // Persistence with Sync Indicator
    useEffect(() => {
        if (code) {
            localStorage.setItem(`code-${problemId}-${language}`, code)

            // Artificial delay to show "Syncing"
            setIsSyncing(true)
            const timer = setTimeout(() => setIsSyncing(false), 800)
            return () => clearTimeout(timer)
        }
    }, [code, language, problemId])

    const handleRunCode = useCallback(async (customCases: any[] = []): Promise<any[]> => {
        setIsRunning(true)
        setResults([])

        try {
            // First, get sample test cases
            const tcRes = await fetch(`/api/compiler/testcases?problemId=${problemId}`)
            const tcData = await tcRes.json()

            const sampleCases = tcData.testCases || []

            // Merge sample cases with valid custom cases
            const validCustomCases = customCases.filter(c => c.input.trim() !== '' || c.expectedOutput.trim() !== '')
            const testCases = [...sampleCases, ...validCustomCases]

            if (testCases.length === 0) {
                toast.error("No test cases found for this problem.")
                return []
            }

            const response = await fetch('/api/compiler/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    testCases,
                }),
            })

            const data = await response.json()

            if (data.success) {
                setResults(data.results)
                if (data.summary.allPassed) {
                    toast.success(`Passed all ${data.summary.totalTests} test cases!`)
                } else {
                    toast.error(`Passed ${data.summary.passed}/${data.summary.totalTests} test cases.`)
                }
                return data.results
            } else {
                toast.error(data.error || 'Failed to execute code')
                return []
            }
        } catch (error) {
            console.error('Failed to run code:', error)
            toast.error('An error occurred while running your code.')
            return []
        } finally {
            setIsRunning(false)
        }
    }, [code, language, problemId])

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + Enter to Run Code
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                if (!isRunning) {
                    handleRunCode()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleRunCode, isRunning])

    const handleSubmit = useCallback(async (customCases: any[] = []) => {
        if (authStatus !== 'connected' || !user) {
            toast.error("Please connect your account to submit code.")
            return
        }

        const runResults = await handleRunCode(customCases)
        if (!runResults || runResults.length === 0) return

        const testsTotal = runResults.length
        const testsPassed = runResults.filter(r => r.verdict === 'AC').length
        const verdict = testsPassed === testsTotal ? 'AC' : runResults.find(r => r.verdict !== 'AC')?.verdict || 'WA'

        // Calculate average runtime and memory
        const runtime = runResults.reduce((acc, r) => acc + (r.runtime || 0), 0) / testsTotal
        const memory = Math.max(...runResults.map(r => r.memory || 0))

        try {
            const response = await fetch('/api/compiler/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    problemId: problemId,
                    language,
                    code,
                    verdict,
                    runtime,
                    memory,
                    testsPassed,
                    testsTotal,
                    tags: problemMetadata?.tags || [],
                    rating: problemMetadata?.rating || null,
                }),
            })

            const data = await response.json()
            if (data.success) {
                toast.success("Submission saved successfully!")
                // Refetch problem status to update UI immediately
                queryClient.invalidateQueries({ queryKey: ["user-problems-status"] });
            } else {
                toast.error("Failed to save submission history.")
            }
        } catch (error) {
            console.error('Submission error:', error)
            toast.error("An error occurred while saving your submission.")
        }
    }, [authStatus, user, handleRunCode, problemId, language, code, problemMetadata, queryClient])

    const handleShare = useCallback(async () => {
        if (!code.trim()) {
            toast.error("Code is empty!")
            return
        }

        const toastId = toast.loading("Generating share link...")
        try {
            const res = await fetch('/api/compiler/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    problemId,
                    userId: user?.id
                })
            })

            const data = await res.json()
            if (data.shareId) {
                const shareUrl = `${window.location.origin}/share/${data.shareId}`
                await navigator.clipboard.writeText(shareUrl)
                toast.success("Share link copied to clipboard!", { id: toastId })
            } else {
                toast.error(data.error || "Failed to share code", { id: toastId })
            }
        } catch (error) {
            console.error('Share error:', error)
            toast.error("An error occurred while sharing", { id: toastId })
        }
    }, [code, language, problemId, user])

    const handleResetCode = () => {
        if (confirm("Are you sure you want to reset your code? This cannot be undone.")) {
            const template = getTemplate(language, problemId || undefined)
            setCode(template)
            localStorage.removeItem(`code-${problemId}-${language}`)
            toast.success("Code reset to template")
        }
    }

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleRunCode([])
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                handleSubmit([])
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleRunCode, handleSubmit])

    return (
        <div className={`flex flex-col bg-background ${isFullScreen ? 'fixed inset-0 z-50 overflow-hidden' : 'h-full'}`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-3 shrink-0 bg-card/30 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Link href="/problems" className="hover:bg-muted p-1.5 rounded-md transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold tracking-tight">Code Editor</h1>
                            {isSyncing ? (
                                <span className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-bold animate-pulse">
                                    <Database className="w-2.5 h-2.5" />
                                    SYNCING...
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold opacity-60">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    SAVED CLOUD
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {problemId && (
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                    ID: {problemId}
                                </span>
                            )}
                            {isSolved ? (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">Solved</span>
                                </div>
                            ) : isAttempted ? (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                    <HistoryIcon className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">Attempted</span>
                                </div>
                            ) : problemId && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/20 border border-border/50">
                                    <Database className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Unsolved</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            asChild
                        >
                            <Link href={`/compiler/submissions${problemId ? `?problemId=${problemId}` : ''}`} title="Submission History">
                                <HistoryIcon className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={handleResetCode}
                            title="Reset Code"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={handleShare}
                            title="Share Solution"
                        >
                            <Share2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => setShowDescription(!showDescription)}
                            title={showDescription ? "Hide Description" : "Show Description"}
                        >
                            {showDescription ? <PanelRightClose className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
                        </Button>
                    </div>

                    <div className="h-6 w-[1px] bg-border/50 mx-1"></div>

                    <LanguageSelector value={language} onChange={setLanguage} />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                    >
                        {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Main content */}
            <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
                {/* Left: Problem Description (collapsible) */}
                {showDescription && (
                    <>
                        <div
                            style={{ width: `${leftPanelWidth}px` }}
                            className="shrink-0 border-r bg-card/5 animate-in slide-in-from-left duration-300 overflow-y-auto"
                        >
                            <ProblemDescription problemId={problemId} />
                        </div>

                        {/* Vertical Resizer Handle */}
                        <div
                            className={cn(
                                "w-1 hover:w-1.5 active:w-1.5 bg-border hover:bg-indigo-500 active:bg-indigo-600 cursor-col-resize transition-all z-20 shrink-0",
                                isResizing && "bg-indigo-600 w-1.5"
                            )}
                            onMouseDown={() => setIsResizing(true)}
                        />
                    </>
                )}

                {/* Right: Editor & Test Cases */}
                <div className="flex flex-1 flex-col overflow-hidden bg-muted/20 relative">
                    <div className="flex-1 min-h-0">
                        <CodeEditor
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            height="100%"
                        />
                    </div>

                    {/* Test Cases Panel */}
                    <div className="h-[40%] min-h-[300px] border-t bg-background shadow-2xl relative z-10">
                        <TestCasePanel
                            problemId={problemId}
                            results={results}
                            onRun={handleRunCode}
                            onSubmit={handleSubmit}
                            isRunning={isRunning}
                            onRestoreCode={(newCode) => setCode(newCode)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CompilerPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <LayoutPanelTop className="h-8 w-8 animate-pulse text-muted-foreground" />
            </div>
        }>
            <CompilerContent />
        </Suspense>
    )
}
