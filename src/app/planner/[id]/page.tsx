import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlannerWithAccess, canEdit } from "@/lib/planner-access";
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

  const result = await getPlannerWithAccess(id, user);

  if (!result) {
    notFound();
  }

  const { planner, role } = result;
  const content = planner.content as Record<string, unknown> | null;
  const readOnly = !canEdit(role);

  return (
    <PlannerCanvas
      plannerId={planner.id}
      plannerTitle={planner.title}
      initialContent={content}
      role={role}
      readOnly={readOnly}
      isPublic={planner.isPublic ?? false}
      publicSlug={planner.publicSlug ?? null}
      currentUser={{
        id: user.id,
        displayName: user.username || user.email,
      }}
    />
  );
}
