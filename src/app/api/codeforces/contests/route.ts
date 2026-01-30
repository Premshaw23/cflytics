import { NextRequest, NextResponse } from "next/server";
import { codeforcesApi } from "@/lib/api/codeforces";
import { getFromCache, setCache } from "@/lib/db/redis";
import { CACHE_TTL } from "@/config/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gym = searchParams.get("gym") === "true";
  
  try {
    const cacheKey = `cf:contests:${gym ? "gym" : "regular"}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const contestData = await codeforcesApi.getContestList(gym);
    await setCache(cacheKey, contestData, CACHE_TTL.CONTESTS);

    return NextResponse.json(contestData);
  } catch (error: any) {
    console.error("API Route Error (contests):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
