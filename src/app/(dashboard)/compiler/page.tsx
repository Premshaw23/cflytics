'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CodeEditor, CodeEditorHandle } from '@/components/compiler/CodeEditor'
import { TestCasePanel } from '@/components/compiler/TestCasePanel'
import { ProblemDescription } from '@/components/compiler/ProblemDescription'
import { LanguageSelector } from '@/components/compiler/LanguageSelector'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2, RotateCcw, ChevronLeft, ChevronRight, LayoutPanelTop, PanelRightClose, PanelRightOpen, History as HistoryIcon, Play, Send, Share2, Database, CheckCircle2, MoreHorizontal, Code } from 'lucide-react'
import { getTemplate } from '@/lib/compiler/templates'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/lib/store/useAuth'
import { cn } from '@/lib/utils'
import { useUserProblemStatus } from '@/lib/hooks/useUserProblemStatus'
import { useQueryClient } from '@tanstack/react-query'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function CompilerContent() {
    const searchParams = useSearchParams()
    const problemId = searchParams.get('problemId')

    const { user, status: authStatus } = useAuth()
    const queryClient = useQueryClient()
    const { data: statusData, refetch: statusRefetch, isFetching: isStatusFetching } = useUserProblemStatus()

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
    const [leftPanelWidth, setLeftPanelWidth] = useState(50) // Starting at 50%
    const [testCasePanelHeight, setTestCasePanelHeight] = useState(300)
    const [isResizing, setIsResizing] = useState(false)
    const [isVerticalResizing, setIsVerticalResizing] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const editorRef = React.useRef<CodeEditorHandle>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const rightPanelRef = React.useRef<HTMLDivElement>(null)

    // Handle Horizontal Resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return

            const containerRect = containerRef.current.getBoundingClientRect()
            const newWidth = e.clientX - containerRect.left
            const newPercentage = (newWidth / containerRect.width) * 100

            // Constraints: min 20%, max 80%
            if (newPercentage > 20 && newPercentage < 80) {
                setLeftPanelWidth(newPercentage)
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

    // Handle Vertical Resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isVerticalResizing || !rightPanelRef.current) return

            const rightPanelRect = rightPanelRef.current.getBoundingClientRect()
            const newHeight = rightPanelRect.bottom - e.clientY

            // Constraints: min 150px, max 80% of panel height
            if (newHeight > 150 && newHeight < rightPanelRect.height * 0.8) {
                setTestCasePanelHeight(newHeight)
            }
        }

        const handleMouseUp = () => {
            setIsVerticalResizing(false)
        }

        if (isVerticalResizing) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'row-resize'
            document.body.style.userSelect = 'none'
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'default'
            document.body.style.userSelect = 'auto'
        }
    }, [isVerticalResizing])

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
            <div className="flex items-center justify-between border-b px-4 py-2 sm:px-6 sm:py-3 shrink-0 bg-card/30 backdrop-blur-sm gap-2 relative z-20">
                <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                    <Link href="/problems" className="hover:bg-muted p-1.5 rounded-md transition-colors shrink-0">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold tracking-tight hidden sm:block">Code Editor</h1>
                            {isSyncing ? (
                                <span className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-bold animate-pulse shrink-0">
                                    <Database className="w-2.5 h-2.5" />
                                    <span className="hidden sm:inline">SYNCING...</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold opacity-60 shrink-0">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span className="hidden sm:inline">SAVED</span>
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                            {problemId && (
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest truncate">
                                    {problemId}
                                </span>
                            )}
                            <div className="hidden sm:flex items-center">
                                <button
                                    onClick={() => statusRefetch()}
                                    disabled={isStatusFetching}
                                    className={cn(
                                        "transition-opacity hover:opacity-80 active:scale-95",
                                        isStatusFetching && "opacity-50 cursor-wait"
                                    )}
                                    title="Click to refresh status"
                                >
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
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-2 mr-2">
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
                            onClick={() => editorRef.current?.formatCode()}
                            title="Format Code (Prettify)"
                        >
                            <Code className="h-3.5 w-3.5" />
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

                    {/* Mobile Actions Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8 md:hidden text-muted-foreground">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link href={`/compiler/submissions${problemId ? `?problemId=${problemId}` : ''}`} className="flex items-center">
                                    <HistoryIcon className="mr-2 h-4 w-4" />
                                    <span>History</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleResetCode}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                <span>Reset Code</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => editorRef.current?.formatCode()}>
                                <Code className="mr-2 h-4 w-4" />
                                <span>Format Code</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowDescription(!showDescription)}>
                                {showDescription ? <PanelRightClose className="mr-2 h-4 w-4" /> : <PanelRightOpen className="mr-2 h-4 w-4" />}
                                <span>{showDescription ? "Hide Problem" : "Show Problem"}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-[1px] bg-border/50 mx-1 hidden sm:block"></div>

                    <LanguageSelector value={language} onChange={setLanguage} />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hidden sm:flex"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                    >
                        {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Main content */}
            <div ref={containerRef} className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
                {/* Left: Problem Description (collapsible) */}
                {showDescription && (
                    <>
                        <div
                            style={{ "--left-panel-width": `${leftPanelWidth}%` } as React.CSSProperties}
                            className={cn(
                                "shrink-0 border-r bg-card/5 animate-in slide-in-from-left duration-300 overflow-y-auto",
                                "w-full lg:w-[var(--left-panel-width)] h-[30vh] md:h-[40vh] lg:h-full transition-[width] duration-300",
                                isResizing && "transition-none"
                            )}
                        >
                            <ProblemDescription problemId={problemId} />
                        </div>

                        {/* Vertical Resizer Handle - Hidden on mobile */}
                        <div
                            className={cn(
                                "hidden lg:block w-1 hover:w-1.5 active:w-1.5 bg-border hover:bg-indigo-500 active:bg-indigo-600 cursor-col-resize transition-all z-20 shrink-0",
                                isResizing && "bg-indigo-600 w-1.5"
                            )}
                            onMouseDown={() => setIsResizing(true)}
                        />
                    </>
                )}

                {/* Right: Editor & Test Cases */}
                <div ref={rightPanelRef} className="flex flex-1 flex-col overflow-hidden bg-muted/20 relative">
                    <div className="flex-1 min-h-[100px] lg:min-h-0">
                        <CodeEditor
                            ref={editorRef}
                            language={language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            height="100%"
                        />
                    </div>

                    {/* Vertical Resizer Handle */}
                    <div
                        className={cn(
                            "h-2 hover:h-2.5 active:h-2.5 bg-border hover:bg-indigo-500/50 active:bg-indigo-500 cursor-row-resize transition-all z-20 shrink-0 flex items-center justify-center group/resizer",
                            isVerticalResizing && "bg-indigo-500 h-2.5"
                        )}
                        onMouseDown={() => setIsVerticalResizing(true)}
                    >
                        <div className="flex items-center gap-1 opacity-30 group-hover/resizer:opacity-100 transition-opacity">
                            <div className="w-8 h-1 rounded-full bg-foreground/20 group-hover/resizer:bg-white" />
                        </div>
                    </div>

                    {/* Test Cases Panel */}
                    <div
                        style={{ height: `${testCasePanelHeight}px` }}
                        className="min-h-[150px] border-t bg-background shadow-2xl relative z-10 overflow-hidden"
                    >
                        <TestCasePanel
                            problemId={problemId}
                            results={results}
                            onRun={handleRunCode}
                            onSubmit={handleSubmit}
                            isRunning={isRunning}
                            onRestoreCode={(newCode) => setCode(newCode)}
                            onToggleExpand={() => setTestCasePanelHeight(prev => prev > 400 ? 300 : 500)}
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
