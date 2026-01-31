import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";

const bodySchema = z.object({
  handle: z.string().min(1).max(64),
});

function createChallengeToken() {
  // short, human-copyable, but still unpredictable
  const rand = crypto.randomBytes(9).toString("base64url"); // ~12 chars
  return `codey-verify-${rand}`;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const handle = parsed.data.handle.trim();
  const token = createChallengeToken();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const challenge = await prisma.loginChallenge.create({
    data: { handle, token, expiresAt },
    select: { id: true, handle: true, token: true, expiresAt: true },
  });

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      handle: challenge.handle,
      token: challenge.token,
      expiresAt: challenge.expiresAt,
    },
    instructions: {
      field: "organization",
      value: challenge.token,
      url: "https://codeforces.com/settings/social",
      note: "Set your Codeforces profile 'Organization' to this value, then click Verify.",
    },
  });
}

