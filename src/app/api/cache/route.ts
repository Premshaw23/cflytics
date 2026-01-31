import { NextRequest, NextResponse } from "next/server";
import { deleteCache, getFromCache } from "@/lib/db/redis";

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Key parameter is required" }, { status: 400 });
  }

  try {
    await deleteCache(key);
    return NextResponse.json({ message: `Cache key ${key} deleted successfully` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Key parameter is required" }, { status: 400 });
  }

  try {
    const data = await getFromCache<any>(key);
    if (!data) {
      return NextResponse.json({ message: "Key not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
