import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const bookmarkSchema = z.object({
  handle: z.string().min(1),
  problemId: z.string().min(1),
  name: z.string().min(1),
  rating: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json({ error: "Handle is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { handle },
      include: { 
        bookmarks: { 
          orderBy: { createdAt: "desc" } 
        } 
      },
    });

    if (!user) {
      return NextResponse.json({ bookmarks: [] });
    }

    return NextResponse.json({ bookmarks: user.bookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = bookmarkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { handle, problemId, name, rating } = result.data;

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { handle } });
    
    if (!user) {
      user = await prisma.user.create({
        data: { handle }
      });
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: user.id,
          problemId
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
          userId: user.id,
          problemId,
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Bookmark ID is required" }, { status: 400 });
    }

    try {
        await prisma.bookmark.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting bookmark:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
