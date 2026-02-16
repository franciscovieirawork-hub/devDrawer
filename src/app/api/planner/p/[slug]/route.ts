import { prisma } from "@/lib/prisma";
import { getPlannerByPublicSlug } from "@/lib/planner-access";
import { NextResponse } from "next/server";

// Get a planner by public slug (no auth required)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const planner = await getPlannerByPublicSlug(slug);
  if (!planner) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({
    planner: {
      id: planner.id,
      title: planner.title,
      description: planner.description,
      content: planner.content,
      publicSlug: planner.publicSlug,
    },
    role: "public",
  });
}
