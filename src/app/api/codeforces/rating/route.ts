import { NextRequest, NextResponse } from "next/server";
import { codeforcesApi } from "@/lib/api/codeforces";
import { getFromCache, setCache } from "@/lib/db/redis";
import { CACHE_TTL } from "@/config/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const handle = searchParams.get("handle");
  
  if (!handle) {
    return NextResponse.json({ error: "Handle parameter is required" }, { status: 400 });
  }

  try {
    const cacheKey = `cf:rating:${handle}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const ratingData = await codeforcesApi.getUserRating(handle);
    await setCache(cacheKey, ratingData, CACHE_TTL.USER_RATING);

    return NextResponse.json(ratingData);
  } catch (error: any) {
    if (error.message && (error.message.includes("not found") || error.message.includes("User"))) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("API Route Error (rating):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
