"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "@/hooks/useForm";
import { validatePassword } from "@/lib/password-validation-client";

const initialValues = { password: "", confirmPassword: "" };

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues,
    validate: (values) => {
      const errors: Partial<Record<keyof typeof initialValues, string>> = {};
      if (values.password !== values.confirmPassword)
        errors.confirmPassword = "Passwords don't match.";
      else if (values.password) {
        const p = validatePassword(values.password);
        if (!p.isValid) errors.password = p.error || "Invalid password.";
      }
      return errors;
    },
    onSubmit: async (values) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        form.setError(data.error || "Something went wrong.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    },
  });

  if (success) {
    return (
      <div className="w-full text-center lg:text-left">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">
          Password reset!
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Your password has been reset. Redirecting to login...
        </p>
        <Link
          href="/login"
          className="text-sm text-[var(--foreground)] hover:underline font-medium"
        >
          Go to login
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full text-center lg:text-left">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">
          Invalid link
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-[var(--foreground)] hover:underline font-medium"
        >
          Request a new one
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[var(--foreground)] mb-2">
          Reset password
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">Enter your new password</p>
      </div>

      {form.error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center lg:text-left">
          {form.error}
        </div>
      )}

      <form onSubmit={form.handleSubmit} className="space-y-4">
        <div>
          <input
            name="password"
            type="password"
            value={form.values.password}
            onChange={form.handleChange("password")}
            className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
            placeholder="New password"
          />
        </div>

        <div>
          <input
            name="confirmPassword"
            type="password"
            value={form.values.confirmPassword}
            onChange={form.handleChange("confirmPassword")}
            className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
            placeholder="Confirm password"
          />
        </div>

        <button
          type="submit"
          disabled={form.loading}
          className="w-full h-12 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
        >
          {form.loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        <Link
          href="/login"
          className="text-[var(--foreground)] hover:underline font-medium"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
