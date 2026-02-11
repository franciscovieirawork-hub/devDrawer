import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PlannerCanvas } from "@/app/planner/[id]/PlannerCanvas";

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

  const content = planner.content as Record<string, unknown> | null;

  return (
    <PlannerCanvas
      plannerId={planner.id}
      plannerTitle={planner.title}
      initialContent={content}
    />
  );
}
