import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session.user) {
      return NextResponse.json({ solvedIds: [] });
    }

    const solvedSubmissions = await prisma.submission.findMany({
      where: {
        userId: session.user.id,
        verdict: "AC",
      },
      select: {
        problemId: true,
      },
    });

    const solvedIds = Array.from(new Set(solvedSubmissions.map((s) => s.problemId)));

    return NextResponse.json({ solvedIds });
  } catch (error: any) {
    console.error("API Error (solved-problems):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
