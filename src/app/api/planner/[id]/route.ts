import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

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

  if (!planner) {
    return NextResponse.json({ error: "Planner not found." }, { status: 404 });
  }

  if (planner.userId !== user.id) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  await prisma.planner.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
