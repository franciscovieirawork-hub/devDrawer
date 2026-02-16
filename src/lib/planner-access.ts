import { prisma } from "@/lib/prisma";

type UserLike = { id: string } | null;

export type AccessRole = "owner" | "editor" | "viewer" | "public";

export async function getPlannerWithAccess(plannerId: string, user: UserLike) {
  const planner = await prisma.planner.findUnique({
    where: { id: plannerId },
    include: {
      shares: {
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  });
  if (!planner) return null;

  if (user) {
    if (planner.userId === user.id)
      return { planner, role: "owner" as const, share: null };
    const share = planner.shares.find((s) => s.userId === user.id);
    if (share)
      return { planner, role: (share.role as "editor" | "viewer") || "viewer", share };
  }

  return null;
}

export async function getPlannerByPublicSlug(slug: string) {
  const planner = await prisma.planner.findUnique({
    where: { publicSlug: slug, isPublic: true },
  });
  return planner;
}

export function canEdit(role: AccessRole): boolean {
  return role === "owner" || role === "editor";
}

export function canShare(role: AccessRole): boolean {
  return role === "owner";
}

/** Generate a URL-safe random slug for public sharing */
export function generatePublicSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 12; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}
