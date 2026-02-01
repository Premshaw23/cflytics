import { NextRequest, NextResponse } from 'next/server';
import { scrapeSubmission } from '@/lib/api/scraper';

export async function POST(request: NextRequest) {
  try {
    const { contestId, submissionId } = await request.json();

    if (!contestId || !submissionId) {
      return NextResponse.json({ error: 'Missing contestId or submissionId' }, { status: 400 });
    }

    const { code, error: scraperError } = await scrapeSubmission(contestId.toString(), submissionId.toString());

    if (!code) {
      return NextResponse.json({ 
        error: scraperError || 'Could not fetch code. Submission might be private or Cloudflare blocked the request.',
        details: 'Try opening the submission directly on Codeforces to ensure it is public.'
      }, { status: 403 });
    }

    return NextResponse.json({ code });
  } catch (error) {
    console.error('Error fetching submission code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
