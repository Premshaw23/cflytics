import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/api/rate-limiter";

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to /api/codeforces routes
  if (request.nextUrl.pathname.startsWith("/api/codeforces")) {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const result = await rateLimit(ip, 20, 60); // 20 requests per minute

    if (!result.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
