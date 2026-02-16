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

interface PublicPlannerViewProps {
  plannerId: string;
  title: string;
  initialContent: Record<string, unknown> | null;
}

export function PublicPlannerView({ plannerId, title, initialContent }: PublicPlannerViewProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--background)]">
      <div className="h-12 border-b border-[var(--border)] bg-[var(--card)] flex items-center px-4 gap-3 shrink-0 z-[60]">
        <Link
          href="/"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--muted)] transition-colors"
          title="Home"
        >
          <svg
            className="w-4 h-4 text-[var(--muted-foreground)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </Link>
        <div className="h-5 w-px bg-[var(--border)]" />
        <span className="text-sm font-medium text-[var(--foreground)] truncate flex-1">
          {title}
        </span>
        <span className="text-[11px] text-[var(--muted-foreground)] px-2 py-0.5 rounded bg-[var(--muted)]">
          View only
        </span>
        <ThemeToggle />
      </div>
      <div className="flex-1 relative">
        <Whiteboard
          plannerId={plannerId}
          initialContent={initialContent}
          readOnly={true}
        />
      </div>
    </div>
  );
}
