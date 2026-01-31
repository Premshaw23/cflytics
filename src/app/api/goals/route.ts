import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { requireAuthUser } from "@/lib/auth/session";

const createGoalSchema = z.object({
  type: z.enum(["RATING", "PROBLEMS_SOLVED", "CONTEST_RANK"]),
  target: z.number().int().positive(),
  deadline: z.string().optional(), // ISO date string
});

const updateGoalSchema = z.object({
  id: z.string().cuid(),
  current: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

export async function GET(_req: NextRequest) {
  const authUser = await requireAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const goals = await prisma.goal.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
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
    const result = createGoalSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { type, target, deadline } = result.data;

    const goal = await prisma.goal.create({
      data: {
        userId: authUser.id,
        type,
        target,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    const authUser = await requireAuthUser();
    if (!authUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = updateGoalSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues }, { status: 400 });
        }

        const { id, current, completed } = result.data;

        const updated = await prisma.goal.updateMany({
            where: { id, userId: authUser.id },
            data: {
                current,
                completed
            }
        });

        if (updated.count === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const goal = await prisma.goal.findFirst({ where: { id, userId: authUser.id } });
        return NextResponse.json({ goal });
    } catch (error) {
        console.error("Error updating goal:", error);
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
        return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }

    try {
        const deleted = await prisma.goal.deleteMany({
            where: { id, userId: authUser.id }
        });

        if (deleted.count === 0) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting goal:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
