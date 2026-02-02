import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session.user) {
      return NextResponse.json({ solvedIds: [], attemptedIds: [] });
    }

    // 1. Get user's CF handle
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { handle: true }
    });

    if (!user?.handle) {
      return NextResponse.json({ solvedIds: [], attemptedIds: [] });
    }

    // 2. Fetch Solved Problems from Codeforces API
    let solvedIds = new Set<string>();
    try {
      const cfResponse = await fetch(`https://codeforces.com/api/user.status?handle=${user.handle}&from=1&count=1000`, {
        cache: 'no-store' 
      });
      const cfData = await cfResponse.json();
      
      if (cfData.status === 'OK') {
        cfData.result.forEach((sub: any) => {
          if (sub.verdict === 'OK') {
            const problemId = `${sub.problem.contestId}${sub.problem.index}`;
            solvedIds.add(problemId);
          }
        });
      }
    } catch (cfError) {
      console.error("CF API Error:", cfError);
      // If CF API fails, we continue with empty solvedIds or could potentially rely on history
    }

    // 3. Fetch Attempted Problems from Local DB
    const localSubmissions = await prisma.submission.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        problemId: true,
        verdict: true,
      },
    });

    const attemptedIds = new Set<string>();
    localSubmissions.forEach((s) => {
      if (s.verdict === 'AC') {
        solvedIds.add(s.problemId);
      } else {
        attemptedIds.add(s.problemId);
      }
    });

    return NextResponse.json({
      solvedIds: Array.from(solvedIds),
      attemptedIds: Array.from(attemptedIds),
    });
  } catch (error: any) {
    console.error("API Error (problems-status):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
