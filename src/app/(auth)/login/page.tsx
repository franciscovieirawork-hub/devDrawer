"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@/hooks/useForm";

const initialValues = { identifier: "", password: "" };

export default function LoginPage() {
  const router = useRouter();
  const form = useForm({
    initialValues,
    onSubmit: async (values) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: values.identifier,
          password: values.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        form.setError(data.error || "Something went wrong.");
        return;
      }
      // Force full page reload to ensure cookie is available
      window.location.href = "/dashboard";
    },
  });

  return (
    <div className="w-full">
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">
          Welcome back
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Sign in to continue to your workspace
        </p>
      </div>

      {form.error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center lg:text-left">
          {form.error}
        </div>
      )}

      <form onSubmit={form.handleSubmit} className="space-y-4">
        <div>
          <input
            name="identifier"
            type="text"
            value={form.values.identifier}
            onChange={form.handleChange("identifier")}
            className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
            placeholder="Email or username"
          />
        </div>

        <div>
          <input
            name="password"
            type="password"
            value={form.values.password}
            onChange={form.handleChange("password")}
            className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
            placeholder="Password"
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={form.loading}
          className="w-full h-12 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
        >
          {form.loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
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
