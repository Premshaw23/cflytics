import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { requireAuthUser } from "@/lib/auth/session";
import { normalizeProblemId } from "@/lib/utils";

const noteSchema = z.object({
  problemId: z.string().min(1),
  content: z.string(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId");

  const authUser = await requireAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (problemId) {
      const note = await prisma.note.findUnique({
        where: {
          userId_problemId: {
            userId: authUser.id,
            problemId: normalizeProblemId(problemId)
          }
        }
      });
      return NextResponse.json({ note });
    }

    const notes = await prisma.note.findMany({
      where: { userId: authUser.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = await requireAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = noteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { problemId, content } = result.data;

    const note = await prisma.note.upsert({
      where: {
        userId_problemId: {
          userId: authUser.id,
          problemId: normalizeProblemId(problemId)
        }
      },
      update: { content },
      create: {
        userId: authUser.id,
        problemId: normalizeProblemId(problemId),
        content
      }
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
