import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/auth/session";

const bodySchema = z.object({
  challengeId: z.string().min(1),
});

type CodeforcesUserInfoResponse =
  | { status: "OK"; result: Array<Record<string, unknown>> }
  | { status: "FAILED"; comment?: string };

async function fetchCodeforcesUser(handle: string) {
  const url = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Codeforces API error: ${res.status}`);
  const data = (await res.json()) as CodeforcesUserInfoResponse;
  if (data.status !== "OK" || !("result" in data) || !data.result?.[0]) {
    const comment = "comment" in data ? data.comment : undefined;
    throw new Error(comment || "Failed to fetch Codeforces user");
  }
  return data.result[0] as Record<string, unknown>;
}

function getProfileStringField(user: Record<string, unknown>, key: string) {
  const v = user[key];
  return typeof v === "string" ? v : "";
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const challenge = await prisma.loginChallenge.findUnique({
    where: { id: parsed.data.challengeId },
  });

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  if (challenge.consumedAt) {
    return NextResponse.json({ error: "Challenge already used" }, { status: 400 });
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
  }

  const cfUser = await fetchCodeforcesUser(challenge.handle);
  const organization = getProfileStringField(cfUser, "organization");
  const firstName = getProfileStringField(cfUser, "firstName");
  const lastName = getProfileStringField(cfUser, "lastName");

  const haystack = `${organization} ${firstName} ${lastName}`.toLowerCase();
  const needle = challenge.token.toLowerCase();

  if (!haystack.includes(needle)) {
    return NextResponse.json(
      {
        error: "Verification failed",
        hint:
          "Put the exact token into your Codeforces profile Organization field, wait a few seconds, then try again.",
      },
      { status: 403 }
    );
  }

  // Create (or fetch) user row for this handle
  const handle = (typeof cfUser.handle === "string" ? cfUser.handle : challenge.handle).trim();
  const user = await prisma.user.upsert({
    where: { handle },
    update: {},
    create: { handle },
    select: { id: true, handle: true },
  });

  await prisma.loginChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  const session = await getAuthSession();
  session.user = { id: user.id, handle: user.handle };
  await session.save();

  return NextResponse.json({
    ok: true,
    user: session.user,
  });
}

