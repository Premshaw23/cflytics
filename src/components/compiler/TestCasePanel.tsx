'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
// import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Play, Send, Plus, Loader2, CheckCircle2, XCircle, AlertCircle, Clock, Database, History, LayoutPanelTop, ExternalLink, RefreshCw, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/store/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface TestCase {
    input: string
    expectedOutput: string
}

interface TestResult {
    testCase: number
    verdict: string
    input: string
    expectedOutput: string
    actualOutput: string
    runtime: number
    memory: number
    statusId?: number
    error?: string
    compilationError?: string | null
    message?: string | null
}

interface TestCasePanelProps {
    problemId: string | null
    results: TestResult[]
    onRun: (customCases: TestCase[]) => void
    onSubmit: (customCases: TestCase[]) => void
    isRunning: boolean
    onRestoreCode: (code: string) => void
}

export function TestCasePanel({
    problemId,
    results,
    onRun,
    onSubmit,
    isRunning,
    onRestoreCode,
}: TestCasePanelProps) {
    const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([])
    const [customTestCases, setCustomTestCases] = useState<TestCase[]>([
        { input: '', expectedOutput: '' }
    ])
    const [activeTab, setActiveTab] = useState('sample')
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [fetchingId, setFetchingId] = useState<string | null>(null)
    const { user } = useAuth()

    const fetchHistory = React.useCallback(async () => {
        if (!problemId || !user?.id) return
        setLoadingHistory(true)
        try {
            const res = await fetch(`/api/compiler/submit?problemId=${problemId}&userId=${user.id}`)
            const data = await res.json()
            setSubmissions(data.submissions || [])
        } catch (err) {
            console.error('Failed to fetch submissions', err)
        } finally {
            setLoadingHistory(false)
        }
    }, [problemId, user?.id])

    const handleFetchCode = async (sub: any) => {
        if (!sub.cfId || !sub.contestId) {
            toast.error("Metadata missing", { description: "Cloud-only submission metadata could not be found." })
            return
        }

        setFetchingId(sub.id)
        const toastId = toast.loading("Syncing with Codeforces...")

        try {
            const res = await fetch('/api/compiler/fetch-submission-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contestId: sub.contestId,
                    submissionId: sub.cfId
                })
            })

            const data = await res.json()

            if (res.ok && data.code) {
                setSubmissions(prev => prev.map(s =>
                    s.id === sub.id ? { ...s, code: data.code } : s
                ))
                toast.success("Code retrieved successfully!", { id: toastId })
            } else {
                const cfLink = `https://codeforces.com/contest/${sub.contestId}/submission/${sub.cfId}`
                const isBlocked = res.status === 403 || data.error?.toLowerCase().includes('cloudflare') || data.error?.toLowerCase().includes('blocked')

                toast.error(isBlocked ? "Codeforces Sync Blocked" : "Fetch Failed", {
                    id: toastId,
                    description: (
                        <div className="mt-2 space-y-2">
                            <p className="text-[10px] leading-relaxed opacity-90">
                                {data.error || "This submission might be private or protected by Cloudflare security."}
                            </p>
                            <div className="pt-1">
                                <a
                                    href={cfLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 flex items-center gap-1"
                                >
                                    View Manual on Codeforces <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                            </div>
                        </div>
                    ),
                    duration: 6000
                })

                // Update the UI with a helpful fallback if it was a block
                if (isBlocked) {
                    const fallbackCode = `// Fetch failed: ${data.error || 'Access blocked'}\n// Due to privacy settings or bot protection, we couldn't retrieve this code auto-magically.\n// You can still view it manually here: ${cfLink}`
                    setSubmissions(prev => prev.map(s =>
                        s.id === sub.id ? { ...s, code: fallbackCode } : s
                    ))
                }
            }
        } catch (error) {
            console.error('Fetch code error:', error)
            toast.error("An error occurred during sync", { id: toastId })
        } finally {
            setFetchingId(null)
        }
    }

    const handleRestore = (code: string) => {
        if (!code) {
            toast.error("No code available to restore")
            return
        }
        onRestoreCode(code)
        toast.success("Solution restored to editor!")
    }

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory()
        }
    }, [activeTab, fetchHistory])

    useEffect(() => {
        if (problemId) {
            // Fetch sample test cases from API
            fetch(`/api/compiler/testcases?problemId=${problemId}`)
                .then(res => res.json())
                .then(data => setSampleTestCases(data.testCases || []))
                .catch(err => console.error('Failed to fetch test cases', err))

            // Fetch custom test cases for user
            if (user?.id) {
                fetch(`/api/compiler/testcases/custom?userId=${user.id}&problemId=${problemId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.customCases && data.customCases.length > 0) {
                            setCustomTestCases(data.customCases.map((c: any) => ({
                                input: c.input,
                                expectedOutput: c.expectedOutput
                            })))
                        } else {
                            setCustomTestCases([{ input: '', expectedOutput: '' }])
                        }
                    })
                    .catch(err => console.error('Failed to fetch custom cases', err))
            }
        }
    }, [problemId, user?.id])

    // Auto-save custom test cases with debounce
    useEffect(() => {
        if (!user?.id || !problemId || customTestCases.length === 0) return

        const timer = setTimeout(async () => {
            try {
                await fetch('/api/compiler/testcases/custom', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        problemId,
                        testCases: customTestCases
                    })
                })
            } catch (err) {
                console.error('Failed to sync custom cases', err)
            }
        }, 2000) // Save after 2 seconds of inactivity

        return () => clearTimeout(timer)
    }, [customTestCases, user?.id, problemId])

    useEffect(() => {
        if (results.length > 0) {
            setActiveTab('results')
        }
    }, [results])

    const handleAddCustomCase = () => {
        setCustomTestCases([...customTestCases, { input: '', expectedOutput: '' }])
    }

    const handleRemoveCustomCase = (index: number) => {
        setCustomTestCases(customTestCases.filter((_, i) => i !== index))
    }

    const handleUpdateCustomCase = (index: number, field: keyof TestCase, value: string) => {
        const newCases = [...customTestCases]
        newCases[index][field] = value
        setCustomTestCases(newCases)
    }

    const getVerdictBadge = (verdict: string) => {
        switch (verdict) {
            case 'AC':
                return <Badge className="bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Accepted</Badge>
            case 'WA':
                return <Badge variant="destructive" className="shadow-none"><XCircle className="w-3 h-3 mr-1" /> Wrong Answer</Badge>
            case 'TLE':
                return <Badge variant="outline" className="text-amber-600 border-amber-500/50 dark:text-amber-400 shadow-none"><Clock className="w-3 h-3 mr-1" /> Time Limit Exceeded</Badge>
            case 'ERROR':
                return <Badge variant="destructive" className="shadow-none"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>
            default:
                return <Badge variant="secondary" className="shadow-none">{verdict}</Badge>
        }
    }

    return (
        <div className="flex h-full flex-col bg-background">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b px-4 py-2 sm:py-1.5 shrink-0 bg-muted/30 gap-2">
                    <div className="overflow-x-auto scrollbar-none -mx-2 px-2">
                        <TabsList className="h-8 bg-transparent w-full justify-start sm:w-auto">
                            <TabsTrigger value="sample" className="px-3 text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Sample Tests ({sampleTestCases.length})
                            </TabsTrigger>
                            <TabsTrigger value="custom" className="px-3 text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Custom Tests ({customTestCases.length})
                            </TabsTrigger>
                            <TabsTrigger value="results" className="px-3 text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                Results {results.length > 0 && `(${results.length})`}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="px-3 text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                        {problemId && results.length > 0 && results.every(r => r.verdict === 'AC') && (
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="col-span-2 sm:col-span-1 h-9 sm:h-8 text-xs font-bold border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-600 animate-in zoom-in-95 duration-300"
                            >
                                {(() => {
                                    const match = problemId.match(/^(\d+)([a-zA-Z0-9]+)$/) || problemId.match(/^(\d+)-([a-zA-Z0-9]+)$/);
                                    const contestId = match?.[1];
                                    const problemIndex = match?.[2];
                                    const url = contestId && problemIndex
                                        ? `https://codeforces.com/contest/${contestId}/submit?problemIndex=${problemIndex}`
                                        : `https://codeforces.com/problemset`;
                                    return (
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                            Submit on CF
                                        </a>
                                    );
                                })()}
                            </Button>
                        )}
                        <Button
                            onClick={() => onRun(customTestCases)}
                            disabled={isRunning || !problemId}
                            size="sm"
                            variant="secondary"
                            className="h-9 sm:h-8 text-xs font-medium pl-3 sm:pl-4"
                        >
                            {isRunning ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-2 h-3.5 w-3.5 fill-current" />}
                            Run
                        </Button>
                        <Button
                            onClick={() => onSubmit(customTestCases)}
                            disabled={isRunning || !problemId}
                            size="sm"
                            className="h-9 sm:h-8 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Send className="mr-2 h-3.5 w-3.5" />
                            Submit
                        </Button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden relative">
                    <TabsContent value="sample" className="absolute inset-0 m-0 overflow-y-auto p-4 space-y-4">
                        {sampleTestCases.length > 0 ? (
                            sampleTestCases.map((tc, index) => (
                                <div key={index} className="space-y-3">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1">Test Case {index + 1}</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                                <Database className="w-3 h-3 text-zinc-500" /> input
                                            </div>
                                            <pre className="rounded-xl bg-muted/40 p-4 text-xs font-mono border border-border/50 shadow-inner">
                                                {tc.input}
                                            </pre>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                                <CheckCircle2 className="w-3 h-3 text-zinc-500" /> output
                                            </div>
                                            <pre className="rounded-xl bg-indigo-500/[0.03] p-4 text-xs font-mono border border-indigo-500/10 shadow-inner text-indigo-500/80">
                                                {tc.expectedOutput}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                                <p className="text-sm">No sample test cases available</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="custom" className="absolute inset-0 m-0 overflow-y-auto p-4 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Custom Workspace</p>
                            <Button
                                onClick={handleAddCustomCase}
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500/10 hover:text-indigo-500"
                            >
                                <Plus className="w-3 h-3 mr-1.5" /> Add Case
                            </Button>
                        </div>
                        {customTestCases.map((tc, index) => (
                            <div key={index} className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/50 relative group">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Case {index + 1}</p>
                                    <Button
                                        onClick={() => handleRemoveCustomCase(index)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                            <Database className="w-3 h-3 text-zinc-500" /> input
                                        </div>
                                        <textarea
                                            value={tc.input}
                                            onChange={(e) => handleUpdateCustomCase(index, 'input', e.target.value)}
                                            className="w-full h-20 rounded-xl bg-background/50 p-3 text-xs font-mono border border-border/50 focus:border-indigo-500/50 outline-none transition-all resize-none shadow-inner"
                                            placeholder="Standard input..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                            <CheckCircle2 className="w-3 h-3 text-zinc-500" /> output
                                        </div>
                                        <textarea
                                            value={tc.expectedOutput}
                                            onChange={(e) => handleUpdateCustomCase(index, 'expectedOutput', e.target.value)}
                                            className="w-full h-20 rounded-xl bg-background/50 p-3 text-xs font-mono border border-border/50 focus:border-indigo-500/50 outline-none transition-all resize-none shadow-inner"
                                            placeholder="Expected output..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="results" className="absolute inset-0 m-0 overflow-y-auto p-4 custom-scrollbar">
                        {results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10 space-y-4">
                                <div className="p-6 rounded-full bg-muted/20 animate-pulse">
                                    <Play className="w-10 h-10 opacity-20" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-base font-semibold text-foreground/80">Ready to execute</p>
                                    <p className="text-xs max-w-[200px]">Run your code to see the test results and performance metrics.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Global Compilation Error View */}
                                {results.some(r => r.verdict === 'CE') ? (
                                    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="bg-destructive/10 px-4 py-3 border-b border-destructive/20 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-destructive font-bold text-sm tracking-tight">
                                                <XCircle className="w-4 h-4" />
                                                COMPILATION FAILED
                                            </div>
                                            <Badge variant="destructive" className="font-mono text-[10px] uppercase shadow-lg shadow-destructive/20">Error 6</Badge>
                                        </div>
                                        <div className="p-5 font-mono text-[11px] leading-relaxed text-destructive/90 overflow-x-auto whitespace-pre-wrap selection:bg-destructive/20 select-text bg-zinc-950/40">
                                            {results.find(r => r.verdict === 'CE')?.actualOutput || results.find(r => r.verdict === 'CE')?.compilationError || 'No error details provided'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {results.map((result, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "group relative rounded-3xl border bg-card/40 transition-all duration-300 hover:bg-card/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 overflow-hidden",
                                                    result.verdict === 'AC' ? "border-emerald-500/20 hover:border-emerald-500/40" : "border-destructive/20 hover:border-destructive/40"
                                                )}
                                            >
                                                <div className={cn(
                                                    "px-5 py-3.5 flex items-center justify-between border-b transition-colors",
                                                    result.verdict === 'AC' ? "bg-emerald-500/5 group-hover:bg-emerald-500/10" : "bg-destructive/5 group-hover:bg-destructive/10"
                                                )}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border",
                                                            result.verdict === 'AC' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-destructive/10 border-destructive/30 text-destructive"
                                                        )}>
                                                            {result.testCase}
                                                        </div>
                                                        <span className="text-sm font-bold tracking-tight">Case Overview</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {getVerdictBadge(result.verdict)}
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                        {/* Input Section */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between px-1">
                                                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest text-zinc-500">input</span>
                                                                <Database className="w-3 h-3 text-muted-foreground/40" />
                                                            </div>
                                                            <div className="relative group/field">
                                                                <pre className="rounded-2xl bg-zinc-950/5 p-4 min-h-[100px] max-h-[160px] overflow-y-auto text-xs font-mono border border-border/5 dark:bg-zinc-950/20">
                                                                    {result.input || 'No input data'}
                                                                </pre>
                                                            </div>
                                                        </div>

                                                        {/* Expected Section */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between px-1">
                                                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest text-zinc-500">expected output</span>
                                                                <CheckCircle2 className="w-3 h-3 text-muted-foreground/40" />
                                                            </div>
                                                            <div className="relative group/field">
                                                                <pre className="rounded-2xl bg-emerald-500/5 p-4 min-h-[100px] max-h-[160px] overflow-y-auto text-xs font-mono border border-emerald-500/10 text-emerald-600/80 dark:text-emerald-400/80">
                                                                    {result.expectedOutput || 'N/A'}
                                                                </pre>
                                                            </div>
                                                        </div>

                                                        {/* Actual/Output Section */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between px-1">
                                                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest text-zinc-500">your output</span>
                                                                <LayoutPanelTop className="w-3 h-3 text-muted-foreground/40" />
                                                            </div>
                                                            <div className="relative group/field">
                                                                <pre className={cn(
                                                                    "rounded-2xl p-4 min-h-[100px] max-h-[160px] overflow-y-auto text-xs font-mono border transition-all",
                                                                    result.verdict === 'AC'
                                                                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
                                                                        : "bg-destructive/5 border-destructive/10 text-destructive"
                                                                )}>
                                                                    {result.actualOutput || 'No output detected'}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Metrics Footer */}
                                                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                                                        <div className="flex gap-6">
                                                            <div className="flex items-center gap-2 group/metric">
                                                                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 group-hover/metric:bg-indigo-500 group-hover/metric:text-white transition-all">
                                                                    <Clock className="w-3 h-3" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-tighter">Runtime</span>
                                                                    <span className="text-xs font-mono font-bold">{(result.runtime || 0).toFixed(3)}s</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 group/metric">
                                                                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover/metric:bg-amber-500 group-hover/metric:text-white transition-all">
                                                                    <Database className="w-3 h-3" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-tighter">Memory</span>
                                                                    <span className="text-xs font-mono font-bold">{(result.memory || 0)} KB</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {result.message && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50 text-[10px] font-bold text-muted-foreground/80">
                                                                <AlertCircle className="w-3 h-3" />
                                                                {result.message}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="absolute inset-0 m-0 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-indigo-500/20">
                        {loadingHistory ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10 space-y-2">
                                <History className="w-8 h-8 opacity-20" />
                                <p className="text-sm">No submission history found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {submissions.map((sub, index) => (
                                    <div key={sub.id} className="p-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {getVerdictBadge(sub.verdict)}
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                                                </span>
                                                {sub.source === 'codeforces' && (
                                                    <Badge variant="outline" className="text-[8px] h-4 leading-none border-indigo-500/30 text-indigo-500 uppercase font-black px-1.5 shadow-sm shadow-indigo-500/5 bg-indigo-500/5">
                                                        Codeforces Official
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-3 text-[10px] text-muted-foreground font-medium uppercase mr-2">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {sub.runtime?.toFixed(3) || '0.000'}s
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Database className="w-3 h-3" /> {sub.memory || 0} KB
                                                    </span>
                                                </div>

                                                {sub.code ? (
                                                    <Button
                                                        onClick={() => handleRestore(sub.code)}
                                                        variant="outline"
                                                        size="xs"
                                                        className="h-6 text-[10px] font-bold border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/10"
                                                    >
                                                        <RefreshCw className="w-3 h-3 mr-1" /> Restore
                                                    </Button>
                                                ) : sub.source === 'codeforces' && (
                                                    <Button
                                                        onClick={() => handleFetchCode(sub)}
                                                        disabled={fetchingId === sub.id}
                                                        variant="outline"
                                                        size="xs"
                                                        className="h-6 text-[10px] font-bold border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/10"
                                                    >
                                                        {fetchingId === sub.id ? (
                                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                        ) : (
                                                            <RefreshCw className="w-3 h-3 mr-1" />
                                                        )}
                                                        Fetch Code
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    Tests: {sub.testsPassed} / {sub.testsTotal || 'N/A'}
                                                </p>
                                                <Badge variant="outline" className="text-[9px] h-5 px-1.5 uppercase font-mono">
                                                    {sub.language}
                                                </Badge>
                                            </div>
                                            <div className="relative group">
                                                <pre className="rounded-lg bg-muted/50 p-3 text-[10px] font-mono border border-border/30 max-h-32 overflow-y-auto overflow-x-hidden whitespace-pre-wrap selection:bg-indigo-500/10">
                                                    {sub.code || (sub.source === 'codeforces' ? "Official solution code not yet fetched..." : "No code available")}
                                                </pre>
                                                {sub.code && (
                                                    <Button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(sub.code);
                                                            toast.success("Code copied to clipboard!");
                                                        }}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
