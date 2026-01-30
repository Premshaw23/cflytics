import { NextRequest, NextResponse } from "next/server";
import { codeforcesApi } from "@/lib/api/codeforces";
import { getFromCache, setCache } from "@/lib/db/redis";
import { CACHE_TTL } from "@/config/constants";
import { rateLimit } from "@/lib/api/rate-limiter";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const handlesParam = searchParams.get("handles");
  
  if (!handlesParam) {
    return NextResponse.json({ error: "Handles parameter is required" }, { status: 400 });
  }

  const handles = handlesParam.split(";").filter(Boolean);
  
  // Basic rate limiting by IP (identifier can be improved)
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const limitResult = await rateLimit(ip, 10, 60); // 10 requests per minute

  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" }, 
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limitResult.limit.toString(),
          "X-RateLimit-Remaining": limitResult.remaining.toString(),
          "X-RateLimit-Reset": limitResult.reset.toString(),
        }
      }
    );
  }

  try {
    const cacheKey = `cf:user:${handles.sort().join(";")}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const userData = await codeforcesApi.getUserInfo(handles);
    await setCache(cacheKey, userData, CACHE_TTL.USER_INFO);

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error("API Route Error (user):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
