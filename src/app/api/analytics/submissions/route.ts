import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { CFSubmission } from '@/types'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const handle = searchParams.get('handle')
    
    if (!handle) {
        return NextResponse.json({ error: 'Handle required' }, { status: 400 })
    }

    try {
        // 1. Fetch Codeforces submissions
        const cfRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`)
        const cfData = await cfRes.json()
        const cfSubmissions: CFSubmission[] = cfData.status === 'OK' ? cfData.result : []

        // 2. Fetch local submissions
        const user = await prisma.user.findUnique({
            where: { handle }
        })

        let combinedSubmissions = [...cfSubmissions]

        if (user) {
            const localSubmissions = await prisma.submission.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' }
            })

            // Map local to CF format
            const mappedLocal: CFSubmission[] = localSubmissions.map((sub: any) => {
                const match = sub.problemId.match(/^(\d+)([a-zA-Z0-9]+)$/) || sub.problemId.match(/^(\d+)-([a-zA-Z0-9]+)$/)
                const contestId = match ? match[1] : '0'
                const index = match ? match[2] : 'A'
                
                return {
                    id: Math.random(), // Dummy ID
                    contestId: parseInt(contestId),
                    creationTimeSeconds: Math.floor(sub.createdAt.getTime() / 1000),
                    relativeTimeSeconds: 0,
                    problem: {
                        contestId: parseInt(contestId),
                        index: index || 'A',
                        name: sub.problemId,
                        type: 'PROGRAMMING',
                        points: 0,
                        rating: sub.rating || 0,
                        tags: sub.tags || []
                    },
                    author: {
                        contestId: parseInt(contestId),
                        members: [{ handle }],
                        participantType: 'PRACTICE',
                        ghost: false,
                        startTimeSeconds: 0
                    },
                    programmingLanguage: sub.language,
                    verdict: sub.verdict === 'AC' ? 'OK' : sub.verdict,
                    testset: 'TESTS',
                    passedTestCount: sub.testsPassed,
                    timeConsumptionMillis: (sub.runtime || 0) * 1000,
                    memoryConsumptionBytes: (sub.memory || 0) * 1024
                } as CFSubmission
            })

            combinedSubmissions = [...mappedLocal, ...combinedSubmissions]
        }

        return NextResponse.json(combinedSubmissions)
    } catch (error) {
        console.error('Error fetching combined submissions:', error)
        return NextResponse.json({ error: 'Failed to fetch combined submissions' }, { status: 500 })
    }
}
