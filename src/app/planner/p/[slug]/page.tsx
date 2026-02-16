import { notFound } from "next/navigation";
import { getPlannerByPublicSlug } from "@/lib/planner-access";
import { PublicPlannerView } from "@/app/planner/p/[slug]/PublicPlannerView";

export default async function PublicPlannerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const planner = await getPlannerByPublicSlug(slug);

  if (!planner) {
    notFound();
  }

  const content = planner.content as Record<string, unknown> | null;

  return (
    <PublicPlannerView
      plannerId={planner.id}
      title={planner.title}
      initialContent={content}
    />
  );
}
