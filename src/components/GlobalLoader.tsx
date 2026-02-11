"use client";

import { useAppStore } from "@/store/app";

export function GlobalLoader() {
  const isLoading = useAppStore((s) => s.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin" />
        </div>
        <p className="text-sm text-[var(--muted-foreground)] animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
