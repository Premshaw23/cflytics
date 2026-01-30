import { NextRequest, NextResponse } from "next/server";
import { codeforcesApi } from "@/lib/api/codeforces";
import { getFromCache, setCache } from "@/lib/db/redis";
import { CACHE_TTL } from "@/config/constants";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const handlesParam = searchParams.get("handles");
  
  if (!handlesParam) {
    return NextResponse.json({ error: "Handles parameter is required" }, { status: 400 });
  }

  const handles = handlesParam.split(";").filter(Boolean);

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
