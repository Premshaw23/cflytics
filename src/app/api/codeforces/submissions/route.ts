import { NextRequest, NextResponse } from "next/server";
import { codeforcesApi } from "@/lib/api/codeforces";
import { getFromCache, setCache } from "@/lib/db/redis";
import { CACHE_TTL } from "@/config/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const handle = searchParams.get("handle");
  const from = parseInt(searchParams.get("from") || "1");
  const count = searchParams.get("count") ? parseInt(searchParams.get("count")!) : undefined;
  
  if (!handle) {
    return NextResponse.json({ error: "Handle parameter is required" }, { status: 400 });
  }

  try {
    const cacheKey = `cf:submissions:${handle}:${from}:${count || "all"}`;
    const cachedData = await getFromCache(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const submissionData = await codeforcesApi.getUserStatus(handle, from, count);
    await setCache(cacheKey, submissionData, CACHE_TTL.USER_STATUS);

    return NextResponse.json(submissionData);
  } catch (error: any) {
    console.error("API Route Error (submissions):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
