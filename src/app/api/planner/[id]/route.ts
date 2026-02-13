import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

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
        ...(body.content !== undefined && {
          content: body.content === null ? Prisma.JsonNull : body.content,
        }),
      },
    });

    return NextResponse.json({ planner: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// Duplicate a planner
export async function POST(
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

  const duplicated = await prisma.planner.create({
    data: {
      title: `${planner.title} (copy)`,
      description: planner.description,
      content: planner.content === null ? Prisma.JsonNull : planner.content,
      userId: user.id,
    },
  });

  return NextResponse.json({ planner: duplicated }, { status: 201 });
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
