import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code, language, problemId, userId } = await request.json()

    if (!code || !language || !problemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const sharedSolution = await prisma.sharedSolution.create({
      data: {
        code,
        language,
        problemId,
        userId: userId || null,
      },
    })

    return NextResponse.json({ 
      success: true, 
      shareId: sharedSolution.id,
      url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${sharedSolution.id}`
    })
  } catch (error) {
    console.error('Error sharing solution:', error)
    return NextResponse.json({ error: 'Failed to share solution' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing share ID' }, { status: 400 })
  }

  try {
    const sharedSolution = await prisma.sharedSolution.findUnique({
      where: { id },
    })

    if (!sharedSolution) {
      return NextResponse.json({ error: 'Solution not found' }, { status: 404 })
    }

    return NextResponse.json({ solution: sharedSolution })
  } catch (error) {
    console.error('Error fetching shared solution:', error)
    return NextResponse.json({ error: 'Failed to fetch shared solution' }, { status: 500 })
  }
}
