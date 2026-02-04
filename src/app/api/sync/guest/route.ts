import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { requireAuthUser } from "@/lib/auth/session";
import { normalizeProblemId } from "@/lib/utils";

const bodySchema = z.object({
  bookmarks: z
    .array(
      z.object({
        problemId: z.string().min(1),
        name: z.string().min(1),
        rating: z.number().int().nullable().optional(),
        createdAt: z.string().optional(), // ISO
      })
    )
    .optional()
    .default([]),
  notes: z
    .array(
      z.object({
        problemId: z.string().min(1),
        content: z.string(),
        updatedAt: z.string().optional(), // ISO
      })
    )
    .optional()
    .default([]),
  goals: z
    .array(
      z.object({
        type: z.enum(["RATING", "PROBLEMS_SOLVED", "CONTEST_RANK"]),
        target: z.number().int(),
        current: z.number().int().optional().default(0),
        deadline: z.string().nullable().optional(),
        completed: z.boolean().optional().default(false),
        createdAt: z.string().optional(), // ISO
        updatedAt: z.string().optional(), // ISO
      })
    )
    .optional()
    .default([]),
});

function keyForGoal(g: {
  type: string;
  target: number;
  deadline: string | null | undefined;
  createdAt?: string;
}) {
  return `${g.type}|${g.target}|${g.deadline ?? ""}|${g.createdAt ?? ""}`;
}

export async function POST(req: Request) {
  const authUser = await requireAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { bookmarks, notes, goals } = parsed.data;

  // Bookmarks: upsert by (userId, problemId)
  for (const b of bookmarks) {
    await prisma.bookmark.upsert({
      where: {
        userId_problemId: {
          userId: authUser.id,
          problemId: normalizeProblemId(b.problemId),
        },
      },
      update: {
        name: b.name,
        rating: b.rating ?? null,
      },
      create: {
        userId: authUser.id,
        problemId: normalizeProblemId(b.problemId),
        name: b.name,
        rating: b.rating ?? null,
        createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
      },
    });
  }

  // Notes: upsert by (userId, problemId)
  for (const n of notes) {
    await prisma.note.upsert({
      where: {
        userId_problemId: {
          userId: authUser.id,
          problemId: normalizeProblemId(n.problemId),
        },
      },
      update: {
        content: n.content,
        updatedAt: n.updatedAt ? new Date(n.updatedAt) : undefined,
      },
      create: {
        userId: authUser.id,
        problemId: normalizeProblemId(n.problemId),
        content: n.content,
        updatedAt: n.updatedAt ? new Date(n.updatedAt) : undefined,
      },
    });
  }

  // Goals: no unique constraint; dedupe by (type,target,deadline,createdAt)
  const existingGoals = await prisma.goal.findMany({
    where: { userId: authUser.id },
    select: { id: true, type: true, target: true, deadline: true, createdAt: true },
  });
  const existingKeys = new Set(
    existingGoals.map((g) =>
      keyForGoal({
        type: g.type,
        target: g.target,
        deadline: g.deadline ? g.deadline.toISOString() : null,
        createdAt: g.createdAt.toISOString(),
      })
    )
  );

  let goalsImported = 0;
  for (const g of goals) {
    const createdAtIso = g.createdAt ?? new Date().toISOString();
    const k = keyForGoal({ type: g.type, target: g.target, deadline: g.deadline ?? null, createdAt: createdAtIso });
    if (existingKeys.has(k)) continue;

    await prisma.goal.create({
      data: {
        userId: authUser.id,
        type: g.type,
        target: g.target,
        current: g.current,
        deadline: g.deadline ? new Date(g.deadline) : null,
        completed: g.completed,
        createdAt: new Date(createdAtIso),
        updatedAt: new Date(g.updatedAt ?? createdAtIso),
      },
    });
    existingKeys.add(k);
    goalsImported++;
  }

  return NextResponse.json({
    ok: true,
    imported: {
      bookmarks: bookmarks.length,
      notes: notes.length,
      goals: goalsImported,
    },
  });
}

