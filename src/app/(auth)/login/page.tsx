"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Connection error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] mb-8 text-center">
        Welcome back
      </h2>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="identifier"
          type="text"
          required
          className="w-full h-14 px-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-base placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
          placeholder="Email or username"
        />

        <input
          name="password"
          type="password"
          required
          className="w-full h-14 px-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-base placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
          placeholder="Password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-[var(--foreground)] text-[var(--background)] text-base font-medium rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[var(--foreground)] hover:underline font-medium"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
