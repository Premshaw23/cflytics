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

    try {
      const contestData = await codeforcesApi.getContestStandings(parseInt(id), 1, count, false);
      // Cache for shorter time if contest is running, longer if finished
      await setCache(cacheKey, contestData, 300); // 5 minutes
      return NextResponse.json(contestData);
    } catch (error: any) {
      if (error.message?.includes("not started")) {
        // Fallback: Get basic info from contest list
        // Try to check cache first
        let allContests = await getFromCache<any[]>(`contests:false`);
        
        if (!allContests) {
          allContests = await codeforcesApi.getContestList();
          await setCache(`contests:false`, allContests, 3600);
        }

        const contest = allContests?.find((c: any) => c.id === parseInt(id));
        
        if (contest) {
          const fallbackData = {
            contest,
            problems: [],
            rows: []
          };
          await setCache(cacheKey, fallbackData, 3600); // Cache for 1 hour since it hasn't started
          return NextResponse.json(fallbackData);
        }
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error("API Route Error (contest):", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
