import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";

export async function POST() {
  const session = await getAuthSession();
  await session.destroy();
  return NextResponse.json({ ok: true });
}

