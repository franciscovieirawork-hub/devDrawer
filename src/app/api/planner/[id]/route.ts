import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

// Get a planner
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  const planner = await prisma.planner.findUnique({
    where: { id },
  });

  if (!planner || planner.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ planner });
}

// Update a planner (autosave content)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  const planner = await prisma.planner.findUnique({
    where: { id },
  });

  if (!planner || planner.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const body = await request.json();

    const updated = await prisma.planner.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
      },
    });

    return NextResponse.json({ planner: updated });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// Delete a planner
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  const planner = await prisma.planner.findUnique({
    where: { id },
  });

  if (!planner || planner.userId !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.planner.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
