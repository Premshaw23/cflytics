import { NextRequest, NextResponse } from "next/server";
import { codeforcesApi } from "@/lib/api/codeforces";
import { getFromCache, setCache } from "@/lib/db/redis";
import { CACHE_TTL } from "@/config/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(";") : undefined;
  
  try {
    const cacheKey = `cf:problems:${tags ? tags.sort().join(";") : "all"}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const problemData = await codeforcesApi.getProblems(tags);
    await setCache(cacheKey, problemData, CACHE_TTL.PROBLEMS);

    return NextResponse.json(problemData);
  } catch (error: any) {
    console.error("API Route Error (problems):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
