import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

// List planners for the user
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const planners = await prisma.planner.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ planners });
  } catch (error) {
    console.error("Error fetching planners:", error);
    return NextResponse.json(
      { error: "Failed to load planners. Please try again." },
      { status: 500 }
    );
  }
}

// Create new planner
export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const planner = await prisma.planner.create({
      data: {
        title,
        description: description || null,
        userId: user.id,
      },
    });

    return NextResponse.json({ planner }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
