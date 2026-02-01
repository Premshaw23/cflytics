import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
    try {
        const { code, language, problemId, userId } = await request.json()

        if (!code || !language || !problemId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const shared = await prisma.sharedSolution.create({
            data: {
                code,
                language,
                problemId,
                userId: userId || null
            }
        })

        return NextResponse.json({ shareId: shared.id })
    } catch (error) {
        console.error('Error sharing solution:', error)
        return NextResponse.json({ error: 'Failed to share solution' }, { status: 500 })
    }
}
