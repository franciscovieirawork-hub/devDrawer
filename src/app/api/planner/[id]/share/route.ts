import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getPlannerWithAccess, canShare } from "@/lib/planner-access";

// List users with access (owner only)
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
  if (!result || !canShare(result.role)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const shares = await prisma.plannerShare.findMany({
    where: { plannerId: id },
    include: { user: { select: { id: true, username: true, email: true } } },
  });

  return NextResponse.json({
    shares: shares.map((s) => ({
      id: s.id,
      userId: s.userId,
      role: s.role,
      username: s.user.username,
      email: s.user.email,
      createdAt: s.createdAt,
    })),
  });
}

// Share with a user (owner only). Body: { identifier: string (email or username), role?: "viewer" | "editor" }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const result = await getPlannerWithAccess(id, user);
  if (!result || !canShare(result.role)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = await request.json();
  const identifier = (body.identifier as string)?.trim?.();
  const role = body.role === "editor" ? "editor" : "viewer";

  if (!identifier) {
    return NextResponse.json(
      { error: "Email or username is required." },
      { status: 400 }
    );
  }

  const isEmail = identifier.includes("@");
  const targetUser = await prisma.user.findUnique({
    where: isEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier.toLowerCase() },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (targetUser.id === user.id) {
    return NextResponse.json(
      { error: "You cannot share with yourself." },
      { status: 400 }
    );
  }

  try {
    const share = await prisma.plannerShare.upsert({
      where: {
        plannerId_userId: { plannerId: id, userId: targetUser.id },
      },
      create: {
        plannerId: id,
        userId: targetUser.id,
        role,
      },
      update: { role },
      include: { user: { select: { id: true, username: true, email: true } } },
    });

    return NextResponse.json(
      {
        share: {
          id: share.id,
          userId: share.userId,
          role: share.role,
          username: share.user.username,
          email: share.user.email,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// Remove share (owner only). Body: { userId: string } or userId in query
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const result = await getPlannerWithAccess(id, user);
  if (!result || !canShare(result.role)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  let userId = searchParams.get("userId");
  if (!userId) {
    try {
      const body = await request.json();
      userId = body.userId;
    } catch {
      // no body
    }
  }
  if (!userId) {
    return NextResponse.json(
      { error: "userId is required." },
      { status: 400 }
    );
  }

  await prisma.plannerShare.deleteMany({
    where: { plannerId: id, userId },
  });

  return NextResponse.json({ success: true });
}
