"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@/hooks/useForm";
import { validatePassword } from "@/lib/password-validation-client";
import { isValidEmail } from "@/lib/email-validation-client";

interface User {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
}

const initialValues = {
  username: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function validate(values: typeof initialValues) {
  const errors: Partial<Record<keyof typeof initialValues, string>> = {};
  if (values.username?.length && values.username.length < 3)
    errors.username = "Username must be at least 3 characters.";
  if (values.email && !isValidEmail(values.email))
    errors.email = "Please enter a valid email address.";
  if (values.newPassword) {
    if (values.newPassword !== values.confirmPassword)
      errors.confirmPassword = "New passwords don't match.";
    else {
      const p = validatePassword(values.newPassword);
      if (!p.isValid) errors.newPassword = p.error || "Invalid password.";
    }
  }
  return errors;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [success, setSuccess] = useState("");

  const form = useForm({
    initialValues,
    validate,
    onSubmit: async (values) => {
      const updateData: Record<string, string> = {};
      if (user && values.username !== user.username)
        updateData.username = values.username;
      if (user && values.email !== user.email) updateData.email = values.email;
      if (values.newPassword) {
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();

      if (!res.ok) {
        form.setError(data.error || "Something went wrong.");
        return;
      }

      setUser(data.user);
      setSuccess("Profile updated successfully.");
      form.setValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
  });

  const setFormValues = form.setValues;
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setFormValues({
          username: data.user.username,
          email: data.user.email,
        });
      } catch {
        router.push("/login");
      } finally {
        setLoadingState(false);
      }
    }
    fetchProfile();
  }, [router, setFormValues]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--foreground)] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 overflow-y-auto">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-8">
          Profile Settings
        </h2>

        {form.error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
            {form.error}
          </div>
        )}

        {success && (
          <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-sm">
            {success}
          </div>
        )}

        <form onSubmit={form.handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Username
            </label>
            <input
              type="text"
              value={form.values.username}
              onChange={form.handleChange("username")}
              className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Email
            </label>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={form.values.email}
                onChange={form.handleChange("email")}
                className="flex-1 h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
              />
              {user?.emailVerified ? (
                <span className="text-xs text-green-500 font-medium">Verified</span>
              ) : (
                <span className="text-xs text-[var(--muted-foreground)]">Unverified</span>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={form.values.currentPassword}
                  onChange={form.handleChange("currentPassword")}
                  className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={form.values.newPassword}
                  onChange={form.handleChange("newPassword")}
                  className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                  placeholder="Minimum 10 characters (uppercase, lowercase, number, special)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={form.values.confirmPassword}
                  onChange={form.handleChange("confirmPassword")}
                  className="w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={form.loading}
            className="w-full h-11 bg-[var(--foreground)] text-[var(--background)] text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {form.loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
