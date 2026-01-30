import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import redis from "@/lib/db/redis";

export async function GET() {
  const status = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    services: {
      database: "unknown",
      redis: "unknown",
    },
  };

  try {
    // Check DB
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = "online";
  } catch (e: any) {
    console.error("Health check DB error:", e.message);
    status.services.database = "offline";
  }

  try {
    // Check Redis
    await redis.ping();
    status.services.redis = "online";
  } catch (e: any) {
    console.error("Health check Redis error:", e.message);
    status.services.redis = "offline";
  }

  const isHealthy = status.services.database === "online" && status.services.redis === "online";

  return NextResponse.json(status, { status: isHealthy ? 200 : 503 });
}
