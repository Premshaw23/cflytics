import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/db/redis";

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Key parameter is required" }, { status: 400 });
  }

  try {
    await redis.del(key);
    return NextResponse.json({ message: `Cache key ${key} deleted successfully` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Key parameter is required" }, { status: 400 });
  }

  try {
    const data = await redis.get(key);
    if (!data) {
      return NextResponse.json({ message: "Key not found" }, { status: 404 });
    }
    return NextResponse.json(JSON.parse(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
