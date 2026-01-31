import { NextRequest, NextResponse } from "next/server";
import { codeforcesApi } from "@/lib/api/codeforces";
import { getFromCache, setCache } from "@/lib/db/redis";
import { CACHE_TTL } from "@/config/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let handle = searchParams.get("handle");
  const from = parseInt(searchParams.get("from") || "1");
  const count = searchParams.get("count") ? parseInt(searchParams.get("count")!) : undefined;
  
  if (!handle) {
    return NextResponse.json({ error: "Handle parameter is required" }, { status: 400 });
  }

  // Fallback for 'me' or invalid handles to a demo user
  if (handle.toLowerCase() === "me" || handle.length < 3) {
    handle = "tourist";
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
    if (error.message && (error.message.includes("not found") || error.message.includes("User"))) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("API Route Error (submissions):", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
