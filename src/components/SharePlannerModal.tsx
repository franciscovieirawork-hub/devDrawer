"use client";

import { useState, useEffect, useRef } from "react";

interface ShareEntry {
  id: string;
  userId: string;
  role: string;
  username: string | null;
  email: string | null;
  createdAt?: string;
}

interface SharePlannerModalProps {
  plannerId: string;
  isPublic: boolean;
  publicSlug: string | null;
  onClose: () => void;
  onTogglePublic?: (isPublic: boolean, publicSlug?: string | null) => void;
}

export function SharePlannerModal({
  plannerId,
  isPublic,
  publicSlug,
  onClose,
  onTogglePublic,
}: SharePlannerModalProps) {
  const [publicLink, setPublicLink] = useState("");
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [loadingShares, setLoadingShares] = useState(true);
  const [isPublicLoading, setIsPublicLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [shareRole, setShareRole] = useState<"viewer" | "editor">("viewer");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPublicLink(
        `${window.location.origin}/planner/p/${publicSlug || ""}`
      );
    }
  }, [publicSlug]);

  useEffect(() => {
    async function fetchShares() {
      try {
        const res = await fetch(`/api/planner/${plannerId}/share`);
        if (res.ok) {
          const data = await res.json();
          setShares(data.shares || []);
        }
      } finally {
        setLoadingShares(false);
      }
    }
    fetchShares();
  }, [plannerId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  async function handleTogglePublic() {
    setIsPublicLoading(true);
    try {
      const res = await fetch(`/api/planner/${plannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (res.ok) {
        const data = await res.json();
        onTogglePublic?.(data.planner.isPublic, data.planner.publicSlug ?? null);
        if (data.planner.publicSlug) {
          setPublicLink(
            `${window.location.origin}/planner/p/${data.planner.publicSlug}`
          );
        }
      }
    } finally {
      setIsPublicLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function handleAddShare(e: React.FormEvent) {
    e.preventDefault();
    const value = identifier.trim();
    if (!value) return;

    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch(`/api/planner/${plannerId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: value, role: shareRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error || "Failed to add.");
        return;
      }

      setShares((prev) => [
        ...prev,
        {
          id: data.share.id,
          userId: data.share.userId,
          role: data.share.role,
          username: data.share.username,
          email: data.share.email,
        },
      ]);
      setIdentifier("");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleRemoveShare(userId: string) {
    try {
      const res = await fetch(
        `/api/planner/${plannerId}/share?userId=${encodeURIComponent(userId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setShares((prev) => prev.filter((s) => s.userId !== userId));
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            Share
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
          {/* Anyone with the link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-[var(--foreground)]">
                Anyone with the link can view
              </span>
              <button
                type="button"
                disabled={isPublicLoading}
                onClick={handleTogglePublic}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  isPublic ? "bg-[var(--accent)]" : "bg-[var(--muted)]"
                } ${isPublicLoading ? "opacity-50" : ""}`}
              >
                <span
                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    isPublic ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {isPublic && publicSlug && (
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicLink}
                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)]"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="shrink-0 rounded-lg bg-[var(--muted)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]/80"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>

          {/* Share with people */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-[var(--foreground)]">
              People with access
            </span>
            <form onSubmit={handleAddShare} className="flex gap-2">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or username"
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <select
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value as "viewer" | "editor")}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm text-[var(--foreground)]"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button
                type="submit"
                disabled={addLoading || !identifier.trim()}
                className="rounded-lg bg-[var(--foreground)] px-3 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:opacity-50"
              >
                {addLoading ? "..." : "Add"}
              </button>
            </form>
            {addError && (
              <p className="text-xs text-red-500">{addError}</p>
            )}

            {loadingShares ? (
              <p className="text-xs text-[var(--muted-foreground)]">Loading...</p>
            ) : (
              <ul className="space-y-1">
                {shares.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    <span className="text-[var(--foreground)]">
                      {s.username || s.email || "—"} <span className="text-[var(--muted-foreground)]">({s.role})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveShare(s.userId)}
                      className="text-[var(--muted-foreground)] hover:text-red-500"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
