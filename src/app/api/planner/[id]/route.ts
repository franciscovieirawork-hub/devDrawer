import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import {
  getPlannerWithAccess,
  canEdit,
  canShare,
  generatePublicSlug,
} from "@/lib/planner-access";
import { pusher } from "@/lib/pusher";

// Get a planner (owner or shared user)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const result = await getPlannerWithAccess(id, user);
  if (!result) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { planner, role } = result;
  return NextResponse.json({
    planner: {
      id: planner.id,
      title: planner.title,
      description: planner.description,
      content: planner.content,
      userId: planner.userId,
      isPublic: planner.isPublic,
      publicSlug: planner.publicSlug,
      createdAt: planner.createdAt,
      updatedAt: planner.updatedAt,
    },
    role,
  });
}

// Update a planner (owner or editor for content; only owner for title/sharing)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const result = await getPlannerWithAccess(id, user);
  if (!result) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { planner, role } = result;
  const body = await request.json();

  // Only owner can change title, isPublic, publicSlug
  const ownerOnly =
    body.title !== undefined ||
    body.isPublic !== undefined;

  if (ownerOnly && !canShare(role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (body.content !== undefined && !canEdit(role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.content !== undefined)
      data.content = body.content === null ? Prisma.JsonNull : body.content;
    if (body.isPublic !== undefined) {
      data.isPublic = body.isPublic;
      if (body.isPublic) {
        if (!planner.publicSlug) {
          let slug = generatePublicSlug();
          let exists = await prisma.planner.findUnique({ where: { publicSlug: slug } });
          while (exists) {
            slug = generatePublicSlug();
            exists = await prisma.planner.findUnique({ where: { publicSlug: slug } });
          }
          data.publicSlug = slug;
        }
      } else {
        data.publicSlug = null;
      }
    }

    const updated = await prisma.planner.update({
      where: { id },
      data: data as Parameters<typeof prisma.planner.update>[0]["data"],
    });

    // Broadcast content updates to real-time subscribers
    if (body.content !== undefined && pusher) {
      try {
        // Ensure content is serializable
        const contentToBroadcast = updated.content === null ? null : updated.content;
        
        const payload = {
          content: contentToBroadcast,
          userId: user.id,
          timestamp: Date.now(),
        };

        // Broadcast to both private (authenticated) and public (guests) channels
        await Promise.all([
          pusher.trigger(`private-planner-${id}`, "content-update", payload),
          pusher.trigger(`public-planner-${id}`, "content-update", payload),
        ]);
      } catch (error) {
        // Log but don't fail the request if Pusher fails
        console.error("❌ Failed to broadcast content update:", error);
      }
    }

    return NextResponse.json({ planner: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// Duplicate a planner (owner only)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const result = await getPlannerWithAccess(id, user);
  if (!result || result.role !== "owner") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const planner = result.planner;
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

// Delete a planner (owner only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const result = await getPlannerWithAccess(id, user);
  if (!result || result.role !== "owner") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.planner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
