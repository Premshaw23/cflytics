import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const problemId = searchParams.get('problemId')

  if (!userId || !problemId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const customCases = await prisma.customTestCase.findMany({
      where: { userId, problemId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ customCases })
  } catch (error) {
    console.error('Error fetching custom test cases:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, problemId, testCases } = await request.json()

    if (!userId || !problemId || !Array.isArray(testCases)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Replace all existing custom cases for this user/problem
    // This is a simple way to sync the state
    await prisma.$transaction([
      prisma.customTestCase.deleteMany({
        where: { userId, problemId },
      }),
      prisma.customTestCase.createMany({
        data: testCases
          .filter(tc => tc.input.trim() || tc.expectedOutput.trim())
          .map(tc => ({
            userId,
            problemId,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing custom test cases:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
