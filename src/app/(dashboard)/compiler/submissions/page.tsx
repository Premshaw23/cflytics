'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/store/useAuth'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Code2, History as HistoryIcon, Languages, Timer, Database, ExternalLink, Calendar, CheckCircle2, XCircle, AlertCircle, Clock, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Submission {
    id: string
    problemId: string
    language: string
    code: string | null
    verdict: string
    runtime: number
    memory: number
    testsPassed: number
    testsTotal: number
    createdAt: string
    source?: 'local' | 'codeforces'
    cfId?: number
    contestId?: number
}

function SubmissionHistoryContent() {
    const { user, status: authStatus } = useAuth()
    const searchParams = useSearchParams()
    const filterProblemId = searchParams.get('problemId')

    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [isFetchingCode, setIsFetchingCode] = useState(false)

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user) return

            try {
                let url = `/api/compiler/submit?userId=${user.id}`
                if (filterProblemId) {
                    url += `&problemId=${filterProblemId}`
                }

                const response = await fetch(url)
                const data = await response.json()
                setSubmissions(data.submissions || [])

                // If a submission was already selected, update it if it's in the list
                if (selectedSubmission) {
                    const updated = (data.submissions || []).find((s: Submission) => s.id === selectedSubmission.id)
                    if (updated) setSelectedSubmission(updated)
                }
            } catch (error) {
                console.error('Failed to fetch submissions:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (authStatus === 'connected') {
            fetchSubmissions()
        } else if (authStatus === 'guest') {
            setIsLoading(false)
        }
    }, [user, authStatus, filterProblemId])

    const handleFetchCode = async () => {
        if (!selectedSubmission || !selectedSubmission.cfId || !selectedSubmission.contestId) return

        setIsFetchingCode(true)
        const toastId = toast.loading("Syncing with Codeforces...")

        try {
            const res = await fetch('/api/compiler/fetch-submission-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contestId: selectedSubmission.contestId,
                    submissionId: selectedSubmission.cfId
                })
            })

            const data = await res.json()

            if (res.ok && data.code) {
                const updatedSub = { ...selectedSubmission, code: data.code }
                setSelectedSubmission(updatedSub)
                setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? updatedSub : s))
                toast.success("Code retrieved successfully!", { id: toastId })
            } else {
                // Determine the best way to explain the failure
                const cfLink = `https://codeforces.com/contest/${selectedSubmission.contestId}/submission/${selectedSubmission.cfId}`
                const isBlocked = res.status === 403 || data.error?.toLowerCase().includes('cloudflare') || data.error?.toLowerCase().includes('blocked')

                toast.error(isBlocked ? "Codeforces Sync Blocked" : "Fetch Failed", {
                    id: toastId,
                    description: (
                        <div className="mt-2 space-y-2">
                            <p className="text-[10px] leading-relaxed opacity-90">
                                {data.error || "This submission might be private or protected by Cloudflare."}
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

                // Still update the UI to show why it's not there if it was a block
                if (isBlocked && !selectedSubmission.code) {
                    const fallbackCode = `// Fetch failed: ${data.error || 'Access blocked'}\n// Due to privacy settings or protection, we couldn't retrieve this code auto-magically.\n// Please visit: ${cfLink}`
                    setSelectedSubmission({ ...selectedSubmission, code: fallbackCode })
                }
            }
        } catch (error) {
            console.error('Fetch code error:', error)
            toast.error("An error occurred during sync", { id: toastId })
        } finally {
            setIsFetchingCode(false)
        }
    }

    const getVerdictIcon = (verdict: string) => {
        switch (verdict) {
            case 'AC': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case 'OK': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            case 'WA': return <XCircle className="h-4 w-4 text-red-500" />
            case 'TLE': return <Clock className="h-4 w-4 text-amber-500" />
            case 'CE': return <AlertCircle className="h-4 w-4 text-zinc-500" />
            default: return <AlertCircle className="h-4 w-4 text-zinc-500" />
        }
    }

    const getVerdictStyle = (verdict: string) => {
        switch (verdict) {
            case 'AC': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            case 'OK': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            case 'WA': return 'bg-red-500/10 text-red-600 border-red-500/20'
            case 'TLE': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            default: return 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20'
        }
    }

    if (authStatus === 'loading' || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner label="Retrieving archive..." />
            </div>
        )
    }

    if (authStatus === 'guest') {
        return (
            <div className="container mx-auto max-w-4xl py-20 px-6 text-center">
                <div className="bg-card/50 backdrop-blur-xl border border-zinc-200 dark:border-white/5 rounded-[32px] p-12 shadow-2xl">
                    <HistoryIcon className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                    <h1 className="text-3xl font-black tracking-tight mb-4 uppercase">Archive Locked</h1>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-bold text-sm tracking-widest uppercase">
                        History is only available for connected agents. Please authenticate to view your records.
                    </p>
                    <Button asChild size="lg" className="rounded-2xl font-black uppercase tracking-widest">
                        <Link href="/connect">Connect Account</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <Link
                        href={filterProblemId ? `/compiler?problemId=${filterProblemId}` : "/compiler"}
                        className="flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-2"
                    >
                        <ChevronLeft className="mr-1 h-3 w-3" />
                        Back to IDE
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-primary rounded-full" />
                        <h1 className="text-4xl font-black tracking-tight uppercase">Submission History</h1>
                    </div>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest pl-5">
                        Local Archive: {filterProblemId ? `Problem ${filterProblemId}` : 'All Challenges'}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" asChild className="rounded-xl font-bold text-xs uppercase tracking-widest">
                        <Link href={filterProblemId ? `/compiler?problemId=${filterProblemId}` : "/compiler"}>
                            <Code2 className="mr-2 h-4 w-4" />
                            Open IDE
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table View */}
                <div className="lg:col-span-2">
                    {submissions.length === 0 ? (
                        <Card className="border-dashed h-[400px] flex flex-col items-center justify-center p-8 bg-card/20 rounded-[32px]">
                            <div className="p-4 rounded-full bg-muted/20 mb-4">
                                <HistoryIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                            </div>
                            <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase text-center max-w-[200px]">
                                No submissions found in the database.
                            </p>
                        </Card>
                    ) : (
                        <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-[32px] overflow-hidden shadow-2xl">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b border-border/50 h-14">
                                        <TableHead className="pl-6 font-black text-[10px] uppercase tracking-widest">Problem</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Language</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">IDE</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-right pr-6">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((sub) => (
                                        <TableRow
                                            key={sub.id}
                                            className={`cursor-pointer hover:bg-primary/[0.03] transition-colors h-16 border-b border-border/20 ${selectedSubmission?.id === sub.id ? 'bg-primary/5' : ''}`}
                                            onClick={() => setSelectedSubmission(sub)}
                                        >
                                            <TableCell className="pl-6 font-bold text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-muted-foreground mb-0.5">{sub.problemId}</span>
                                                    {sub.source === 'codeforces' && (
                                                        <span className="text-[8px] text-indigo-500 font-black uppercase tracking-tighter">CF Official</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`rounded-lg py-1 px-2 font-bold text-[10px] ${getVerdictStyle(sub.verdict)}`}>
                                                    <div className="flex items-center gap-1.5 uppercase">
                                                        {getVerdictIcon(sub.verdict)}
                                                        {sub.verdict} ({sub.testsPassed}/{sub.testsTotal || '?'})
                                                    </div>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                                                {sub.language}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Link href={`/compiler?problemId=${sub.problemId}`}>
                                                        <Code2 className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 text-[10px] text-muted-foreground font-bold font-mono">
                                                {format(new Date(sub.createdAt), 'MMM dd | HH:mm')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Details View */}
                <div className="lg:col-span-1">
                    {selectedSubmission ? (
                        <div className="sticky top-24 space-y-6 animate-in fade-in slide-in-from-right duration-500">
                            <Card className="border-border/50 bg-card rounded-[32px] overflow-hidden shadow-2xl">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className={getVerdictStyle(selectedSubmission.verdict)} variant="outline">
                                            {selectedSubmission.verdict}
                                        </Badge>
                                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                                            {format(new Date(selectedSubmission.createdAt), 'PPpp')}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Submission Details</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                                                <Timer className="h-3 w-3" /> Runtime
                                            </div>
                                            <div className="text-sm font-bold font-mono">{(selectedSubmission.runtime || 0).toFixed(3)}s</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                                                <Database className="h-3 w-3" /> Memory
                                            </div>
                                            <div className="text-sm font-bold font-mono">{(selectedSubmission.memory || 0).toFixed(1)} KB</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                                                <Languages className="h-3 w-3" /> Language
                                            </div>
                                            <div className="text-sm font-bold uppercase font-mono truncate">{selectedSubmission.language}</div>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/20 border border-border/50">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" /> Score
                                            </div>
                                            <div className="text-sm font-bold font-mono">
                                                {selectedSubmission.testsTotal ? (selectedSubmission.testsPassed / selectedSubmission.testsTotal * 100).toFixed(0) : '100'}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest">Source Code</h3>
                                            <div className="flex gap-2">
                                                {selectedSubmission.code ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(selectedSubmission.code || '')
                                                            toast.success("Code copied to clipboard")
                                                        }}
                                                    >
                                                        Copy Code
                                                    </Button>
                                                ) : selectedSubmission.source === 'codeforces' && (
                                                    <Button
                                                        onClick={handleFetchCode}
                                                        disabled={isFetchingCode}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-[10px] font-black uppercase tracking-widest border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/10"
                                                    >
                                                        {isFetchingCode ? <RotateCcw className="h-3 w-3 mr-1 animate-spin" /> : <RotateCcw className="h-3 w-3 mr-1" />}
                                                        Fetch From CF
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <pre className="p-4 rounded-2xl bg-zinc-950 text-zinc-300 text-[11px] font-mono overflow-x-auto min-h-[100px] max-h-[300px] border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
                                                {selectedSubmission.code || (selectedSubmission.source === 'codeforces' ? "// Official code not yet fetched from CF.\n// Click 'Fetch From CF' above to retrieve it." : "// No code available for this record.")}
                                            </pre>
                                            <div className="absolute inset-0 rounded-2xl border border-primary/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                                        </div>
                                    </div>

                                    <Button asChild className="w-full rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-indigo-600 hover:bg-indigo-700">
                                        <Link href={`/compiler?problemId=${selectedSubmission.problemId}`}>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Reload in IDE
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="hidden lg:block">
                            <Card className="border-dashed h-[400px] flex flex-col items-center justify-center p-8 bg-card/10 rounded-[32px] border-border/50">
                                <HistoryIcon className="h-10 w-10 text-muted-foreground opacity-10 mb-4" />
                                <p className="text-muted-foreground font-black tracking-widest text-[10px] uppercase text-center">
                                    Select a record to view <br /> full diagnostics
                                </p>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function SubmissionHistoryPage() {
    return (
        <React.Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner label="Connecting to archives..." />
            </div>
        }>
            <SubmissionHistoryContent />
        </React.Suspense>
    )
}
