"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const Whiteboard = dynamic(
  () => import("@/components/Whiteboard").then((mod) => mod.Whiteboard),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--foreground)] animate-spin" />
        </div>
      </div>
    ),
  }
);

interface PlannerCanvasProps {
  plannerId: string;
  plannerTitle: string;
  initialContent: Record<string, unknown> | null;
}

export function PlannerCanvas({
  plannerId,
  plannerTitle,
  initialContent,
}: PlannerCanvasProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--background)]">
      {/* Top bar */}
      <div className="h-12 border-b border-[var(--border)] bg-[var(--card)] flex items-center px-4 gap-3 shrink-0 z-[60]">
        <Link
          href="/dashboard"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--muted)] transition-colors"
        >
          <svg
            className="w-4 h-4 text-[var(--muted-foreground)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="h-5 w-px bg-[var(--border)]" />
        <span className="text-sm font-medium text-[var(--foreground)] truncate">
          {plannerTitle}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-[var(--muted-foreground)]">Auto-saving</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <Whiteboard plannerId={plannerId} initialContent={initialContent} />
      </div>
    </div>
  );
}
