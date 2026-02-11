"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
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
        Create account
      </h2>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="username"
          type="text"
          required
          minLength={3}
          className="w-full h-14 px-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-base placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
          placeholder="Username"
        />

        <input
          name="email"
          type="email"
          required
          className="w-full h-14 px-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-base placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
          placeholder="Email"
        />

        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full h-14 px-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-base placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
          placeholder="Password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-[var(--foreground)] text-[var(--background)] text-base font-medium rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--foreground)] hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
