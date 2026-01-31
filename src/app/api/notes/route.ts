import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const noteSchema = z.object({
  handle: z.string().min(1),
  problemId: z.string().min(1),
  content: z.string(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle");
  const problemId = searchParams.get("problemId");

  if (!handle) {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { handle },
      include: {
        notes: {
          orderBy: { updatedAt: "desc" }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ notes: [], note: null });
    }

    if (problemId) {
      const note = await prisma.note.findUnique({
        where: {
          userId_problemId: {
            userId: user.id,
            problemId
          }
        }
      });
      return NextResponse.json({ note });
    }

    return NextResponse.json({ notes: user.notes });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = noteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { handle, problemId, content } = result.data;

    let user = await prisma.user.findUnique({ where: { handle } });
    
    if (!user) {
      user = await prisma.user.create({
        data: { handle }
      });
    }

    const note = await prisma.note.upsert({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId
        }
      },
      update: { content },
      create: {
        userId: user.id,
        problemId,
        content
      }
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
