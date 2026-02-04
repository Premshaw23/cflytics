import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { requireAuthUser } from "@/lib/auth/session";
import { normalizeProblemId } from "@/lib/utils";

const bookmarkSchema = z.object({
  problemId: z.string().min(1),
  name: z.string().min(1),
  rating: z.number().int().optional(),
});

export async function GET(_req: NextRequest) {
  const authUser = await requireAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
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
    const result = bookmarkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { problemId, name, rating } = result.data;

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: authUser.id,
          problemId: normalizeProblemId(problemId)
        }
      }
    });

    if (existing) {
      // Toggle off: remove bookmark
      await prisma.bookmark.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      // Toggle on: add bookmark
      const bookmark = await prisma.bookmark.create({
        data: {
          userId: authUser.id,
          problemId: normalizeProblemId(problemId),
          name,
          rating
        },
      });
      return NextResponse.json({ bookmarked: true, bookmark }, { status: 201 });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    const authUser = await requireAuthUser();
    if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Bookmark ID is required" }, { status: 400 });
    }

    try {
        const deleted = await prisma.bookmark.deleteMany({
            where: { id, userId: authUser.id }
        });

        if (deleted.count === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting bookmark:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
