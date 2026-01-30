import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const createGoalSchema = z.object({
  handle: z.string().min(1),
  type: z.enum(["RATING", "PROBLEMS_SOLVED", "CONTEST_RANK"]),
  target: z.number().int().positive(),
  deadline: z.string().optional(), // ISO date string
  description: z.string().optional(),
});

const updateGoalSchema = z.object({
  id: z.string().cuid(),
  current: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
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
      include: { goals: { orderBy: { createdAt: "desc" } } },
    });

    if (!user) {
      return NextResponse.json({ goals: [] });
    }

    return NextResponse.json({ goals: user.goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createGoalSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { handle, type, target, deadline, description } = result.data;

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { handle } });
    
    if (!user) {
      // If user doesn't exist, create them. Usually we fetch details from CF first, 
      // but for goals purpose, we need minimal user record.
      user = await prisma.user.create({
        data: { 
            handle,
            // Only create with handle initially. Other fields are optional or updated later.
        }
      });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
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
    try {
        const body = await req.json();
        const result = updateGoalSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues }, { status: 400 });
        }

        const { id, current, completed } = result.data;

        const goal = await prisma.goal.update({
            where: { id },
            data: {
                current,
                completed
            }
        });

        return NextResponse.json({ goal });
    } catch (error) {
        console.error("Error updating goal:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }

    try {
        await prisma.goal.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting goal:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
