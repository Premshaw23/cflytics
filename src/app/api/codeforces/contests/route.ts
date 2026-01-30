import { NextResponse } from "next/server";
import { codeforcesApi } from "@/lib/api/codeforces";
import { cache } from "@/lib/db/redis";

// Cache contests for 1 hour as they don't change that often
const CACHE_TTL = 3600; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gym = searchParams.get("gym") === "true";
  
  const cacheKey = `contests:${gym}`;
  
  try {
    // Try to get from cache
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Fetch from Codeforces
    const contests = await codeforcesApi.getContestList(gym);
    
    // Store in cache
    await cache.set(cacheKey, contests, CACHE_TTL);
    
    return NextResponse.json(contests);
  } catch (error: any) {
    console.error("API Route Error (contests):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
