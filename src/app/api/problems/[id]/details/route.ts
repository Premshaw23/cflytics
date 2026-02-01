import { NextRequest, NextResponse } from 'next/server'
import { scrapeProblem } from '@/lib/api/scraper'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    
    try {
        const searchParams = request.nextUrl.searchParams
        const force = searchParams.get('force') === 'true'

        const match = id.match(/^(\d+)([a-zA-Z0-9]+)$/) || id.match(/^(\d+)-([a-zA-Z0-9]+)$/)
        if (!match) {
            return NextResponse.json({ error: 'Invalid Problem ID format' }, { status: 400 })
        }

        const contestId = match[1]
        const index = match[2]

        const problem = await scrapeProblem(contestId, index, force)
        
        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
        }

        return NextResponse.json(problem)
    } catch (error) {
        console.error('Error fetching problem details:', error)
        return NextResponse.json({ error: 'Failed to fetch problem details' }, { status: 500 })
    }
}
