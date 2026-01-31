import { NextRequest, NextResponse } from "next/server";
import { codeforcesApi } from "@/lib/api/codeforces";
import { getFromCache, setCache } from "@/lib/db/redis";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const count = parseInt(searchParams.get("count") || "10"); // Default small count
  
  if (!id) {
    return NextResponse.json({ error: "Contest ID is required" }, { status: 400 });
  }

  try {
    const cacheKey = `cf:contest:${id}:${count}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const contestData = await codeforcesApi.getContestStandings(parseInt(id), 1, count, false);
    
    // Cache for shorter time if contest is running, longer if finished
    await setCache(cacheKey, contestData, 300); // 5 minutes

    return NextResponse.json(contestData);
  } catch (error: unknown) {
    console.error("API Route Error (contest):", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
