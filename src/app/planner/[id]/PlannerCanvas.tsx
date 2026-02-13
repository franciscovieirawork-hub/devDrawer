"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [title, setTitle] = useState(plannerTitle);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(plannerTitle);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(plannerTitle);
    setRenameValue(plannerTitle);
  }, [plannerTitle]);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  async function handleRenameSave() {
    const newTitle = renameValue.trim();
    if (!newTitle || newTitle === title) {
      setIsRenaming(false);
      setRenameValue(title);
      return;
    }

    try {
      const res = await fetch(`/api/planner/${plannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      if (res.ok) {
        const data = await res.json();
        setTitle(data.planner.title);
      }
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleDuplicate() {
    setIsDuplicating(true);
    try {
      const res = await fetch(`/api/planner/${plannerId}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/planner/${data.planner.id}`);
      }
    } finally {
      setIsDuplicating(false);
    }
  }

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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
        <div className="h-5 w-px bg-[var(--border)]" />

        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameSave();
              } else if (e.key === "Escape") {
                setIsRenaming(false);
                setRenameValue(title);
              }
            }}
            className="flex-1 px-2 py-1 text-sm font-medium text-[var(--foreground)] bg-[var(--background)] border border-[var(--accent)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder={title}
          />
        ) : (
          <>
            <span className="text-sm font-medium text-[var(--foreground)] truncate flex-1">
              {title}
            </span>
            <button
              onClick={() => setIsRenaming(true)}
              className="h-7 px-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded transition-colors"
              title="Rename"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-4.5A2.25 2.25 0 019 18.75V15m4.5-4.5L18 14"
                />
              </svg>
            </button>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="h-7 px-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded transition-colors disabled:opacity-50"
              title="Duplicate"
            >
              {isDuplicating ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent border-t-current animate-spin" />
              ) : (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 01-1.5-.124M9.375 17.25v-3.375c0-.621.504-1.125 1.125-1.125h3.375c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125h-3.375a1.125 1.125 0 01-1.125-1.125z"
                  />
                </svg>
              )}
            </button>
          </>
        )}

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
