import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { scrapeProblem } from '@/lib/api/scraper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const problemId = searchParams.get('problemId')
  
  if (!problemId) {
    return NextResponse.json({ error: 'Problem ID required' }, { status: 400 })
  }

  try {
    const match = problemId.match(/^(\d+)([a-zA-Z0-9]+)$/) || problemId.match(/^(\d+)-([a-zA-Z0-9]+)$/)
    if (!match) {
        return NextResponse.json({ error: 'Invalid Problem ID format' }, { status: 400 })
    }

    const contestId = match[1]
    const index = match[2]

    const scrapedData = await scrapeProblem(contestId, index)
    
    if (!scrapedData) {
        return NextResponse.json({ error: 'Problem not found on Codeforces' }, { status: 404 })
    }

    const sampleTestCases = scrapedData.sampleTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.output
    }))

    return NextResponse.json({ 
      testCases: sampleTestCases,
      metadata: {
          name: scrapedData.name,
          timeLimit: scrapedData.timeLimit,
          memoryLimit: scrapedData.memoryLimit
      }
    })
  } catch (error) {
    console.error('Error fetching test cases:', error)
    return NextResponse.json({ error: 'Failed to fetch test cases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { problemId, userId, input, expectedOutput } = await request.json()
    
    if (!problemId || !userId || !input || !expectedOutput) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const customTestCase = await prisma.customTestCase.create({
      data: {
        problemId,
        userId,
        input,
        expectedOutput,
      }
    })

    return NextResponse.json({ success: true, customTestCase })
  } catch (error) {
    console.error('Error saving test case:', error)
    return NextResponse.json({ error: 'Failed to save test case' }, { status: 500 })
  }
}
