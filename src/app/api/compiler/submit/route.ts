import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { normalizeProblemId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      problemId, 
      language, 
      code, 
      verdict, 
      runtime, 
      memory, 
      testsPassed, 
      testsTotal,
      tags,
      rating
    } = await request.json()

    if (!problemId || !language || !code || !verdict) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId: normalizeProblemId(problemId),
        language,
        code,
        verdict,
        runtime,
        memory,
        testsPassed,
        testsTotal,
        tags: tags || [],
        rating: rating || null,
      },
    })

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error('Error saving submission:', error)
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const problemId = searchParams.get('problemId')

  if (!userId && !problemId) {
    return NextResponse.json({ submissions: [] })
  }

  try {
    const where: any = {}
    if (userId) where.userId = userId
    if (problemId) where.problemId = normalizeProblemId(problemId)

    // 1. Fetch Local Submissions
    const localSubmissions = await prisma.submission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const formattedLocal = localSubmissions.map(s => ({
      ...s,
      source: 'local'
    }))

    // 2. Fetch Codeforces Submissions if handle exists
    let cfSubmissions: any[] = []
    if (userId && problemId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { handle: true }
      })

      if (user?.handle) {
        try {
          // Normalize and extract contestId/index
          const normProblemId = normalizeProblemId(problemId)
          const match = normProblemId.match(/^(\d+)([a-zA-Z0-9]+)$/)
          if (match) {
            const contestId = match[1]
            const index = match[2]
            
            const cfResponse = await fetch(`https://codeforces.com/api/user.status?handle=${user.handle}&from=1&count=50`, {
              next: { revalidate: 60 } // Cache for 1 min
            })
            const cfData = await cfResponse.json()

            if (cfData.status === 'OK') {
              cfSubmissions = cfData.result
                .filter((sub: any) => 
                  sub.problem.contestId.toString() === contestId && 
                  sub.problem.index === index
                )
                .map((sub: any) => ({
                  id: `cf-${sub.id}`,
                  userId,
                  problemId,
                  language: sub.programmingLanguage,
                  code: null, // Code not available in API
                  verdict: sub.verdict === 'OK' ? 'AC' : sub.verdict,
                  runtime: sub.timeConsumedMillis / 1000,
                  memory: sub.memoryConsumedBytes / 1024,
                  testsPassed: sub.passedTestCount,
                  testsTotal: sub.problem.points ? Math.round(sub.problem.points) : 0, // Points is not testsTotal but best we have
                  createdAt: new Date(sub.creationTimeSeconds * 1000),
                  source: 'codeforces',
                  cfId: sub.id,
                  contestId: sub.contestId
                }))
            }
          }
        } catch (cfError) {
          console.error("Failed to fetch CF submissions:", cfError);
        }
      }
    }

    // 3. Merge and Sort
    const allSubmissions = [...formattedLocal, ...cfSubmissions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 30)

    return NextResponse.json({ submissions: allSubmissions })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
