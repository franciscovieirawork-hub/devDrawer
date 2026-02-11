import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function PlannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const planner = await prisma.planner.findUnique({
    where: { id },
  });

  if (!planner || planner.userId !== user.id) {
    notFound();
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--muted)] transition-colors"
        >
          <svg
            className="w-5 h-5 text-[var(--muted-foreground)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          {planner.title}
        </h2>
      </div>

      {/* Planner canvas placeholder */}
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-[var(--muted-foreground)] mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
            />
          </svg>
          <p className="text-[var(--muted-foreground)] font-medium">
            Your canvas
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Whiteboard tools coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
